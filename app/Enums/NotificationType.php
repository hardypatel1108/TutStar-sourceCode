<?php

namespace App\Enums;

enum NotificationType: string
{
    case NEWUSER = 'newuser';
    case SYSTEM = 'system';
    case clazz = 'class';
    case HOMEWORK = 'homework';
    case PAYMENT = 'payment';
    case EVENT = 'event';
    case CUSTOM = 'custom';
    case CRON = 'cron';
}
