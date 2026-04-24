<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Doubt;
use App\Models\ClassSession;
use App\Models\Clazz;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class DoubtController extends Controller
{
    /**
     * Display all doubts assigned to the current teacher.
     */
    public function index(Request $request)
    {
        $teacher = $this->currentTeacher();

        if (! $teacher) {
            return Inertia::render('Teacher/Doubts/index', [
                'doubts' => [
                    'data' => [],
                    'current_page' => 1,
                    'per_page' => (int) config('app.paginate', 10),
                    'total' => 0,
                    'links' => [],
                ],
                'filters' => $request->all(),
                'classes' => [],
                'csessions' => [],
                'students' => [],
            ]);
        }

        $query = Doubt::query()
            ->where('teacher_id', $teacher->id)
            ->with([
                'student.user:id,name',
                'session:id,topic,batch_id',
                'session.batch:id,class_id',
                'session.batch.clazz:id,name',
            ]);

        // 🔍 Search
        $query->when($request->search, function ($q) use ($request) {
            $q->where(function ($sub) use ($request) {
                $sub->where('question', 'like', "%{$request->search}%")
                    ->orWhereHas(
                        'student.user',
                        fn($u) => $u->where('name', 'like', "%{$request->search}%")
                    );
            });
        });

        // 🎯 Status
        $query->when(
            $request->status && $request->status !== 'all',
            fn($q) => $q->where('status', $request->status)
        );

        // 🎯 Class filter (FIXED)
        $query->when(
            $request->class,
            fn($q) =>
            $q->whereHas(
                'session.batch',
                fn($b) => $b->where('class_id', $request->class)
            )
        );

        // 🎯 Session filter
        $query->when(
            $request->csession,
            fn($q) => $q->where('classes_session_id', $request->csession)
        );

        // 🎯 Student filter
        $query->when(
            $request->student,
            fn($q) => $q->where('student_id', $request->student)
        );

        // 📅 Date range
        $query->when(
            $request->date_from,
            fn($q) => $q->whereDate('created_at', '>=', $request->date_from)
        );
        $query->when(
            $request->date_to,
            fn($q) => $q->whereDate('created_at', '<=', $request->date_to)
        );

        // SLA urgency filter for open doubts only.
        $query->when($request->urgency && $request->urgency !== 'all', function ($q) use ($request) {
            $now = now();
            $q->where('status', 'open');

            if ($request->urgency === 'critical') {
                $q->where('created_at', '<=', $now->copy()->subDay());
            } elseif ($request->urgency === 'high') {
                $q->whereBetween('created_at', [$now->copy()->subDay(), $now->copy()->subHours(8)]);
            } elseif ($request->urgency === 'medium') {
                $q->whereBetween('created_at', [$now->copy()->subHours(8), $now->copy()->subHours(2)]);
            } elseif ($request->urgency === 'low') {
                $q->where('created_at', '>=', $now->copy()->subHours(2));
            }
        });

        // Sort by urgency or latest.
        if ($request->sort === 'urgency') {
            $query->orderByRaw("
                CASE
                    WHEN status = 'open' AND created_at <= ? THEN 1
                    WHEN status = 'open' AND created_at <= ? THEN 2
                    WHEN status = 'open' AND created_at <= ? THEN 3
                    ELSE 4
                END ASC
            ", [now()->subDay(), now()->subHours(8), now()->subHours(2)]);
            $query->orderBy('created_at', 'asc');
        } else {
            $query->orderByDesc('id');
        }

        $doubts = $query
            ->paginate(config('app.paginate'))
            ->through(function ($doubt) {
                $ageHours = (int) floor($doubt->created_at?->diffInHours(now()) ?? 0);
                $doubt->sla_age_hours = $ageHours;

                $bucket = 'none';
                if ($doubt->status === 'open') {
                    if ($ageHours >= 24) {
                        $bucket = 'critical';
                    } elseif ($ageHours >= 8) {
                        $bucket = 'high';
                    } elseif ($ageHours >= 2) {
                        $bucket = 'medium';
                    } else {
                        $bucket = 'low';
                    }
                }

                $doubt->sla_bucket = $bucket;
                return $doubt;
            })
            ->withQueryString();

        // Students
        $students = Student::whereHas(
            'doubts',
            fn($q) => $q->where('teacher_id', $teacher->id)
        )
            ->with('user:id,name')
            ->get()
            ->unique('id')
            ->values();

        // Classes (via batch)
        $classes = Clazz::whereHas(
            'batches.sessions.doubts',
            fn($q) => $q->where('teacher_id', $teacher->id)
        )->get();

        // Sessions
        $sessions = ClassSession::where('teacher_id', $teacher->id)
            ->select('id', 'topic')
            ->get();

        return Inertia::render('Teacher/Doubts/index', [
            'doubts' => $doubts,
            'filters' => $request->all(),
            'classes' => $classes,
            'csessions' => $sessions,
            'students' => $students,
        ]);
    }


    /**
     * Show the form to create a new doubt (rare for teachers, optional).
     */
    public function create()
    {
        $teacher = $this->currentTeacher();
        if (! $teacher) {
            abort(403, 'Teacher profile not found.');
        }

        $sessions = ClassSession::where('teacher_id', $teacher->id)
            ->select('id', 'topic')
            ->get();

        return Inertia::render('Teacher/Doubts/Create', [
            'sessions' => $sessions,
        ]);
    }

    /**
     * Store a new doubt (in case teachers want to log one manually).
     */
    public function store(Request $request)
    {
        $teacher = $this->currentTeacher();
        if (! $teacher) {
            abort(403, 'Teacher profile not found.');
        }

        $validated = $request->validate([
            'classes_session_id' => 'required|exists:classes_sessions,id',
            'student_id' => 'required|exists:students,id',
            'question' => 'required|string|max:2000',
            'attachment' => 'nullable|file|max:2048',
        ]);

        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('doubts', 'public');
        }

        $validated['teacher_id'] = $teacher->id;
        $validated['status'] = 'open';

        Doubt::create($validated);

        return redirect()->route('teacher.doubts.index')
            ->with('success', 'Doubt created successfully');
    }

    /**
     * Show the form for editing a specific doubt.
     */
    public function edit(Doubt $doubt)
    {
        $this->authorizeDoubt($doubt);

        return Inertia::render('Teacher/Doubts/Edit', [
            'doubt' => $doubt->load(['student.user:id,name,email', 'session:id,topic']),
        ]);
    }

    public function show(Doubt $doubt)
    {
        $this->authorizeDoubt($doubt);

        return redirect()->route('teacher.doubts.index', ['focus' => $doubt->id]);
    }

    /**
     * Update the doubt details or status.
     */
    public function update(Request $request, Doubt $doubt)
    {
        $this->authorizeDoubt($doubt);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['open', 'answered', 'closed'])],
            'attachment' => 'nullable|file|max:2048',
            'question' => 'nullable|string|max:2000',
        ]);

        if ($request->hasFile('attachment')) {
            if ($doubt->attachment) {
                Storage::disk('public')->delete($doubt->attachment);
            }
            $validated['attachment'] = $request->file('attachment')->store('doubts', 'public');
        }

        $doubt->update($validated);

        return back()->with('success', 'Doubt updated successfully');
    }

    /**
     * Remove the specified doubt.
     */
    public function destroy(Doubt $doubt)
    {
        $this->authorizeDoubt($doubt);

        if ($doubt->attachment) {
            Storage::disk('public')->delete($doubt->attachment);
        }

        $doubt->delete();

        return back()->with('success', 'Doubt deleted successfully');
    }

    /**
     * Ensure this doubt belongs to the logged-in teacher.
     */
    protected function authorizeDoubt(Doubt $doubt)
    {
        $teacher = $this->currentTeacher();
        if (! $teacher || $doubt->teacher_id !== $teacher->id) {
            abort(403, 'Unauthorized access to this doubt');
        }
    }

    protected function currentTeacher(): ?Teacher
    {
        $authUser = Auth::guard('teacher')->user();
        if (! $authUser) {
            return null;
        }

        return $authUser->teacher ?? Teacher::query()->where('user_id', $authUser->id)->first();
    }
}
