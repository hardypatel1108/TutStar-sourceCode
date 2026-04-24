<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubjectSyllabusChapter extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'subject_id',
        'name',
        'sort_order',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function topics()
    {
        return $this->hasMany(SubjectSyllabusTopic::class, 'chapter_id')
            ->orderBy('sort_order');
    }
}
