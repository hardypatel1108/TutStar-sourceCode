<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubjectSyllabusTopic extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'chapter_id',
        'title',
        'sort_order',
    ];

    public function chapter()
    {
        return $this->belongsTo(SubjectSyllabusChapter::class);
    }
}
