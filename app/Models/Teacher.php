<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Teacher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'bio',
        'city',
        'state',
        'contact_email',
        'contact_mobile',
        'salary',
        'comfortable_timings',
        'languages',
        'experience_years',
    ];

    protected $casts = [
        'comfortable_timings' => 'array',
        'languages' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function teachingExperiences(): HasMany
    {
        return $this->hasMany(TeacherTeachingExperience::class);
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    public function classSessions(): HasMany
    {
        return $this->hasMany(ClassSession::class, 'teacher_id');
    }

    public function homeworks(): HasMany
    {
        return $this->hasMany(Homework::class, 'teacher_id');
    }

    public function doubts(): HasMany
    {
        return $this->hasMany(Doubt::class, 'teacher_id');
    }
}
