<?php

namespace App\Models;


use App\Enums\StudentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'student_uid',
        'board_id',
        'preferred_board_label',
        'class_id',
        'preferred_class_label',
        'school',
        'city',
        'state',
        'dob',
        'status',
    ];

    protected $casts = [
        'dob' => 'date',
        'status' => StudentStatus::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }


    public function clazz(): BelongsTo
    {
        return $this->belongsTo(Clazz::class, 'class_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(StudentSubscription::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function batches(): BelongsToMany
    {
        return $this->belongsToMany(Batch::class, 'batch_students', 'student_id', 'batch_id')
            ->using(BatchStudent::class)
            ->withPivot([
                'joined_at',
                'ended_at',
                'status',
                'allocated_by',
            ])
            ->withTimestamps();
    }

    public function doubts(): HasMany
    {
        return $this->hasMany(Doubt::class);
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }
}
