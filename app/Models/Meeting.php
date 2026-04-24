<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Meeting extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'created_by',
        'topic',
        'description',
        'zoom_meeting_id',
        'zoom_uuid',
        'zoom_host_email',
        'start_time',
        'duration',
        'status',
        'meeting_type',
        'recurrence',
        'timezone',
        'start_url',
        'join_url',
        'recording_status',
        'recording_url',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'recurrence' => 'array',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'meeting_user')
            ->withPivot('role')
            ->withTimestamps()
            ->withTrashed();
    }

    public function hosts()
    {
        return $this->users()->wherePivot('role', 'teacher');
    }

    public function participants()
    {
        return $this->users()->wherePivot('role', 'student');
    }

    public function occurrences(): HasMany
    {
        return $this->hasMany(MeetingOccurrence::class);
    }

    public function classSessions(): HasMany
    {
        return $this->hasMany(ClassSession::class);
    }
}
