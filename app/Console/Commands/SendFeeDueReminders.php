<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\StudentSubscription;
use Carbon\Carbon;
use App\Services\NotificationService;
use App\Enums\NotificationType;

class SendFeeDueReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-fee-due-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle(NotificationService $notificationService)
    {
        $now = Carbon::now();
        $today = $now->toDateString();

        // Only run email logic at 10 AM
        $sendEmail = $now->hour == 10;

        // Only run in-app at 2 PM & 5 PM
        $sendInApp = in_array($now->hour, [14, 17]);

        if (!$sendEmail && !$sendInApp) {
            return;
        }

        $subscriptions = StudentSubscription::with('student.user')
            ->where('status', 'active')
            ->whereDate('end_at', '>', $today)
            ->get();

        foreach ($subscriptions as $subscription) {

            $dueDate = Carbon::parse($subscription->end_at);
            $daysLeft = $now->diffInDays($dueDate, false);

            $student = $subscription->student;
            $user = $student?->user;

            if (!$user) continue;

            // ==========================
            // Determine Reminder Stage
            // ==========================
            $stage = null;

            if ($daysLeft == 5 && !$subscription->reminder_5_sent) {
                $stage = 5;
            } elseif ($daysLeft == 3 && !$subscription->reminder_3_sent) {
                $stage = 3;
            } elseif ($daysLeft == 1 && !$subscription->reminder_1_sent) {
                $stage = 1;
            }

            if (!$stage) continue;

            // ==========================
            // SEND IN-APP (2 PM & 5 PM)
            // ==========================
            if ($sendInApp) {

                if (
                    !$subscription->last_in_app_reminder_at ||
                    Carbon::parse($subscription->last_in_app_reminder_at)->toDateString() !== $today
                ) {

                    $notificationService->send(
                        $user,
                        title: "Fee Due in {$stage} Day(s)",
                        message: "Your subscription will expire in {$stage} day(s). Please renew to avoid interruption.",
                        type: NotificationType::PAYMENT,
                        sendEmail: false,
                        payload: [
                            'due_date'   => $dueDate->format('d M Y'),
                            'days_left'  => $stage,
                            'action_text' => 'Renew Now',
                            'action_url' => '/student/checkout',
                            'priority'   => 'high',
                            'icon'       => 'credit-card',
                            'popup'      => true
                        ]
                    );

                    $subscription->update([
                        'last_in_app_reminder_at' => $now
                    ]);
                }
            }

            // ==========================
            // SEND EMAIL (10 AM)
            // ==========================
            if ($sendEmail) {

                if (
                    !$subscription->last_email_reminder_at ||
                    Carbon::parse($subscription->last_email_reminder_at)->toDateString() !== $today
                ) {

                    $notificationService->send(
                        $user,
                        title: "Subscription Expiring Soon",
                        message: "Your subscription expires in {$stage} day(s).",
                        type: NotificationType::PAYMENT,
                        emailSubject: "Subscription Expiring in {$stage} Day(s)",
                        emailMessage: "Your subscription will expire on {$dueDate->format('d M Y')}. Renew now to continue your access.",
                        sendEmail: true,
                        payload: [
                            'due_date'   => $dueDate->format('d M Y'),
                            'days_left'  => $stage,
                            'action_text' => 'Renew Now',
                            'action_url' => '/student/checkout',
                            'priority'   => 'high',
                            'icon'       => 'mail',
                            'popup'      => false
                        ]
                    );

                    $subscription->update([
                        'last_email_reminder_at' => $now
                    ]);
                }
            }

            // ==========================
            // Mark Stage As Sent
            // ==========================
            if ($stage == 5) {
                $subscription->update(['reminder_5_sent' => true]);
            } elseif ($stage == 3) {
                $subscription->update(['reminder_3_sent' => true]);
            } elseif ($stage == 1) {
                $subscription->update(['reminder_1_sent' => true]);
            }
        }
    }
}
