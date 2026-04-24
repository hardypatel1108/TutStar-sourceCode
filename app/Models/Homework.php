<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Homework attached to a class session
 */
class Homework extends Model
{
    use HasFactory, SoftDeletes;

    
    protected $table = 'homeworks';

    protected $fillable = ['classes_session_id','teacher_id','title','description','attachment','due_date'];
    protected $casts = ['due_date'=>'datetime','created_at'=>'datetime','updated_at'=>'datetime'];

    public function session(): BelongsTo { return $this->belongsTo(ClassSession::class,'classes_session_id'); }
    public function teacher(): BelongsTo { return $this->belongsTo(Teacher::class,'teacher_id'); }
}
