<?php

namespace App\Models;

use App\Enums\DoubtStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Student doubt submitted after attending class
 */
class Doubt extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['classes_session_id','student_id','teacher_id','question','attachment','status'];
    protected $casts = ['status'=>DoubtStatus::class,'created_at'=>'datetime','updated_at'=>'datetime'];

    public function session(): BelongsTo { return $this->belongsTo(ClassSession::class,'classes_session_id'); }
    public function student(): BelongsTo { return $this->belongsTo(Student::class,'student_id'); }
    public function teacher(): BelongsTo { return $this->belongsTo(Teacher::class,'teacher_id'); }
}
