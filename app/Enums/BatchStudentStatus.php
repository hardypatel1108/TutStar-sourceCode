<?php
namespace App\Enums;

enum BatchStudentStatus: string
{
    case ACTIVE = 'active';
    case LEFT = 'left';
    case EXPIRED = 'expired';
}
