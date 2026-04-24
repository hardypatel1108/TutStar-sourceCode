<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pivot between plans and subjects
 */
class PlanSubject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['plan_id','subject_id'];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
