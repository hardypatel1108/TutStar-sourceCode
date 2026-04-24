<?php
namespace App\Enums;

enum DoubtStatus: string
{
    case OPEN = 'open';
    case ANSWERED = 'answered';
    case CLOSED = 'closed';
}
