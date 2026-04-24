<?php

namespace App\Console\Commands;

use App\Enums\PaymentStatus;
use App\Enums\SubscriptionStatus;
use App\Models\BatchStudent;
use App\Models\Payment;
use App\Models\PendingEnrollment;
use App\Models\StudentSubscription;
use Illuminate\Console\Command;

class ReportEnrollmentFlow extends Command
{
    protected $signature = 'app:report-enrollment-flow {--student_id=}';

    protected $description = 'Audit payment -> pending enrollment -> subscription -> batch allocation flow';

    public function handle(): int
    {
        $studentId = $this->option('student_id');

        $completedPayments = Payment::query()
            ->where('status', PaymentStatus::COMPLETED->value)
            ->when($studentId, fn($q) => $q->where('student_id', $studentId))
            ->count();

        $unresolvedPending = PendingEnrollment::query()
            ->where('resolved', false)
            ->when($studentId, fn($q) => $q->where('student_id', $studentId))
            ->count();

        $activeSubscriptions = StudentSubscription::query()
            ->where('status', SubscriptionStatus::ACTIVE->value)
            ->when($studentId, fn($q) => $q->where('student_id', $studentId))
            ->count();

        $activeBatchAllocations = BatchStudent::query()
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('ended_at')
                    ->orWhere('ended_at', '>', now());
            })
            ->when($studentId, fn($q) => $q->where('student_id', $studentId))
            ->count();

        $danglingPayments = Payment::query()
            ->with(['checkoutPlan:id,plan_id', 'student.batches'])
            ->where('status', PaymentStatus::COMPLETED->value)
            ->whereNotNull('checkout_plan_id')
            ->when($studentId, fn($q) => $q->where('student_id', $studentId))
            ->get()
            ->filter(function (Payment $payment) {
                $hasSubscription = ! is_null($payment->subscription_id);
                $hasPending = PendingEnrollment::query()
                    ->where('payment_id', $payment->id)
                    ->exists();

                $planId = optional($payment->checkoutPlan)->plan_id;
                $hasActiveBatchForPlan = false;

                if ($planId && $payment->student) {
                    $hasActiveBatchForPlan = $payment->student->batches()
                        ->where('plan_id', $planId)
                        ->wherePivot('status', 'active')
                        ->where(function ($pivotQuery) {
                            $pivotQuery->whereNull('batch_students.ended_at')
                                ->orWhere('batch_students.ended_at', '>', now());
                        })
                        ->exists();
                }

                return ! $hasSubscription && ! $hasPending && ! $hasActiveBatchForPlan;
            });
        $danglingCompletedPayments = $danglingPayments->count();

        $expiredStillActiveAllocations = BatchStudent::query()
            ->where('status', 'active')
            ->whereNotNull('ended_at')
            ->where('ended_at', '<=', now())
            ->when($studentId, fn($q) => $q->where('student_id', $studentId))
            ->count();

        $activeWithoutSubscriptionRows = BatchStudent::query()
            ->with('batch:id,plan_id')
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('ended_at')
                    ->orWhere('ended_at', '>', now());
            })
            ->whereHas('batch')
            ->when($studentId, fn($q) => $q->where('student_id', $studentId))
            ->get()
            ->filter(function ($batchStudent) {
                $planId = optional($batchStudent->batch)->plan_id;
                if (! $planId) {
                    return true;
                }

                return ! StudentSubscription::query()
                    ->where('student_id', $batchStudent->student_id)
                    ->where('plan_id', $planId)
                    ->where('status', SubscriptionStatus::ACTIVE->value)
                    ->where('end_at', '>', now())
                    ->exists();
            });
        $activeWithoutSubscription = $activeWithoutSubscriptionRows->count();

        $this->table(
            ['Metric', 'Count'],
            [
                ['Completed payments', $completedPayments],
                ['Unresolved pending enrollments', $unresolvedPending],
                ['Active subscriptions', $activeSubscriptions],
                ['Active batch allocations', $activeBatchAllocations],
                ['Completed payments missing downstream records', $danglingCompletedPayments],
                ['Expired but still active batch allocations', $expiredStillActiveAllocations],
                ['Active batch allocations without active subscription', $activeWithoutSubscription],
            ]
        );

        if ($danglingPayments->isNotEmpty()) {
            $this->warn('Completed payments missing downstream records (payment IDs): ' . $danglingPayments->pluck('id')->implode(', '));
        }

        if ($activeWithoutSubscriptionRows->isNotEmpty()) {
            $this->warn('Active batch allocations without active subscription (batch_student IDs): ' . $activeWithoutSubscriptionRows->pluck('id')->implode(', '));
        }

        return self::SUCCESS;
    }
}
