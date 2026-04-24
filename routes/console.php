<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:run-daily-jobs')->everyMinute();
Schedule::command('app:mark-stale-notifications-read')->everyMinute();
Schedule::command('app:expired-batch-students')->daily();
Schedule::command('app:send-fee-due-reminders')->hourly();
