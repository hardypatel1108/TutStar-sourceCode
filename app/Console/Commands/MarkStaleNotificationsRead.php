<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;

class MarkStaleNotificationsRead extends Command
{
    protected $signature = 'app:mark-stale-notifications-read';

    protected $description = 'Mark viewed notifications as read after 2 hours';

    public function handle(): int
    {
        $updated = Notification::query()
            ->whereNull('read_at')
            ->whereNotNull('viewed_at')
            ->where('viewed_at', '<=', now()->subHours(2))
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $this->info("Marked {$updated} notifications as read.");

        return self::SUCCESS;
    }
}
