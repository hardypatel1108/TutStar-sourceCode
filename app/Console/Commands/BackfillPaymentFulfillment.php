<?php

namespace App\Console\Commands;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Services\EnrollmentFulfillmentService;
use Illuminate\Console\Command;

class BackfillPaymentFulfillment extends Command
{
    protected $signature = 'app:backfill-payment-fulfillment {--student_id=} {--payment_id=}';

    protected $description = 'Backfill downstream fulfillment for completed payments';

    public function handle(EnrollmentFulfillmentService $service): int
    {
        $studentId = $this->option('student_id');
        $paymentId = $this->option('payment_id');

        $payments = Payment::query()
            ->where('status', PaymentStatus::COMPLETED->value)
            ->when($studentId, fn($q) => $q->where('student_id', $studentId))
            ->when($paymentId, fn($q) => $q->where('id', $paymentId))
            ->orderBy('id')
            ->get();

        if ($payments->isEmpty()) {
            $this->info('No completed payments found for backfill.');
            return self::SUCCESS;
        }

        $processed = 0;
        $renewed = 0;
        $new = 0;
        $skipped = 0;

        foreach ($payments as $payment) {
            $result = $service->fulfillFromCompletedPayment($payment);
            $processed++;

            if (($result['action'] ?? null) === 'renewed') {
                $renewed++;
                continue;
            }

            if (($result['action'] ?? null) === 'new_subscription') {
                $new++;
                continue;
            }

            $skipped++;
        }

        $this->table(
            ['Processed', 'Renewed', 'New Subscription', 'Skipped'],
            [[$processed, $renewed, $new, $skipped]]
        );

        return self::SUCCESS;
    }
}
