<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZoomWebhookEvent extends Model
{
    protected $fillable = [
        'event_name',
        'dedupe_key',
        'status',
        'received_at',
        'processed_at',
        'attempts',
        'error_message',
        'headers',
        'raw_body',
        'payload',
    ];

    protected $casts = [
        'headers' => 'array',
        'payload' => 'array',
        'received_at' => 'datetime',
        'processed_at' => 'datetime',
        'attempts' => 'integer',
    ];
}
