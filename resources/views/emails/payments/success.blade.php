@component('mail::message')
    # 🎉 Payment Successful!

    Hi {{ $payment->student->user->name }},

    We’ve successfully received your payment.

    ---

    ### 💳 Payment Details
    - **Amount:** ₹{{ number_format($payment->amount, 2) }}
    - **Transaction ID:** {{ $payment->gateway_txn_id }}
    - **Payment Date:** {{ $payment->created_at->format('d M Y, h:i A') }}

    @if ($payment->checkoutPlan)
        ### 📦 Subscription Plan
        - **Plan:** {{ $payment->checkoutPlan->title }}
        - **Duration:** {{ $payment->checkoutPlan->months }} month(s)
    @endif

    ---

    Your batch allocation is being processed.
    You’ll get access shortly 🚀

    @component('mail::button', ['url' => config('app.url')])
        Go to Dashboard
    @endcomponent

    Thanks,
    **TutStar Team**
@endcomponent
