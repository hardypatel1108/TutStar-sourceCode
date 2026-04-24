<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Plan;
use App\Models\Clazz;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class BatchController extends Controller
{
    /**
     * Display a listing of batches.
     */
    public function index(Request $request)
    {
        $authUser = Auth::guard('teacher')->user();
        $teacher = $authUser?->teacher ?? Teacher::query()->where('user_id', $authUser?->id)->first();

        if (! $teacher) {
            return Inertia::render('Teacher/Batches/index', [
                'batches' => [
                    'data' => [],
                    'current_page' => 1,
                    'per_page' => (int) config('app.paginate', 10),
                    'total' => 0,
                    'links' => [],
                ],
                'classes' => [],
                'subjects' => [],
                'plans' => [],
                'teacher' => null,
                'filters' => $request->only('status', 'class', 'subject', 'plan', 'search'),
                'warning' => 'Teacher profile mapping is missing. Please contact admin.',
            ]);
        }

        $query = Batch::query()
            ->where('teacher_id', $teacher->id)
            ->with([
                'plan:id,title',
                'clazz:id,name',
                'subject:id,name',
                'teacher.user:id,name',
            ])->withCount('students');;

        // Filters
        $query->when(
            $request->status && $request->status !== 'all',
            fn($q) =>
            $q->where('status', $request->status)
        );

        $query->when(
            $request->class,
            fn($q) =>
            $q->where('class_id', $request->class)
        );

        $query->when(
            $request->subject,
            fn($q) =>
            $q->where('subject_id', $request->subject)
        );

        $query->when(
            $request->plan,
            fn($q) =>
            $q->where('plan_id', $request->plan)
        );

        $query->when($request->search, function ($q) use ($request) {
            $q->where(function ($sub) use ($request) {
                $sub->where('batch_code', 'like', "%{$request->search}%");
            });
        });

        // Ordering & pagination
        $batches = $query->orderByDesc('id')->paginate(config('app.paginate'))->withQueryString();

        // Dropdowns derived from this teacher's batches (user-specific)
        $classes = Clazz::whereHas('batches', fn($q) => $q->where('teacher_id', $teacher->id))
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $subjects = Subject::whereHas('batches', fn($q) => $q->where('teacher_id', $teacher->id))
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $plans = Plan::whereHas('batches', fn($q) => $q->where('teacher_id', $teacher->id))
            ->select('id', 'title')
            ->orderBy('title')
            ->get();

        return Inertia::render('Teacher/Batches/index', [
            'batches' => $batches,
            'classes' => $classes,
            'subjects' => $subjects,
            'plans' => $plans,
            'teacher' => $teacher,
            'filters' => $request->only('status', 'class', 'subject', 'plan', 'search'),
        ]);
    }
    /**
     * Show the form for creating a new batch.
     */
    public function create()
    {
        // $classes = Clazz::select('id', 'name')->get();
        // $subjects = Subject::select('id', 'name')->get();
        // $teachers = Teacher::select('id', 'name')->get();
        // $plans = Plan::select('id', 'name')->get();

        // return Inertia::render('Admin/Batches/Create', [
        //     'classes' => $classes,
        //     'subjects' => $subjects,
        //     'teachers' => $teachers,
        //     'plans' => $plans,
        // ]);

        return Inertia::render('Admin/Batches/create', [
            'plans' => Plan::select('id', 'title')->get(),
            'teachers' => Teacher::with('user:id,name')->get()->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->user->name
            ]),
        ]);
    }

    /**
     * Store a newly created batch.
     */
    public function store(Request $request)
    {
        // $validated = $request->validate([
        //     'batch_code' => 'required|string|max:50|unique:batches,batch_code',
        //     'plan_id' => 'required|exists:plans,id',
        //     'class_id' => 'required|exists:clazzes,id',
        //     'subject_id' => 'required|exists:subjects,id',
        //     'teacher_id' => 'required|exists:teachers,id',
        //     'students_limit' => 'required|integer|min:1',
        //     'status' => 'required|in:active,inactive,completed',
        // ]);
        $validated = $request->validate([
            'batch_code' => 'required|string|max:50|unique:batches,batch_code',
            'plan_id' => 'required|exists:plans,id',
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'students_limit' => 'required|integer|min:1',
            'status' => 'required|in:upcoming,active,inactive,completed',
        ]);
        Batch::create($validated);

        return redirect()->route('admin.batches.index')->with('success', 'Batch created successfully');
    }
    /**
     * Dynamic Subjects by Class
     */
    public function subjectsByClass($classId)
    {
        return Subject::where('class_id', $classId)
            ->select('id', 'name')
            ->get();
    }

    /**
     * Dynamic Classes by Plan
     */
    public function classesByPlan($planId)
    {
        $plan = Plan::findOrFail($planId);

        return Clazz::where('id', $plan->class_id)
            ->select('id', 'name')
            ->get();
    }
    public function teachersBySubject($subjectId)
    {
        return Teacher::whereHas(
            'subjects',
            fn($q) =>
            $q->where('subjects.id', $subjectId)
        )
            ->with('user:id,name')
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->user->name
            ]);
    }
    /**
     * Show the form for editing the specified batch.
     */
    public function edit(Batch $batch)
    {
        $batch->load(['plan', 'clazz', 'subject', 'teacher.user']);

        return Inertia::render('Admin/Batches/edit', [
            'batch' => [
                'id' => $batch->id,
                'batch_code' => $batch->batch_code,
                'plan_id' => $batch->plan_id,
                'class_id' => $batch->class_id,
                'subject_id' => $batch->subject_id,
                'teacher_id' => $batch->teacher_id,
                'students_limit' => $batch->students_limit,
                'status' => $batch->status,
            ],

            // Dropdowns
            'plans' => Plan::select('id', 'title')->get(),

            'teachers' => Teacher::with('user:id,name')->get()->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->user->name
            ]),

            // Preload dependent values
            'classes' => Clazz::select('id', 'name')->get(),
            'subjects' => Subject::select('id', 'name')->get(),
        ]);
    }


    /**
     * Update the specified batch.
     */
    public function update(Request $request, Batch $batch)
    {
        $validated = $request->validate([
            'batch_code' => "required|string|max:50|unique:batches,batch_code,{$batch->id}",
            'plan_id' => 'required|exists:plans,id',
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'students_limit' => 'required|integer|min:1',
            'status' => 'required|in:upcoming,active,inactive,completed',
        ]);
        $batch->update($validated);
        return redirect()->route('admin.batches.index')->with('success', 'Batch updated successfully');
    }

    /**
     * Remove the specified batch from storage.
     */
    public function destroy(Batch $batch)
    {
        $batch->delete();
        return back()->with('success', 'Batch deleted successfully');
    }
}
