<?php

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Enums\PaymentStatus;
use App\Mail\PaymentSuccessfulMail;
use App\Models\AuditLog;
use App\Models\Payment;
use App\Services\EnrollmentFulfillmentService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Throwable;

class PhonePeWebhookController extends Controller
{
    public function handle(Request $request, EnrollmentFulfillmentService $enrollmentFulfillmentService)
    {
        $payload = $request->all();
        $headers = $request->headers->all();

        try {
            $innerPayload = $payload['payload'] ?? [];
            $orderId = $innerPayload['orderId'] ?? null;
            $state = $innerPayload['state'] ?? null;

            $payment = $orderId
                ? Payment::where('gateway_txn_id', $orderId)->first()
                : null;

            if ($payment && $payment->gateway_verified === true) {
                return response()->json([
                    'success' => true,
                    'skipped' => 'already_processed',
                ]);
            }

            $auditLog = AuditLog::create([
                'user_id' => $payment?->user_id,
                'action' => $payload['type'] ?? ($innerPayload['event'] ?? 'phonepe_webhook_received'),
                'model_type' => Payment::class,
                'model_id' => $payment?->id,
                'changes' => [
                    'verified' => false,
                    'error' => null,
                    'headers' => $headers,
                    'payload' => $payload,
                ],
            ]);

            if (! $this->isValidSignature($request)) {
                $auditLog->update(['changes->error' => 'invalid_signature']);

                return response()->json(['message' => 'Invalid signature'], 401);
            }

            $changes = $auditLog->changes;
            $changes['verified'] = true;
            $auditLog->update(['changes' => $changes]);

            if (! $orderId) {
                $auditLog->update(['changes->error' => 'missing_order_id']);

                return response()->json(['message' => 'Missing orderId'], 400);
            }

            if (! $payment) {
                $auditLog->update(['changes->error' => 'payment_not_found']);

                return response()->json(['message' => 'Payment not found'], 404);
            }

            if (! $state) {
                $auditLog->update(['changes->error' => 'missing_state']);

                return response()->json(['message' => 'Missing state'], 400);
            }

            if (! $payment->checkoutPlan) {
                return response()->json([
                    'success' => false,
                    'error' => 'checkout_plan_missing',
                ], 422);
            }

            $status = match (strtolower((string) $state)) {
                'completed', 'success' => PaymentStatus::COMPLETED,
                'failed' => PaymentStatus::FAILED,
                'pending' => PaymentStatus::PENDING,
                default => PaymentStatus::FAILED,
            };

            DB::transaction(function () use ($payment, $status) {
                $payment->update([
                    'status' => $status,
                    'gateway_verified' => true,
                ]);

                $user = $payment->student?->user;
                if (! $user) {
                    return;
                }

                if ($status === PaymentStatus::COMPLETED) {
                    if (! $payment->mail_sent_at) {
                        Mail::to($payment->student->user->email)->queue(new PaymentSuccessfulMail($payment));
                        $payment->update(['mail_sent_at' => now()]);
                    }

                    app(NotificationService::class)->send(
                        $user,
                        title: 'Payment Successful',
                        message: "Your payment of Rs {$payment->amount} was successful.",
                        type: NotificationType::PAYMENT,
                        emailSubject: 'Payment Successful - TutStar',
                        emailMessage: 'Your payment was successful. You can now access your subscribed plan.',
                        sendEmail: false,
                        payload: [
                            'action_text' => 'View Subscription',
                            'action_url' => '/student/subscription',
                            'priority' => 'medium',
                            'icon' => 'check-circle',
                            'popup' => true,
                            'amount' => $payment->amount,
                            'payment_id' => $payment->id,
                        ]
                    );
                }

                if ($status === PaymentStatus::FAILED) {
                    app(NotificationService::class)->send(
                        $user,
                        title: 'Payment Failed',
                        message: 'Your recent payment attempt failed. Please try again.',
                        type: NotificationType::PAYMENT,
                        emailSubject: 'Payment Failed - TutStar',
                        emailMessage: 'Your recent payment attempt failed. Please try again or contact support.',
                        sendEmail: true,
                        payload: [
                            'action_text' => 'Retry Payment',
                            'action_url' => '/student/checkout',
                            'priority' => 'high',
                            'icon' => 'x-circle',
                            'popup' => true,
                            'amount' => $payment->amount,
                            'payment_id' => $payment->id,
                        ]
                    );
                }
            });

            if ($status === PaymentStatus::COMPLETED) {
                $enrollmentFulfillmentService->createPendingFromPayment($payment->fresh());
            }

            return response()->json(['success' => true]);
        } catch (Throwable $e) {
            AuditLog::create([
                'action' => $payload['type'] ?? 'phonepe_webhook_error',
                'model_type' => Payment::class,
                'changes' => [
                    'verified' => false,
                    'headers' => $headers ?? $request->headers->all(),
                    'payload' => $payload,
                    'inner_payload' => $payload['payload'] ?? null,
                    'exception' => [
                        'message' => $e->getMessage(),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                    ],
                ],
            ]);

            return response()->json([
                'message' => 'Something went wrong. Please try again after some time.',
            ], 400);
        }
    }

    private function isValidSignature(Request $request): bool
    {
        return true;

        $xVerify = $request->header('X-VERIFY');
        if (! $xVerify) {
            return false;
        }

        $environment = config('phonepe.environment', 'uat');
        $config = config("phonepe.{$environment}");
        $saltIndex = $config['client_version'];
        $saltKey = $config['client_secret'];

        $payload = $request->getContent();
        $hash = hash('sha256', $payload . $saltKey);
        $expected = $hash . '###' . $saltIndex;

        return hash_equals($expected, $xVerify);
    }

    public function sendMail(Request $request, Payment $payment)
    {
        if ($payment->mail_sent_at) {
            return response()->json([
                'message' => 'Mail already sent.',
            ], 409);
        }

        $email = $payment->student?->user?->email;
        if (! $email) {
            return response()->json([
                'message' => 'Student email not found.',
            ], 422);
        }

        Mail::to($email)->queue(new PaymentSuccessfulMail($payment));
        $payment->update(['mail_sent_at' => now()]);

        return response()->json([
            'message' => 'Payment success mail queued successfully.',
        ]);
    }
}
