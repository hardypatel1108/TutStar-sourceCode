<?php

namespace App\Console\Commands;

use App\Enums\NotificationType;
use Illuminate\Console\Command;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class RunDailyJobs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:run-daily-jobs';

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
        $user = User::where('email', 'arevee0001@gmail.com')->first();

        if (! $user) {
            $this->error('No user found');
            return;
        }

        $notificationService->send(
            $user,
            "Your live class has started",
            "Please join now.",
            NotificationType::CRON,
            sendEmail: true
        );

        Log::info('Notification sent to ' . $user->email);
        $this->info("Notification sent successfully");
    }
}
