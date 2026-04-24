<?php
namespace App\Enums;

enum PaymentGateway: string
{
    case PHONEPE = 'phonepe';
    case MANUAL = 'manual';
}
