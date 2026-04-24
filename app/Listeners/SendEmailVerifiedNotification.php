<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Verified;
use App\Services\NotificationService;
use App\Enums\NotificationType;

class SendEmailVerifiedNotification
{
    public function handle(Verified $event): void
    {
        $user = $event->user;

        app(NotificationService::class)->send(
            $user,
            title: "Email Verified",
            message: "Your email address has been verified successfully.",
            type: NotificationType::SYSTEM,
            emailSubject: null,
            emailMessage: null,
            sendEmail: false, // In-app only
            payload: [
                'action_text' => 'Dashboard',
                'action_url'  => '/my-classes',
                'priority'    => 'low',
                'icon'        => 'mail'
            ]
        );
    }
}
