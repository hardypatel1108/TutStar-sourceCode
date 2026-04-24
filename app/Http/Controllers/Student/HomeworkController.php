<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Homework;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeworkController extends Controller
{
    /**
     * Display a listing of the student's homework.
     */
    public function index(Request $request)
    {
        $student = auth()->user()?->student;
        abort_unless($student, 403);

        $homeworks = Homework::with([
            'session.subject:id,name,color,icon',
            'session.teacher.user:id,name',
        ])
            ->whereHas('session.batch.students', function ($q) use ($student) {
                $q->where('students.id', $student->id)
                    ->where('batch_students.status', 'active')
                    ->where(function ($pivotQuery) {
                        $pivotQuery->whereNull('batch_students.ended_at')
                            ->orWhere('batch_students.ended_at', '>', now());
                    });
            })
            ->where('created_at', '>=', now()->subDays(10)->startOfDay())
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($q2) use ($request) {
                    $q2->where('title', 'like', "%{$request->search}%")
                        ->orWhere('description', 'like', "%{$request->search}%");
                });
            })
            ->when(
                $request->due_date,
                fn($q) =>
                $q->whereDate('due_date', $request->due_date)
            )
            ->orderByDesc('created_at')
            ->get();

        // Group by subject + teacher exactly like your static data
        $grouped = $homeworks->groupBy(function ($hw) {
            $subject = $hw->session?->subject?->name ?? 'Unknown Subject';
         
            $teacher = $hw->session?->teacher?->user?->name ?? 'Unknown Teacher';
            return $subject . '__' . $teacher;
        });

        // Convert grouped data into same structure as your static $groups[]
        $groups = $grouped->map(function ($items, $key) {
            [$subjectName, $teacherName] = explode('__', $key);

            // Use DB colors or fallback static
            $subject = $items->first()->session?->subject;

            return [
                'id' => $items->first()->id,
                'subject_name' => $subjectName,
                'teacher_name' => $teacherName,
                'color' => $subject->color ?? 'D0B5FF',
                'icon' => $subject->icon ?? '/assets/svgs/subjects/english-icon.svg',
                'assignments' => $items->map(function ($hw) {
                    return [
                        'id' => $hw->id,
                        'date' => $hw->created_at?->format('Y-m-d') ?? '--',
                        'time' => $hw->created_at?->format('h:i A') ?? '--',
                        'posted_at' => $hw->created_at?->format('Y-m-d h:i A') ?? '--',
                        'chapter' => $hw->title,
                        'topic' => $hw->description ?? '—',
                        'file_url' => $hw->attachment ? asset('storage/' . $hw->attachment) : null,
                    ];
                })->values(),
            ];
        })->values();

        return Inertia::render('Student/homework', [
            'groups' => $groups,
            'filters' => $request->only('search', 'due_date'),
        ]);
    }

    /**
     * Show the form for viewing or downloading homework details.
     */
    public function show(Homework $homework)
    {
        $student = auth()->user()?->student;
        abort_unless($student, 403);

        $isAllowed = Homework::query()
            ->where('id', $homework->id)
            ->whereHas('session.batch.students', function ($q) use ($student) {
                $q->where('students.id', $student->id)
                    ->where('batch_students.status', 'active')
                    ->where(function ($pivotQuery) {
                        $pivotQuery->whereNull('batch_students.ended_at')
                            ->orWhere('batch_students.ended_at', '>', now());
                    });
            })
            ->exists();

        abort_unless($isAllowed, 403);

        $homework->load(['session', 'teacher']);
        return Inertia::render('Student/Homework/Show', [
            'homework' => $homework,
        ]);
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

    public function edit(Homework $homework)
    {
        abort(403, 'Students cannot edit homework.');
    }

    public function update(Request $request, Homework $homework)
    {
        abort(403, 'Students cannot update homework.');
    }

    public function destroy(Homework $homework)
    {
        abort(403, 'Students cannot delete homework.');
    }
}


