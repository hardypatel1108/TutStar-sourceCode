<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class model (named Clazz)
 */
class Clazz extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'classes';

    protected $fillable = [
        'board_id',
        'name',
        'description',
        'ordinal',
        'status',
        'slug'
    ];

    protected $casts = ['ordinal' => 'integer', 'created_at' => 'datetime', 'updated_at' => 'datetime'];

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class, 'class_id');
    }

    public function plans(): HasMany
    {
        return $this->hasMany(Plan::class, 'class_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'class_id');
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class, 'class_id');
    }
}
