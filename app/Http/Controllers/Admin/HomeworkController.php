<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Homework;
use App\Models\Teacher;
use App\Models\ClassSession;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

class HomeworkController extends Controller
{
    /**
     * Display a listing of homeworks.
     */
    public function index(Request $request)
    {
        $view = $request->input('view', 'upcoming');

        $homeworks = Homework::query()
            ->with([
                'teacher.user:id,name',
                'session:id,topic,batch_id,subject_id,teacher_id,class_date,status,meeting_id',
                'session.batch' => function ($q) {
                    $q->select('id', 'class_id', 'students_limit', 'batch_code as name')
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
                'session.batch.clazz:id,name',
                'session.subject:id,name',
                'session.teacher.user:id,name',
                'session.meeting:id,duration,description',
            ])
            ->when($view === 'upcoming', function ($q) {
                $q->whereHas('session', function ($sessionQuery) {
                    $sessionQuery->whereIn('status', ['scheduled', 'rescheduled'])
                        ->where('class_date', '>=', now());
                });
            })
            ->when($request->teacher, fn($q) => $q->where('teacher_id', $request->teacher))
            ->when($request->batch, function ($q) use ($request) {
                $q->whereHas('session', fn($s) => $s->where('batch_id', $request->batch));
            })
            ->when($request->subject, function ($q) use ($request) {
                $q->whereHas('session', fn($s) => $s->where('subject_id', $request->subject));
            })
            ->when($request->status, function ($q) use ($request) {
                $q->whereHas('session', fn($s) => $s->where('status', $request->status));
            })
            ->when($request->start_date, function ($q) use ($request) {
                $q->whereHas('session', fn($s) => $s->whereDate('class_date', '>=', $request->start_date));
            })
            ->when($request->end_date, function ($q) use ($request) {
                $q->whereHas('session', fn($s) => $s->whereDate('class_date', '<=', $request->end_date));
            })
            ->when($request->due_date_from, fn($q) => $q->whereDate('due_date', '>=', $request->due_date_from))
            ->when($request->due_date_to, fn($q) => $q->whereDate('due_date', '<=', $request->due_date_to))
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($sub) use ($request) {
                    $sub->where('title', 'like', "%{$request->search}%")
                        ->orWhere('description', 'like', "%{$request->search}%")
                        ->orWhereHas('session', function ($sessionQuery) use ($request) {
                            $sessionQuery->where('topic', 'like', "%{$request->search}%");
                        });
                });
            })
            ->orderByDesc(
                ClassSession::query()
                    ->select('class_date')
                    ->whereColumn('classes_sessions.id', 'homeworks.classes_session_id')
                    ->limit(1)
            )
            ->orderByDesc('id')
            ->paginate(config('app.paginate'))
            ->through(function ($homework) {
                if ($homework->session?->class_date) {
                    $startTime = Carbon::parse($homework->session->class_date);
                    $durationMinutes = (int) ($homework->session?->meeting?->duration ?? 0);
                    $endTime = (clone $startTime)->addMinutes(max($durationMinutes, 0));

                    $homework->session->class_date_formatted = $startTime->format('d M Y, h:i a');
                    $homework->session->class_time_range = $durationMinutes > 0
                        ? $startTime->format('h:i A') . ' - ' . $endTime->format('h:i A')
                        : $startTime->format('h:i A');
                    $homework->session->time_slot = $this->resolveSessionTimeSlot($startTime);
                }

                $homework->due_date_formatted = $homework->due_date
                    ? Carbon::parse($homework->due_date)->format('d M Y, h:i a')
                    : null;
                $homework->posted_time_formatted = $homework->created_at
                    ? Carbon::parse($homework->created_at)->format('d M Y, h:i a')
                    : null;

                return $homework;
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

        return Inertia::render('Admin/Homeworks/index', [
            'homeworks' => $homeworks,
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
                'due_date_from',
                'due_date_to',
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
     * Show the form for creating new homework.
     */
    public function create()
    {
        $teachers = Teacher::select('id', 'name')->get();
        $sessions = ClassSession::select('id', 'title')->get();

        return Inertia::render('Admin/Homeworks/Create', [
            'teachers' => $teachers,
            'sessions' => $sessions,
        ]);
    }

    /**
     * Store a newly created homework.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'classes_session_id' => 'required|exists:classes_sessions,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'attachment' => 'nullable|file|max:5120', // 5 MB
        ]);

        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('homeworks', 'public');
        }

        Homework::create($validated);

        return redirect()->route('admin.homeworks.index')->with('success', 'Homework created successfully');
    }

    /**
     * Show the form for editing a homework.
     */
    public function edit(Homework $homework)
    {
        $teachers = Teacher::select('id', 'name')->get();
        $sessions = ClassSession::select('id', 'title')->get();

        return Inertia::render('Admin/Homeworks/Edit', [
            'homework' => $homework->load(['teacher:id,name', 'session:id,title']),
            'teachers' => $teachers,
            'sessions' => $sessions,
        ]);
    }

    /**
     * Update the specified homework.
     */
    public function update(Request $request, Homework $homework)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'classes_session_id' => 'required|exists:classes_sessions,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'attachment' => 'nullable|file|max:5120',
        ]);

        if ($request->hasFile('attachment')) {
            if ($homework->attachment) {
                Storage::disk('public')->delete($homework->attachment);
            }
            $validated['attachment'] = $request->file('attachment')->store('homeworks', 'public');
        }

        $homework->update($validated);

        return back()->with('success', 'Homework updated successfully');
    }

    /**
     * Remove the specified homework.
     */
    public function destroy(Homework $homework)
    {
        if ($homework->attachment) {
            Storage::disk('public')->delete($homework->attachment);
        }

        $homework->delete();

        return back()->with('success', 'Homework deleted successfully');
    }
}
