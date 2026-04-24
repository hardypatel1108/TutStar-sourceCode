<?php

namespace App\Models;

use App\Enums\NotificationType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * In-app notifications
 */
class Notification extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['user_id','title','message','type','model_type','model_id','payload','is_read','read_at','viewed_at'];
    protected $casts = [
        'type' => NotificationType::class,
        'payload' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'viewed_at' => 'datetime',
        'created_at' => 'datetime','updated_at' => 'datetime'
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class,'user_id'); }
}
