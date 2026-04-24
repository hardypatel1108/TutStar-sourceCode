<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\SubjectSyllabusChapter;
use App\Models\SubjectSyllabusTopic;
use Illuminate\Http\Request;

class SubjectSyllabusController extends Controller
{
    public function create(Subject $subject)
    {
        $subject->load('syllabusChapters.topics');

        return inertia('Admin/SubjectSyllabus/Create', [
            'subject' => $subject,
            'chapters' => $subject->syllabusChapters->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'topics' => $c->topics->map(fn($t) => [
                    'id' => $t->id,
                    'title' => $t->title,
                ])->values(),
            ])->values(),
        ]);
    }

    public function store(Request $request, Subject $subject)
    {
        $data = $request->validate([
            'chapters' => 'required|array|min:1',
            'chapters.*.id' => 'nullable|exists:subject_syllabus_chapters,id',
            'chapters.*.name' => 'required|string|max:255',
            'chapters.*.topics' => 'required|array|min:1',
            'chapters.*.topics.*.id' => 'nullable|exists:subject_syllabus_topics,id',
            'chapters.*.topics.*.title' => 'required|string|max:255',
        ]);

        $chapterIds = collect($data['chapters'])
            ->pluck('id')
            ->filter();

        // 🔴 Remove deleted chapters
        $subject->syllabusChapters()
            ->whereNotIn('id', $chapterIds)
            ->delete();

        foreach ($data['chapters'] as $cIndex => $chapterData) {
            $chapter = SubjectSyllabusChapter::updateOrCreate(
                ['id' => $chapterData['id'] ?? null],
                [
                    'subject_id' => $subject->id,
                    'name' => $chapterData['name'],
                    'sort_order' => $cIndex + 1,
                ]
            );

            $topicIds = collect($chapterData['topics'])
                ->pluck('id')
                ->filter();

            // 🔴 Remove deleted topics
            $chapter->topics()
                ->whereNotIn('id', $topicIds)
                ->delete();

            foreach ($chapterData['topics'] as $tIndex => $topicData) {
                SubjectSyllabusTopic::updateOrCreate(
                    ['id' => $topicData['id'] ?? null],
                    [
                        'chapter_id' => $chapter->id,
                        'title' => $topicData['title'],
                        'sort_order' => $tIndex + 1,
                    ]
                );
            }
        }

        return redirect()
            ->route('admin.subjects.index')
            ->with('success', 'Syllabus saved successfully');
    }
}


// {subject.syllabusChapters.map(ch => (
//     <div key={ch.id} className="space-y-2">
//         <h3 className="font-semibold">{ch.name}</h3>
//         <ul className="list-disc pl-5 text-sm text-gray-700">
//             {ch.topics.map(t => (
//                 <li key={t.id}>{t.title}</li>
//             ))}
//         </ul>
//     </div>
// ))}