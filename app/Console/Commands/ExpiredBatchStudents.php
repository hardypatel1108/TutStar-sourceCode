<?php

namespace App\Console\Commands;

use App\Enums\NotificationType;
use Illuminate\Console\Command;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;
use App\Models\BatchStudent;
use Carbon\Carbon;

class ExpiredBatchStudents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:expired-batch-students';

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
        $targetDate = $now->copy()->subDays(7)->toDateString();

        // 1) Immediately expire ended active allocations.
        $justExpired = BatchStudent::query()
            ->where('status', 'active')
            ->whereNotNull('ended_at')
            ->where('ended_at', '<=', $now)
            ->get();

        foreach ($justExpired as $item) {
            $item->update(['status' => 'expired']);
        }

        // 2) Send reminder exactly 7 days after expiry once.
        $expiredBatchStudents = BatchStudent::with(['student.user', 'batch'])
            ->where('status', 'expired')
            ->whereDate('ended_at', $targetDate)
            ->where('expiry_notified', false)
            ->get();

        if ($expiredBatchStudents->isEmpty()) {
            $this->info('No 7-day expired batches found.');
            return;
        }

        foreach ($expiredBatchStudents as $batchStudent) {

            $student = $batchStudent->student;
            $user    = $student?->user;
            $batch   = $batchStudent->batch;

            if (!$user || !$batch) continue;

            $notificationService->send(
                $user,
                title: "Batch Expired 7 Days Ago",
                message: "Your access to batch '{$batch->name}' expired 7 days ago.",
                type: NotificationType::CLASS,
                emailSubject: "Batch Expired Reminder - TutStar",
                emailMessage: "Your subscription for '{$batch->name}' expired 7 days ago. Renew now to regain access.",
                sendEmail: true,
                payload: [
                    'batch_name'  => $batch->name,
                    'expired_on'  => $batchStudent->ended_at->format('d M Y'),
                    'action_text' => 'Renew Plan',
                    'action_url'  => '/student/checkout',
                    'priority'    => 'high',
                    'icon'        => 'alert-circle',
                    'popup'       => true
                ]
            );

            // Mark reminder sent
            $batchStudent->update([
                'expiry_notified' => true,
            ]);

            \Log::info("7-day expiry notification sent to {$user->email}");
        }

        $this->info("Expired now: {$justExpired->count()}, reminders sent: {$expiredBatchStudents->count()}.");
    }
}
