<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentSuccessfulMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Payment $payment
    ) {}

    public function build()
    {
        return $this
            ->subject('Payment Successful – Welcome to TutStar 🎉')
            ->markdown('emails.payments.success');
    }
}
