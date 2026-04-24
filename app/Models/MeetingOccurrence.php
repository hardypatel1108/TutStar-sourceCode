<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MeetingOccurrence extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'meeting_id',
        'occurrence_id',
        'start_time',
        'duration',
    ];

    protected $casts = [
        'start_time' => 'datetime',
    ];

    public function meeting()
    {
        return $this->belongsTo(Meeting::class);
    }
    public function classSession(): HasOne
    {
        return $this->hasOne(
            ClassSession::class,
            'occurrence_id',
            'occurrence_id'
        )->whereColumn('classes_sessions.meeting_id', 'meeting_occurrences.meeting_id');
    }
}
