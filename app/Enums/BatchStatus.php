<?php
namespace App\Enums;

enum BatchStatus: string
{
    case UPCOMING = 'upcoming';
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case COMPLETED = 'completed';
}
