<?php

namespace App\Models;

use App\Enums\BatchStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Teaching batch
 */
class Batch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'batch_code',
        'plan_id',
        'class_id',
        'subject_id',
        'teacher_id',
        'time_slot',
        'students_limit',
        'status'
    ];

    protected $casts = [
        'students_limit' => 'integer',
        'time_slot' => 'string',
        'status' => BatchStatus::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }
    public function clazz(): BelongsTo
    {
        return $this->belongsTo(Clazz::class, 'class_id');
    }
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'batch_students', 'batch_id', 'student_id')
            ->using(BatchStudent::class)
            ->withPivot(['ended_at', 'joined_at', 'status', 'allocated_by'])->withTimestamps();
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(BatchSchedule::class);
    }
    public function sessions(): HasMany
    {
        return $this->hasMany(ClassSession::class, 'batch_id');
    }


    public function practiceTests(): HasMany
    {
        return $this->hasMany(PracticeTest::class);
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'batch_event', 'batch_id', 'event_id')->withTimestamps();
    }
}
