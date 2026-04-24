<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Audit logs for tracking changes
 */
class AuditLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['user_id','action','model_type','model_id','changes'];
    protected $casts = ['changes' => 'array','created_at'=>'datetime','updated_at'=>'datetime'];

    public function user()
    {
        return $this->belongsTo(User::class,'user_id');
    }
}
