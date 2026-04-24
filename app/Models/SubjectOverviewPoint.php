<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubjectOverviewPoint extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'subject_overview_id',
        'content',
        'sort_order',
    ];

    public function overview(): BelongsTo
    {
        return $this->belongsTo(SubjectOverview::class, 'subject_overview_id');
    }
}
