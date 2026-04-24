<?php

namespace App\Http\Controllers;

use App\Enums\PaymentGateway;
use App\Enums\PaymentStatus;
use App\Models\CheckoutPlan;
use App\Models\Payment;
use App\Services\EnrollmentFulfillmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Yogeshgupta\PhonepeLaravel\PhonePePayment;

use App\Services\NotificationService;
use App\Enums\NotificationType;

class PhonePePaymentController extends Controller
{
    // Called by React – create PhonePe checkout session
    public function create(Request $request)
    {
        $data = $request->validate([
            'checkout_plan_id' => 'required|exists:checkout_plans,id',
        ]);

        $checkoutPlan = CheckoutPlan::with([
            'plan.offers',
            'offers'
        ])->findOrFail($data['checkout_plan_id']);

        $plan = $checkoutPlan->plan;
        $basePrice = $plan->price;
        $months = $checkoutPlan->months;

        // Base Fees
        $baseFees = $basePrice * $months;

        $now = now();
        $checkoutDiscount = 0;
        $planDiscount = 0;

        // CheckoutPlan Offer
        $activeCpOffer = $checkoutPlan->offers()
            ->where('active', true)
            ->where('starts_at', '<=', $now)
            ->where('ends_at', '>=', $now)
            ->first();

        if ($activeCpOffer) {
            if ($activeCpOffer->type === 'percentage') {
                $checkoutDiscount = ($baseFees * $activeCpOffer->value) / 100;
            } else {
                $checkoutDiscount = $activeCpOffer->value;
            }
        }

        // Main Plan Offer
        $activePlanOffer = $plan->offers()
            ->where('active', true)
            ->where('starts_at', '<=', $now)
            ->where('ends_at', '>=', $now)
            ->first();

        if ($activePlanOffer) {
            if ($activePlanOffer->type === 'percentage') {
                $planDiscount = ($baseFees * $activePlanOffer->value) / 100;
            } else {
                $planDiscount = $activePlanOffer->value;
            }
        }

        // Final Price
        $amount = round($baseFees - $checkoutDiscount - $planDiscount);
        $amountPaise = $amount * 100;

        // $amount = (float) $selectedPlan['price'];
        // $amountPaise = (int) round($amount * 100);
        // dd($amountPaise);

        // PhonePe reference ID
        $referenceId = 'ORD-' . now()->timestamp . '-' . Str::upper(Str::random(6));
        // Create payment record
        $payment = Payment::create([
            'student_id'       => auth()->user()->student->id,
            'checkout_plan_id' => $checkoutPlan->id,
            'amount'           => $amount,
            'gateway'          => PaymentGateway::PHONEPE,
            'status'           => PaymentStatus::PENDING,
            'created_by'       => auth()->id(),
        ]);

        // 🔔 Send Pending Payment Notification
        $user = auth()->user();

        app(NotificationService::class)->send(
            $user,
            title: "Payment Initiated",
            message: "Your payment request of ₹{$amount} has been initiated and is being processed.",
            type: NotificationType::PAYMENT,
            sendEmail: false, // No email for pending
            payload: [
                'action_text' => 'View Payment Status',
                'action_url'  => '/student/payments',
                'priority'    => 'low',
                'icon'        => 'clock',
                'popup'       => true,
                'payment_id'  => $payment->id,
                'amount'      => $amount,
                'status'      => 'pending'
            ]
        );
        // Initiate PhonePe Checkout
        $phonepe = new PhonePePayment();
        $result = $phonepe->initiatePayment($amountPaise, $referenceId);

        if (!($result['success'] ?? false)) {
            $payment->update([
                'status'           => PaymentStatus::FAILED,
                'gateway_response' => $result,
            ]);

            return response()->json([
                'message' => $result['message'] ?? 'Unable to initiate PhonePe payment.'
            ], 422);
        }

        // Save full response safely
        $payment->update([
            'gateway_txn_id'    => $result['orderId'] ?? null,
            'gateway_response' => $result,
        ]);

        if (!empty($result['merchantOrderId'])) {
            $request->session()->put('phonepe_last_order_id', $result['merchantOrderId']);
        }

        return redirect()->away($result['redirectUrl']);
    }

    // Redirect target after PhonePe checkout (PHONEPE_REDIRECT_URL)
    public function process(Request $request, EnrollmentFulfillmentService $enrollmentFulfillmentService)
    {
        $referenceId = $request->input('merchantOrderId')
            ?? $request->input('orderId')
            ?? $request->query('merchantOrderId')
            ?? $request->query('orderId');

        if (! $referenceId) {
            $referenceId = $request->session()->get('phonepe_last_order_id');
        }

        if (! $referenceId) {
            abort(400, 'Reference missing');
        }

        $payment = Payment::where('gateway', PaymentGateway::PHONEPE)
            ->where('gateway_txn_id', $referenceId)
            ->latest()
            ->firstOrFail();

        // verify status from PhonePe API
        $phonepe = new PhonePePayment();
        $result = $phonepe->verifyPhonePePayment($referenceId);

        if (!($result['success'] ?? false)) {
            $payment->update([
                'status'           => PaymentStatus::FAILED,
                'gateway_response' => $result,
                'gateway_verified' => false,
            ]);

            return inertia('Payments/Result', [
                'status' => 'failed',
                'payment' => $payment,
            ]);
        }

        $status = strtolower((string) data_get($result, 'data.state', 'failed'));
        $resolvedStatus = $status === 'success' || $status === 'completed'
            ? PaymentStatus::COMPLETED
            : ($status === 'pending' ? PaymentStatus::PENDING : PaymentStatus::FAILED);

        $payment->update([
            'status'           => $resolvedStatus,
            'gateway_txn_id'   => data_get($result, 'data.transactionId'),
            'gateway_verified' => true,
            'gateway_response' => $result,
        ]);

        if ($resolvedStatus === PaymentStatus::COMPLETED) {
            $enrollmentFulfillmentService->createPendingFromPayment($payment->fresh());
        }

        if ($resolvedStatus === PaymentStatus::COMPLETED) {
            return redirect()->route('dashboard')->with('success', 'Payment successful.');
        }

        return inertia('Payments/Result', [
            'status' => $status,
            'payment' => $payment,
        ]);
    }


    public function status(string $merchantOrderId, EnrollmentFulfillmentService $enrollmentFulfillmentService)
    {
        $payment = Payment::where('gateway_txn_id', $merchantOrderId)->firstOrFail();
        $phonepe = new PhonePePayment();
        $result = $phonepe->verifyPhonePePayment($merchantOrderId);

        // update DB if required
        if ($result['success'] ?? false) {
            $status = strtolower((string) data_get($result, 'data.state', 'pending'));
            $resolvedStatus = $status === 'success' || $status === 'completed'
                ? PaymentStatus::COMPLETED
                : ($status === 'pending' ? PaymentStatus::PENDING : PaymentStatus::FAILED);

            $payment->update([
                'status' => $resolvedStatus,
                'gateway_txn_id' => data_get($result, 'data.transactionId', $payment->gateway_txn_id),
                'gateway_verified' => true,
                'gateway_response' => $result,
            ]);

            if ($resolvedStatus === PaymentStatus::COMPLETED) {
                $enrollmentFulfillmentService->createPendingFromPayment($payment->fresh());
            }
        }

        return response()->json([
            'payment' => $payment,
            'raw'     => $result,
        ]);
    }
}
