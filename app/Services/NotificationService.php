<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use App\Enums\NotificationType;
use App\Mail\GenericNotificationMail;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Send in-app notification and optional email
     */
    public function send(
        User $user,
        string $title,
        string $message,
        NotificationType $type = NotificationType::SYSTEM,
        ?string $emailSubject = null,
        ?string $emailMessage = null,
        bool $sendEmail = false,
        array $payload = [],
        ?string $modelType = null,
        ?int $modelId = null,
        ?string $mailClass = null,
        ?string $viewName = null
    ): Notification {

        // 1️⃣ Store in database
        $notification = Notification::create([
            'user_id' => $user->id,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'payload' => $payload,
            'is_read' => false,
        ]);

        // 2️⃣ Send email if needed
        if ($sendEmail) {
            // ✅ If specific Mail class provided
            if ($mailClass && class_exists($mailClass)) {
                Mail::to($user->email)->send(
                    new $mailClass($user, $payload)
                );
            }

            // ✅ If custom Blade view provided
            elseif ($viewName) {
                Mail::to($user->email)->send(
                    new GenericNotificationMail(
                        $emailSubject ?? $title,
                        $emailMessage ?? $message,
                        $viewName,
                        $payload ?? []
                    )
                );
            }

            // ✅ Default fallback
            else {
                Mail::to($user->email)->send(
                    new GenericNotificationMail(
                        $emailSubject ?? $title,
                        $emailMessage ?? $message
                    )
                );
            }
            // Mail::to($user->email)->send(
            //     new GenericNotificationMail(
            //         $emailSubject ?? $title,
            //         $emailMessage ?? $message,
            //         $payload ?? []
            //     )
            // );
        }

        return $notification;
    }
}


// test route for test notification 
// Route::get('/test-notification', function () {

//     // Change this ID to any existing user ID
//     $user = User::where('email', 'arevee0001@gmail.com')->firstOrFail();

//     if (!$user) {
//         return 'No user found in database.';
//     }

    // app(NotificationService::class)->send(
    //     $user,
    //     "Your live class has started",
    //     "Please join now.",
    //     NotificationType::EVENT,
    //     sendEmail: true
    // );

//     return "Notification sent successfully to {$user->email}";
// });