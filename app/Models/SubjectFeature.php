<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubjectFeature extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'subject_id',
        'title',
        'description',
        'sort_order',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
