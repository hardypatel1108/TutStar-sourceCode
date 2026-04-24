<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Schedule slot for a batch
 */
class BatchSchedule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['batch_id', 'start_datetime', 'end_datetime', 'timezone'];
    protected $casts = ['start_datetime' => 'datetime', 'end_datetime' => 'datetime', 'created_at' => 'datetime', 'updated_at' => 'datetime'];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }
}
