<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\PracticeTest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PracticeTestController extends Controller
{
    /**
     * Display a listing of the student's homework.
     */
    public function index(Request $request)
    {
        $student = auth()->user()->student;

        // 🔐 Optional safety
        abort_unless($student, 403);

        $tests = PracticeTest::query()
            ->with([
                'batch.subject:id,name,color,icon',
                'batch.teacher.user:id,name',
            ])
            ->whereHas('batch.students', function ($q) use ($student) {
                $q->where('students.id', $student->id)
                    ->where('batch_students.status', 'active')
                    ->where(function ($pivotQuery) {
                        $pivotQuery->whereNull('batch_students.ended_at')
                            ->orWhere('batch_students.ended_at', '>', now());
                    });
            })
            ->where('created_at', '>=', now()->subDays(10))
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($q2) use ($request) {
                    $q2->where('title', 'like', "%{$request->search}%")
                        ->orWhere('description', 'like', "%{$request->search}%");
                });
            })
            ->when(
                $request->due_date,
                fn($q) => $q->whereDate('due_date', $request->due_date)
            )
            ->latest()
            ->get();

        /**
         * 🔹 Group by Subject + Teacher (same UI grouping)
         */
        $groups = $tests
            ->groupBy(function ($pt) {
                $subject = $pt->batch?->subject?->name ?? 'Unknown Subject';
                $teacher = $pt->batch?->teacher?->user?->name ?? 'Unknown Teacher';
                return $subject . '__' . $teacher;
            })
            ->map(function ($items, $key) {
                [$subjectName, $teacherName] = explode('__', $key);

                $subject = $items->first()->batch?->subject;

                return [
                    'id' => $items->first()->id,
                    'subject_name' => $subjectName,
                    'teacher_name' => $teacherName,
                    'color' => $subject?->color ?? 'D0B5FF',
                    'icon' => $subject?->icon ?? null,
                    'assignments' => $items->map(function ($pt) {
                        return [
                            'id' => $pt->id,
                            'date' => optional($pt->created_at)->format('Y-m-d'),
                            'chapter' => $pt->title,
                            'topic' => $pt->description ?? '—',
                            'file_url' => $pt->attachment
                                ? asset('storage/' . $pt->attachment)
                                : null,
                            'due_date' => optional($pt->due_date)->format('d M Y'),
                        ];
                    })->values(),
                ];
            })
            ->values();

        return Inertia::render('Student/practiceTest', [
            'groups' => $groups,
            'filters' => $request->only('search', 'due_date'),
        ]);
    }

    /**
     * Show the form for viewing or downloading homework details.
     */
    public function show(PracticeTest $practiceTest)
    {
        abort(404);
    }

    /**
     * Students don’t create or update homework,
     * but we’ll still include stubs for completeness.
     */
    public function create()
    {
        abort(403, 'Students cannot create homework.');
    }

    public function store(Request $request)
    {
        abort(403, 'Students cannot create homework.');
    }

    public function edit(PracticeTest $practiceTest)
    {
        abort(403, 'Students cannot edit practice tests.');
    }

    public function update(Request $request, PracticeTest $practiceTest)
    {
        abort(403, 'Students cannot update practice tests.');
    }

    public function destroy(PracticeTest $practiceTest)
    {
        abort(403, 'Students cannot delete practice tests.');
    }
}
