<?php

namespace App\Models;

use App\Enums\ClassSessionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Individual class session (Zoom meeting)
 */
class ClassSession extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'classes_sessions';

    protected $fillable = [
        'batch_id',
        'class_date',
        'subject_id',
        'teacher_id',
        'topic',
        'status',
        'zoom_meeting_id',
        'zoom_join_url',
        'zoom_start_url',
        'recording_link',
        'meeting_id',
        'occurrence_id',
    ];

    protected $casts = [
        'class_date' => 'datetime',
        'status' => ClassSessionStatus::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }
    // 🔗 NEW: link to Meeting
    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function homeworks(): HasMany
    {
        return $this->hasMany(Homework::class, 'classes_session_id');
    }
    public function practiceTests(): HasMany
    {
        return $this->hasMany(PracticeTest::class, 'classes_session_id');
    }
    public function doubts(): HasMany
    {
        return $this->hasMany(Doubt::class, 'classes_session_id');
    }

    public function meetingOccurrence(): BelongsTo
    {
        return $this->belongsTo(
            MeetingOccurrence::class,
            'occurrence_id',
            'occurrence_id'
        );
    }
}

// // From a ClassSession, get meeting + users
// $session = ClassSession::with('meeting.hosts', 'meeting.participants')->find($id);

// $meeting = $session->meeting;
// $teacherUsers = $session->meeting?->hosts;
// $studentUsers = $session->meeting?->participants;

// // From a Meeting, get its class session
// $meeting = Meeting::with('classSession')->find($id);
// $session  = $meeting->classSession;

// When you create a meeting for a class session, you’d do something like:

// $meeting = Meeting::create([...]);     // after Zoom created
// $classSession->update(['meeting_id' => $meeting->id]);

// How you’ll resolve join/start URLs (important)
// $session = ClassSession::with(['meeting', 'meetingOccurrence'])->find($id);

// if ($session->occurrence_id) {
//     // recurring session
//     $joinUrl = $session->meeting->join_url;
// } else {
//     // single session
//     $joinUrl = $session->zoom_join_url;
// }