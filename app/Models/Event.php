<?php

namespace App\Models;

use App\Enums\ZoomStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Platform events (webinars etc)
 */
class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'event_image',
        'meeting_id',
        'meeting_type',
        'recurrence',
        'zoom_meeting_id',
        'zoom_join_url',
        'zoom_start_url',
        'zoom_recording_link',
        'zoom_status',
        'starts_at',
        'ends_at',
        'active'
    ];

    protected $casts = [
        'zoom_status' => ZoomStatus::class,
        'meeting_type' => 'string',
        'recurrence' => 'array',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function batches(): BelongsToMany
    {
        return $this->belongsToMany(Batch::class, 'batch_event', 'event_id', 'batch_id')->withTimestamps();
    }
}
