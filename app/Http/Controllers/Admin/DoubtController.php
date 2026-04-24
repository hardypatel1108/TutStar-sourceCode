<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Doubt;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Clazz;
use App\Models\ClassSession;
use App\Models\Student;
use App\Models\Subject;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DoubtController extends Controller
{
    /**
     * Display a listing of doubts.
     */
    public function index(Request $request)
    {
        $doubts = Doubt::query()
            ->when($request->filled('status') && $request->status !== 'all', fn($q) => $q->where('status', $request->status))
            ->when($request->batch, function ($q) use ($request) {
                $q->whereHas('session', fn($s) => $s->where('batch_id', $request->batch));
            })
            ->when($request->subject, function ($q) use ($request) {
                $q->whereHas('session', fn($s) => $s->where('subject_id', $request->subject));
            })
            ->when($request->teacher, fn($q) => $q->where('teacher_id', $request->teacher))
            ->when($request->start_date, function ($q) use ($request) {
                $q->whereHas('session', fn($s) => $s->whereDate('class_date', '>=', $request->start_date));
            })
            ->when($request->end_date, function ($q) use ($request) {
                $q->whereHas('session', fn($s) => $s->whereDate('class_date', '<=', $request->end_date));
            })
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($query) use ($request) {
                    $query->where('question', 'like', "%{$request->search}%")
                        ->orWhereHas('student', function ($studentQuery) use ($request) {
                            $studentQuery->where('student_uid', 'like', "%{$request->search}%")
                                ->orWhereHas('user', fn($userQuery) => $userQuery->where('name', 'like', "%{$request->search}%"));
                        })
                        ->orWhereHas('teacher.user', fn($teacherQuery) => $teacherQuery->where('name', 'like', "%{$request->search}%"))
                        ->orWhereHas('session', fn($sessionQuery) => $sessionQuery->where('topic', 'like', "%{$request->search}%"));
                });
            })
            ->with([
                'student:id,user_id,student_uid',
                'student.user:id,name,email',
                'teacher:id,user_id',
                'teacher.user:id,name',
                'session:id,topic,batch_id,subject_id,teacher_id,class_date,status',
                'session.batch:id,batch_code as name',
                'session.subject:id,name',
            ])
            ->latest()
            ->paginate(config('app.paginate'))
            ->through(function ($doubt) {
                $doubt->uploaded_time_formatted = $doubt->created_at
                    ? Carbon::parse($doubt->created_at)->format('d M Y, h:i a')
                    : null;

                if ($doubt->session?->class_date) {
                    $doubt->session->class_date_formatted = Carbon::parse($doubt->session->class_date)->format('d M Y, h:i a');
                }

                return $doubt;
            })
            ->withQueryString();

        $classes = Clazz::select('id', 'name')->get();
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

        $students = Student::with('user:id,name')->get(['id', 'user_id']);

        return Inertia::render('Admin/Doubts/index', [
            'doubts' => $doubts,
            'classes' => $classes,
            'batches' => $batches,
            'subjects' => $subjects,
            'teachers' => $teachers,
            'students' => $students,
            'filters' => $request->only(
                'status',
                'batch',
                'subject',
                'teacher',
                'search',
                'start_date',
                'end_date'
            ),
        ]);
    }

    /**
     * Show the form for creating a new doubt (admin-side manual entry).
     */
    public function create()
    {
        $students = User::where('role', 'student')->select('id', 'name')->get();
        $teachers = User::where('role', 'teacher')->select('id', 'name')->get();
        $sessions = ClassSession::select('id', 'title')->get();

        return Inertia::render('Admin/Doubts/Create', [
            'students' => $students,
            'teachers' => $teachers,
            'sessions' => $sessions,
        ]);
    }

    /**
     * Store a newly created doubt.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'classes_session_id' => 'required|exists:class_sessions,id',
            'student_id' => 'required|exists:users,id',
            'teacher_id' => 'nullable|exists:users,id',
            'question' => 'required|string|max:1000',
            'attachment' => 'nullable|string|max:255',
            'status' => 'required|in:pending,resolved,rejected',
        ]);

        Doubt::create($validated);

        return redirect()->route('admin.doubts.index')->with('success', 'Doubt created successfully');
    }

    /**
     * Show the form for editing a doubt.
     */
    public function edit(Doubt $doubt)
    {
        $students = User::where('role', 'student')->select('id', 'name')->get();
        $teachers = User::where('role', 'teacher')->select('id', 'name')->get();
        $sessions = ClassSession::select('id', 'title')->get();

        return Inertia::render('Admin/Doubts/Edit', [
            'doubt' => $doubt->load('student:id,name', 'teacher:id,name', 'session:id,title'),
            'students' => $students,
            'teachers' => $teachers,
            'sessions' => $sessions,
        ]);
    }

    /**
     * Update the specified doubt.
     */
    public function update(Request $request, Doubt $doubt)
    {
        $validated = $request->validate([
            'classes_session_id' => 'required|exists:class_sessions,id',
            'student_id' => 'required|exists:users,id',
            'teacher_id' => 'nullable|exists:users,id',
            'question' => 'required|string|max:1000',
            'attachment' => 'nullable|string|max:255',
            'status' => 'required|in:pending,resolved,rejected',
        ]);

        $doubt->update($validated);

        return back()->with('success', 'Doubt updated successfully');
    }

    /**
     * Remove the specified doubt.
     */
    public function destroy(Doubt $doubt)
    {
        $doubt->delete();
        return back()->with('success', 'Doubt deleted successfully');
    }
}
