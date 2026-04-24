<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\PracticeTest;
use App\Models\Teacher;
use App\Models\ClassSession;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class PracticeTestController extends Controller
{
    /**
     * Display a listing of practice tests.
     */
    public function index(Request $request)
    {
        $view = $request->input('view', 'upcoming');

        $practiceTests = PracticeTest::query()
            ->with([
                'teacher.user:id,name',
                'batch' => function ($q) {
                    $q->select('id', 'class_id', 'subject_id', 'teacher_id', 'students_limit', 'batch_code as name')
                        ->withCount([
                            'students as current_students_count' => function ($studentQuery) {
                                $studentQuery->where('batch_students.status', 'active')
                                    ->where(function ($pivotQuery) {
                                        $pivotQuery->whereNull('batch_students.ended_at')
                                            ->orWhere('batch_students.ended_at', '>', now());
                                    });
                            },
                        ]);
                },
                'batch.clazz:id,name',
                'batch.subject:id,name',
                'batch.teacher.user:id,name',
            ])
            ->when($view === 'upcoming', function ($q) {
                $q->whereHas('batch.sessions', function ($sessionQuery) {
                    $sessionQuery->whereIn('status', ['scheduled', 'rescheduled'])
                        ->where('class_date', '>=', now());
                });
            })
            ->when($request->filled('status') && $request->status !== 'all', function ($q) use ($request) {
                $q->whereHas('batch.sessions', fn($s) => $s->where('status', $request->status));
            })
            ->when($request->batch, fn($q) => $q->where('batch_id', $request->batch))
            ->when($request->subject, function ($q) use ($request) {
                $q->whereHas('batch', fn($b) => $b->where('subject_id', $request->subject));
            })
            ->when($request->teacher, function ($q) use ($request) {
                $q->whereHas('batch.sessions', fn($s) => $s->where('teacher_id', $request->teacher));
            })
            ->when($request->start_date, function ($q) use ($request) {
                $q->whereHas('batch.sessions', fn($s) => $s->whereDate('class_date', '>=', $request->start_date));
            })
            ->when($request->end_date, function ($q) use ($request) {
                $q->whereHas('batch.sessions', fn($s) => $s->whereDate('class_date', '<=', $request->end_date));
            })
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($sub) use ($request) {
                    $sub->where('title', 'like', "%{$request->search}%")
                        ->orWhere('description', 'like', "%{$request->search}%")
                        ->orWhereHas('batch.sessions', function ($sessionQuery) use ($request) {
                            $sessionQuery->where('topic', 'like', "%{$request->search}%");
                        });
                });
            })
            ->orderByDesc('id')
            ->paginate(config('app.paginate'))
            ->through(function ($practiceTest) use ($view) {
                $sessionQuery = ClassSession::query()
                    ->with(['meeting:id,duration,description'])
                    ->where('batch_id', $practiceTest->batch_id)
                    ->orderByDesc('class_date');

                if ($view === 'upcoming') {
                    $sessionQuery->whereIn('status', ['scheduled', 'rescheduled'])
                        ->where('class_date', '>=', now());
                }

                $relatedSession = $sessionQuery->first();
                $practiceTest->related_session = $relatedSession;

                if ($relatedSession?->class_date) {
                    $startTime = Carbon::parse($relatedSession->class_date);
                    $durationMinutes = (int) ($relatedSession->meeting?->duration ?? 0);
                    $endTime = (clone $startTime)->addMinutes(max($durationMinutes, 0));

                    $relatedSession->class_date_formatted = $startTime->format('d M Y, h:i a');
                    $relatedSession->class_time_range = $durationMinutes > 0
                        ? $startTime->format('h:i A') . ' - ' . $endTime->format('h:i A')
                        : $startTime->format('h:i A');
                    $relatedSession->time_slot = $this->resolveSessionTimeSlot($startTime);
                }

                $practiceTest->due_date_formatted = $practiceTest->due_date
                    ? Carbon::parse($practiceTest->due_date)->format('d M Y, h:i a')
                    : null;

                $practiceTest->posted_time_formatted = $practiceTest->created_at
                    ? Carbon::parse($practiceTest->created_at)->format('d M Y, h:i a')
                    : null;

                return $practiceTest;
            })
            ->withQueryString();

        $batches = Batch::select('id', 'batch_code as name')->get();

        $subjects = Subject::query()
            ->select('subjects.id', 'subjects.name')
            ->when($request->filled('batch'), function ($q) use ($request) {
                $q->whereHas('batches', function ($batchQuery) use ($request) {
                    $batchQuery->where('batches.id', $request->batch);
                });
            })
            ->get();

        $teachers = Teacher::query()
            ->select('teachers.id', 'teachers.user_id')
            ->with('user:id,name')
            ->when($request->filled('batch'), function ($q) use ($request) {
                $q->whereHas('batches', function ($batchQuery) use ($request) {
                    $batchQuery->where('batches.id', $request->batch);
                });
            })
            ->get();

        return Inertia::render('Admin/PracticeTests/index', [
            'practiceTests' => $practiceTests,
            'teachers'  => $teachers,
            'batches'   => $batches,
            'subjects'  => $subjects,
            'filters'   => array_merge(['view' => $view], $request->only([
                'teacher',
                'batch',
                'subject',
                'status',
                'start_date',
                'end_date',
                'search',
            ])),
        ]);
    }

    private function resolveSessionTimeSlot(Carbon $startTime): string
    {
        $minutes = ($startTime->hour * 60) + $startTime->minute;

        if ($minutes >= (16 * 60) && $minutes < (18 * 60)) {
            return 'slot_4_6_pm';
        }

        if ($minutes >= (5 * 60) && $minutes < (12 * 60)) {
            return 'morning';
        }

        if ($minutes >= (12 * 60) && $minutes < (16 * 60)) {
            return 'afternoon';
        }

        if ($minutes >= (18 * 60) && $minutes < (21 * 60)) {
            return 'evening';
        }

        return 'night';
    }

    /**
     * Show the form for creating a new practice test.
     */
    public function create()
    {
        $teachers = Teacher::with('user:id,name')->get()->map(fn($t) => [
            'id' => $t->id,
            'name' => $t->user?->name ?? '-',
        ]);
        $sessions = ClassSession::select('id', 'topic as title')->get();

        return Inertia::render('Admin/PracticeTests/Create', [
            'teachers' => $teachers,
            'sessions' => $sessions,
        ]);
    }

    /**
     * Store a newly created practice test in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'batch_id' => 'required|exists:batches,id',
            'title' => 'required|string|max:255',
            'attachment' => 'nullable|file|max:5120',
        ]);

        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('practice_tests', 'public');
        }

        PracticeTest::create($validated);

        return redirect()->route('admin.practice-tests.index')->with('success', 'Practice test created successfully');
    }

    /**
     * Show the form for editing the specified practice test.
     */
    public function edit(PracticeTest $practiceTest)
    {
        $teachers = Teacher::with('user:id,name')->get()->map(fn($t) => [
            'id' => $t->id,
            'name' => $t->user?->name ?? '-',
        ]);
        $sessions = ClassSession::select('id', 'topic as title')->get();

        return Inertia::render('Admin/PracticeTests/Edit', [
            'practiceTest' => $practiceTest,
            'teachers' => $teachers,
            'sessions' => $sessions,
        ]);
    }

    /**
     * Update the specified practice test.
     */
    public function update(Request $request, PracticeTest $practiceTest)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'batch_id' => 'required|exists:batches,id',
            'title' => 'required|string|max:255',
            'attachment' => 'nullable|file|max:5120',
        ]);

        if ($request->hasFile('attachment')) {
            if ($practiceTest->attachment) {
                Storage::disk('public')->delete($practiceTest->attachment);
            }
            $validated['attachment'] = $request->file('attachment')->store('practice_tests', 'public');
        }

        $practiceTest->update($validated);

        return back()->with('success', 'Practice test updated successfully');
    }

    /**
     * Remove the specified practice test from storage.
     */
    public function destroy(PracticeTest $practiceTest)
    {
        if ($practiceTest->attachment) {
            Storage::disk('public')->delete($practiceTest->attachment);
        }

        $practiceTest->delete();

        return back()->with('success', 'Practice test deleted successfully');
    }
}
