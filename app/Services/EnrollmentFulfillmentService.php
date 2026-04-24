<?php

namespace App\Services;

use App\Enums\SubscriptionStatus;
use App\Models\AuditLog;
use App\Enums\PaymentStatus;
use App\Models\BatchStudent;
use App\Models\Payment;
use App\Models\PendingEnrollment;
use App\Models\StudentSubscription;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class EnrollmentFulfillmentService
{
    public function createPendingFromPayment(Payment $payment): ?PendingEnrollment
    {
        $result = $this->fulfillFromCompletedPayment($payment);

        return $result['pending_enrollment'] ?? null;
    }

    public function fulfillFromCompletedPayment(Payment $payment): array
    {
        $payment->loadMissing('checkoutPlan');

        if (
            ! $payment->student_id ||
            ! $payment->checkout_plan_id ||
            ! $payment->checkoutPlan ||
            $payment->status !== PaymentStatus::COMPLETED
        ) {
            return [
                'action' => 'skipped',
                'reason' => 'payment_not_eligible',
            ];
        }

        $alreadyFulfilled = AuditLog::query()
            ->where('action', 'payment_fulfilled')
            ->where('model_type', Payment::class)
            ->where('model_id', $payment->id)
            ->exists();

        if ($alreadyFulfilled) {
            return [
                'action' => 'skipped',
                'reason' => 'already_fulfilled',
            ];
        }

        return DB::transaction(function () use ($payment) {
            $payment->loadMissing('checkoutPlan.plan');

            $months = max(1, (int) ($payment->checkoutPlan->months ?? 1));
            $planId = (int) $payment->checkoutPlan->plan_id;
            $studentId = (int) $payment->student_id;
            $now = now();

            $activePlanSubscriptions = StudentSubscription::query()
                ->where('student_id', $studentId)
                ->where('plan_id', $planId)
                ->where('status', SubscriptionStatus::ACTIVE->value)
                ->where('end_at', '>=', $now)
                ->orderByDesc('end_at')
                ->get();

            $isRenewal = $activePlanSubscriptions->isNotEmpty();
            $subscription = $isRenewal
                ? $activePlanSubscriptions->first()
                : $this->createFreshSubscription($payment, $planId, $months, $now);

            if ($isRenewal) {
                $subscription = $this->extendSubscription($subscription, $months, (float) $payment->amount);
            }

            if ((int) $payment->subscription_id !== (int) $subscription->id) {
                $payment->update(['subscription_id' => $subscription->id]);
            }

            $extendedBatchRows = $this->extendActiveBatchAllocations($studentId, $planId, $months, $now);
            $pendingEnrollment = null;

            if ($extendedBatchRows === 0) {
                $pendingEnrollment = $this->createOrGetPendingEnrollment($payment, $planId);
            }

            AuditLog::create([
                'user_id' => $payment->created_by,
                'action' => 'payment_fulfilled',
                'model_type' => Payment::class,
                'model_id' => $payment->id,
                'changes' => [
                    'payment_id' => $payment->id,
                    'student_id' => $studentId,
                    'checkout_plan_id' => $payment->checkout_plan_id,
                    'plan_id' => $planId,
                    'months' => $months,
                    'mode' => $isRenewal ? 'renewal' : 'new',
                    'subscription_id' => $subscription->id,
                    'subscription_end_at' => optional($subscription->end_at)->toDateTimeString(),
                    'extended_batch_rows' => $extendedBatchRows,
                    'pending_enrollment_id' => $pendingEnrollment?->id,
                ],
            ]);

            return [
                'action' => $isRenewal ? 'renewed' : 'new_subscription',
                'subscription' => $subscription,
                'extended_batch_rows' => $extendedBatchRows,
                'pending_enrollment' => $pendingEnrollment,
            ];
        });
    }

    private function createFreshSubscription(Payment $payment, int $planId, int $months, Carbon $now): StudentSubscription
    {
        return StudentSubscription::create([
            'student_id' => $payment->student_id,
            'plan_id' => $planId,
            'start_at' => $now,
            'end_at' => $now->copy()->addMonths($months),
            'status' => SubscriptionStatus::ACTIVE->value,
            'auto_renew' => false,
            'price_paid' => (float) $payment->amount,
            'phonepe_order_id' => $payment->gateway_txn_id,
        ]);
    }

    private function extendSubscription(StudentSubscription $subscription, int $months, float $amount): StudentSubscription
    {
        $baseEndAt = $subscription->end_at && $subscription->end_at->isFuture()
            ? $subscription->end_at->copy()
            : now();

        $subscription->update([
            'end_at' => $baseEndAt->addMonths($months),
            'status' => SubscriptionStatus::ACTIVE->value,
            'price_paid' => (float) $subscription->price_paid + $amount,
        ]);

        return $subscription->fresh();
    }

    private function extendActiveBatchAllocations(int $studentId, int $planId, int $months, Carbon $now): int
    {
        $activeRows = BatchStudent::query()
            ->where('student_id', $studentId)
            ->where('status', 'active')
            ->where(function ($query) use ($now) {
                $query->whereNull('ended_at')
                    ->orWhere('ended_at', '>', $now);
            })
            ->whereHas('batch', fn($query) => $query->where('plan_id', $planId))
            ->get();

        foreach ($activeRows as $row) {
            $baseEndAt = $row->ended_at && $row->ended_at->isFuture()
                ? $row->ended_at->copy()
                : $now->copy();
            $row->update([
                'ended_at' => $baseEndAt->addMonths($months),
                'status' => 'active',
            ]);
        }

        return $activeRows->count();
    }

    private function createOrGetPendingEnrollment(Payment $payment, int $planId): ?PendingEnrollment
    {
        $existingByPayment = PendingEnrollment::query()
            ->where('payment_id', $payment->id)
            ->first();

        if ($existingByPayment) {
            return $existingByPayment;
        }

        return PendingEnrollment::create([
            'student_id' => $payment->student_id,
            'payment_id' => $payment->id,
            'plan_id' => $planId,
            'checkout_plan_id' => $payment->checkout_plan_id,
        ]);
    }
}
