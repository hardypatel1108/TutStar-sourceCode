<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PracticeTest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'batch_id',
        'teacher_id',
        'title',
        'description',
        'attachment',
        'due_date',
    ];

    protected $casts = [
        'due_date'   => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }
}
