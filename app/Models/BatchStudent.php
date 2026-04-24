<?php

namespace App\Models;

use App\Enums\BatchStudentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * Pivot record for batch allocation
 */
class BatchStudent extends Pivot
{
    use HasFactory, SoftDeletes;

    protected $table = 'batch_students';

    protected $fillable = ['batch_id', 'student_id', 'status', 'allocated_by', 'allocated_at',  'joined_at', 'ended_at', 'expiry_notified'];

    protected $casts = [
        'status' => BatchStudentStatus::class,
        'allocated_at' => 'datetime',
        'joined_at' => 'datetime',
        'ended_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'expiry_notified' => 'boolean',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
    public function allocator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'allocated_by');
    }
    public function isActive(): bool
    {
        return is_null($this->ended_at) || $this->ended_at->isFuture();
    }

    public function isCompleted(): bool
    {
        return $this->ended_at && $this->ended_at->isPast();
    }
}
