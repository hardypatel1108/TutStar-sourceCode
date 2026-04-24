<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Subject model
 */
class Subject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['board_id', 'class_id', 'name', 'code', 'description', 'status', 'icon', 'color'];
    protected $casts = ['created_at' => 'datetime', 'updated_at' => 'datetime'];

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }
    public function clazz(): BelongsTo
    {
        return $this->belongsTo(Clazz::class, 'class_id');
    }

    public function planSubjects(): HasMany
    {
        return $this->hasMany(PlanSubject::class);
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    public function classSessions(): HasMany
    {
        return $this->hasMany(ClassSession::class, 'subject_id');
    }

    public function overviews()
    {
        return $this->hasMany(SubjectOverview::class)
            ->orderBy('sort_order');
    }

    public function features()
    {
        return $this->hasMany(SubjectFeature::class)->orderBy('sort_order');
    }

    public function syllabusChapters()
    {
        return $this->hasMany(SubjectSyllabusChapter::class)
            ->orderBy('sort_order');
    }
}
