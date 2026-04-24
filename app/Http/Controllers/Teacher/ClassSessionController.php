<?php

namespace App\Http\Controllers\Teacher;

use App\Enums\ClassSessionStatus;
use App\Http\Controllers\Controller;
use App\Models\ClassSession;
use App\Models\Batch;
use App\Models\Clazz;
use App\Models\Subject;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ClassSessionController extends Controller
{
    /**
     * Display a listing of the teacher's class sessions.
     */
    public function index(Request $request)
    {
        // $teacher = Auth::guard('teacher')->user();
        $authUser = Auth::guard('teacher')->user();  // actual user
        $teacher = $authUser->teacher()->with('user:id,name')->first();

        $todayEnd = now()->endOfDay();

        if ($request->filled('date_from') && $request->filled('date_to')) {
            // User-selected date range
            $from = Carbon::parse($request->date_from)->startOfDay();
            $to   = Carbon::parse($request->date_to)->endOfDay();
        } else {
            // Default: upcoming 7 days
            $from = $todayEnd;
            $to   = now()->addDays(7)->endOfDay();
        }
        // Dropdown filter values
        $classes = Clazz::select('id', 'name')
            ->whereHas('batches', fn($q) => $q->where('teacher_id', $teacher->id))
            ->distinct()
            ->get();

        $subjects = Subject::select('id', 'name')
            ->whereHas('batches', fn($q) => $q->where('teacher_id', $teacher->id))
            ->distinct()
            ->get();

        $batches = Batch::select('id', 'batch_code')
            ->where('teacher_id', $teacher->id)
            ->distinct()
            ->get();

        $dayend   = now()->endOfDay();


        $sessions = ClassSession::query()
            ->where('teacher_id', $teacher->id)
            ->where('status', ClassSessionStatus::SCHEDULED)
            ->with([
                'batch:id,batch_code,class_id,subject_id',
                'batch.clazz:id,name',
                'subject:id,name'
            ])

            // Search by topic OR batch code
            ->when($request->search, function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($q) use ($search) {
                    $q->where('topic', 'like', "%{$search}%")
                        ->orWhereHas(
                            'batch',
                            fn($b) =>
                            $b->where('batch_code', 'like', "%{$search}%")
                        );
                });
            })

            // Filter by class
            ->when(
                $request->class,
                fn($q) =>
                $q->whereHas(
                    'batch.clazz',
                    fn($c) =>
                    $c->where('id', $request->class)
                )
            )

            // Filter by subject
            ->when(
                $request->subject,
                fn($q) =>
                $q->where('subject_id', $request->subject)
            )

            // Filter by batch
            ->when(
                $request->batch,
                fn($q) =>
                $q->where('batch_id', $request->batch)
            )

            // Date filters
            // ->when(
            //     $request->date_from && $request->date_to,
            //     fn($q) =>
            //     $q->whereBetween('class_date', [$request->date_from, $request->date_to])
            // )

            // Get only classes scheduled after today (after 23:59:59)
            ->whereBetween('class_date', [$from, $to])

            ->orderBy('class_date', 'asc')
            ->paginate(config('app.paginate'))
            ->withQueryString();

        return Inertia::render('Teacher/UpcomingClasses/index', [
            'sessions' => $sessions,
            'filters' => $request->only('search', 'status', 'subject', 'class', 'batch', 'date_from', 'date_to'),
            'classes' => $classes,
            'subjects' => $subjects,
            'batchesList' => $batches,
            'teacher' => $teacher,
        ]);
    }
    public function upcoming24Hours(Request $request)
    {
        $authUser = Auth::guard('teacher')->user();  // actual user
        $teacher = $authUser->teacher()->with('user:id,name')->first();
        // Current time + today dayend

        $from = now()->startOfDay();
        $to   = now()->endOfDay();
        // Get upcoming class sessions
        $sessions = $teacher->classSessions()
            ->with([
                'batch:id,batch_code,class_id',   // load class_id so clazz can load
                'batch.clazz:id,name',            // load clazz through batch
                'subject:id,name',
            ])
            ->whereBetween('class_date', [$from, $to])
            ->orderBy('class_date', 'asc')
            ->paginate(config('app.paginate'));

        return Inertia::render('Teacher/UpcomingClasses/upcoming24Hours', [
            'sessions' => $sessions,
            'from' => $from,
            'to' => $to,
        ]);
    }


    /**
     * Show the form for creating a new class session.
     */
    public function create()
    {
        $teacher = Auth::guard('teacher')->user();

        $batches = Batch::where('teacher_id', $teacher->id)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $subjects = Subject::whereIn('id', $batches->pluck('subject_id')->unique())
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Teacher/ClassSessions/Create', [
            'batches' => $batches,
            'subjects' => $subjects,
        ]);
    }

    /**
     * Store a newly created class session.
     */
    public function store(Request $request)
    {
        $teacher = Auth::guard('teacher')->user();

        $validated = $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'subject_id' => 'required|exists:subjects,id',
            'class_date' => 'required|date',
            'topic' => 'required|string|max:255',
            'zoom_meeting_id' => 'nullable|string|max:255',
            'zoom_join_url' => 'nullable|url',
            'zoom_start_url' => 'nullable|url',
            'recording_link' => 'nullable|url',
        ]);

        $validated['teacher_id'] = $teacher->id;
        $validated['status'] = 'scheduled';

        ClassSession::create($validated);

        return redirect()->route('teacher.class-sessions.index')->with('success', 'Class session created successfully');
    }

    /**
     * Show the form for editing a class session.
     */
    public function edit(ClassSession $classSession)
    {
        $teacher = Auth::guard('teacher')->user();

        if ($classSession->teacher_id !== $teacher->id) {
            abort(403, 'Unauthorized');
        }

        $batches = Batch::where('teacher_id', $teacher->id)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $subjects = Subject::whereIn('id', $batches->pluck('subject_id')->unique())
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Teacher/ClassSessions/Edit', [
            'classSession' => $classSession->load(['batch:id,name', 'subject:id,name']),
            'batches' => $batches,
            'subjects' => $subjects,
        ]);
    }

    /**
     * Update the specified class session.
     */
    public function update(Request $request, ClassSession $classSession)
    {
        $teacher = Auth::guard('teacher')->user();

        if ($classSession->teacher_id !== $teacher->id) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'subject_id' => 'required|exists:subjects,id',
            'class_date' => 'required|date',
            'topic' => 'required|string|max:255',
            'zoom_meeting_id' => 'nullable|string|max:255',
            'zoom_join_url' => 'nullable|url',
            'zoom_start_url' => 'nullable|url',
            'recording_link' => 'nullable|url',
            'status' => 'required|string|in:scheduled,live,completed,cancelled',
        ]);

        $classSession->update($validated);

        return back()->with('success', 'Class session updated successfully');
    }

    /**
     * Remove the specified class session.
     */
    public function destroy(ClassSession $classSession)
    {
        $teacher = Auth::guard('teacher')->user();

        if ($classSession->teacher_id !== $teacher->id) {
            abort(403, 'Unauthorized');
        }

        $classSession->delete();

        return back()->with('success', 'Class session deleted successfully');
    }
}
