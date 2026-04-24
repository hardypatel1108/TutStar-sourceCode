<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Auth\Events\Verified;
use App\Listeners\SendEmailVerifiedNotification;
use Illuminate\Auth\Events\PasswordReset;
use App\Listeners\SendPasswordChangedNotification;


class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Verified::class => [
            SendEmailVerifiedNotification::class,
        ],
        PasswordReset::class => [
            SendPasswordChangedNotification::class,
        ],
    ];
}
