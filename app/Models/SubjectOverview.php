<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubjectOverview extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'subject_id',
        'title',
        'pointer_type',
        'sort_order',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function points(): HasMany
    {
        return $this->hasMany(SubjectOverviewPoint::class)
            ->orderBy('sort_order');
    }
}