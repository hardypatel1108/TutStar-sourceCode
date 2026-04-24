<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherTeachingExperience extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'class_id',
        'subject_id',
        'experience_years',
        'description',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function clazz(): BelongsTo
    {
        return $this->belongsTo(Clazz::class, 'class_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}


// 4️⃣ Example Usage (How this works in real life)
// ✔ Save languages
// $languages = ['English', 'Hindi', 'Marathi'];

// ✔ Comfortable timings
// [
//   'monday' => ['10:00-13:00', '18:00-20:00'],
//   'tuesday' => ['09:00-12:00']
// ]

// ✔ Teaching experience
// Class	Subject	Experience
// 10	Math	6 years
// 11	Physics	4 years
// 12	Math	3 years