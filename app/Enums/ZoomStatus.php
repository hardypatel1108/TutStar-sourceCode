<?php
namespace App\Enums;

enum ZoomStatus: string
{
    case SCHEDULED = 'scheduled';
    case STARTED = 'started';
    case ENDED = 'ended';
    case CANCELLED = 'cancelled';
}
