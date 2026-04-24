<?php
namespace App\Enums;

enum FileUse: string
{
    case PROFILE = 'profile';
    case HOMEWORK = 'homework';
    case DOUBT = 'doubt';
    case RECORDING = 'recording';
    case ATTACHMENT = 'attachment';
}
