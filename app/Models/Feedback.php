<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Feedback entries (student feedback)
 */
class Feedback extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['student_id','rating','comment','forced_by_admin'];
    protected $casts = ['forced_by_admin'=>'boolean','created_at'=>'datetime','updated_at'=>'datetime'];

    public function student()
    {
        return $this->belongsTo(Student::class,'student_id');
    }
}
