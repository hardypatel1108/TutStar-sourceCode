<?php

namespace App\Listeners;

use Illuminate\Auth\Events\PasswordReset;
use App\Services\NotificationService;
use App\Enums\NotificationType;

class SendPasswordChangedNotification
{
    public function handle(PasswordReset $event): void
    {
        $user = $event->user;
        app(NotificationService::class)->send(
            $user,
            title: "Password Updated",
            message: "Your account password has been changed successfully.",
            type: NotificationType::SYSTEM,
            emailSubject: "Your Password Was Changed",
            emailMessage: "Your account password has been changed successfully. If this wasn’t you, please contact support immediately.",
            sendEmail: true,
            viewName: "emails.password-changed",
            payload: [
                'action_text' => 'Review Security',
                'action_url'  => '/forgot-password',
                'priority'    => 'medium',
                'icon'        => 'key'
            ]
        );
    }
}
