<?php

namespace App\Models;

use App\Enums\FileUse;
use App\Enums\FileVisibility;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Centralized file metadata table
 */
class FileEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'files';

    protected $fillable = [
        'user_id','model_type','model_id','original_name','file_path','mime_type','size','visibility','used_for'
    ];

    protected $casts = [
        'visibility' => FileVisibility::class,
        'used_for' => FileUse::class,
        'size' => 'integer',
        'created_at' => 'datetime','updated_at' => 'datetime'
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class,'user_id'); }

    // polymorphic accessor helpers
    public function model()
    {
        return $this->morphTo(__FUNCTION__,'model_type','model_id');
    }
}
