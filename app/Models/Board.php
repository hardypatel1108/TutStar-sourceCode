<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Boards (CBSE / ICSE / etc)
 */
class Board extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name','description','status', 'logo', 'slug'];
    protected $casts = ['created_at'=>'datetime','updated_at'=>'datetime'];

    public function classes(): HasMany
    {
        return $this->hasMany(Clazz::class);
    }

    public function plans(): HasMany
    {
        return $this->hasMany(Plan::class);
    }
}
