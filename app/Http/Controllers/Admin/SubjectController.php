<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Subject;
use App\Models\Clazz;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SubjectController extends Controller
{
    /**
     * Display a listing of subjects.
     */
    public function index(Request $request)
    {
        $subjects = Subject::query()
            ->with([
                'clazz:id,name,board_id',
                'batches:id,subject_id,batch_code,status,teacher_id,class_id',
                'classSessions:id,subject_id,batch_id,class_date,status'
            ])

            // Filter by subject status
            ->when($request->status, fn($q) => $q->where('status', $request->status))

            // Filter by class
            ->when($request->class, fn($q) => $q->where('class_id', $request->class))

            // Filter by board (via class)
            ->when(
                $request->board,
                fn($q) =>
                $q->whereHas(
                    'clazz',
                    fn($c) =>
                    $c->where('board_id', $request->board)
                )
            )

            // Filter by batch status
            ->when(
                $request->batch_status,
                fn($q) =>
                $q->whereHas(
                    'batches',
                    fn($b) =>
                    $b->where('status', $request->batch_status)
                )
            )

            // Filter by class session status
            ->when(
                $request->session_status,
                fn($q) =>
                $q->whereHas(
                    'classSessions',
                    fn($s) =>
                    $s->where('status', $request->session_status)
                )
            )

            // Filter by search (name or code)
            ->when(
                $request->search,
                fn($q) =>
                $q->where(function ($query) use ($request) {
                    $query->where('name', 'like', "%{$request->search}%")
                        ->orWhere('code', 'like', "%{$request->search}%");
                })
            )

            // Filter by subject assigned to specific plan
            ->when(
                $request->plan,
                fn($q) =>
                $q->whereHas(
                    'planSubjects',
                    fn($ps) =>
                    $ps->where('plan_id', $request->plan)
                )
            )

            ->orderByDesc('id')
            ->paginate(config('app.paginate'))
            ->withQueryString();

        // Filter options
        $classes = Clazz::select('id', 'name')->get();
        $boards = Board::select('id', 'name')->get();
        $plans = Plan::select('id', 'title')->get();

        return Inertia::render('Admin/Subjects/index', [
            'subjects' => $subjects,
            'classes' => $classes,
            'boards' => $boards,
            'plans' => $plans,
            'filters' => $request->only('status', 'class', 'board', 'batch_status', 'session_status', 'plan', 'search'),
        ]);
    }


    /**
     * Show the form for creating a new subject.
     */
    public function create()
    {
        $boards = Board::select('id', 'name')->get();

        return Inertia::render('Admin/Subjects/create', [
            'boards' => $boards,
        ]);
    }

    /**
     * Show the form for creating a new subject prefilled from an existing one.
     */
    public function copy(Subject $subject)
    {
        $boards = Board::select('id', 'name')->get();
        $classes = Clazz::where('board_id', $subject->board_id)
            ->select('id', 'name')
            ->get();

        return Inertia::render('Admin/Subjects/create', [
            'boards' => $boards,
            'classes' => $classes,
            'subjectCopy' => [
                'board_id' => $subject->board_id,
                'class_id' => $subject->class_id,
                'name' => "{$subject->name} (Copy)",
                'code' => "{$subject->code}-copy",
                'description' => $subject->description,
                'status' => $subject->status,
                'color' => $subject->color,
                'icon' => $subject->icon,
            ],
        ]);
    }

    /**
     * Store a newly created subject.
     */
    public function store(Request $request)
    {

        $validated = $request->validate([
            'board_id'    => 'required|exists:boards,id',
            'class_id'    => 'required|exists:classes,id',
            'name'        => 'required|string|max:255',
            'code'        => 'required|string|max:50|unique:subjects,code',
            'description' => 'nullable|string',
            'status'      => 'required|in:active,inactive',
            'icon'        => 'nullable|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
            'color'       => 'nullable|string|max:50',
        ]);

        if ($request->hasFile('icon')) {
            $validated['icon'] = $request->file('icon')->store('subjects/icons', 'public');
        }
        Subject::create($validated);

        return redirect()->route('admin.subjects.index')->with('success', 'Subject created successfully');
    }

    /**
     * Show the form for editing a subject.
     */
    public function edit(Subject $subject)
    {
        $boards = Board::select('id', 'name')->get();

        // Load classes only for selected board
        $classes = Clazz::where('board_id', $subject->board_id)
            ->select('id', 'name')
            ->get();

        return Inertia::render('Admin/Subjects/edit', [
            'subject' => $subject,
            'boards' => $boards,
            'classes' => $classes,
        ]);
    }

    /**
     * Update the specified subject.
     */
    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'board_id' => 'required|exists:boards,id',
            'class_id' => 'required|exists:classes,id',
            'name' => 'required|string|max:255',
            'code' => "required|string|max:50|unique:subjects,code,{$subject->id}",
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'icon'        => 'nullable|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
            'color' => 'nullable|string|max:50',
        ]);
        // ✅ If new icon uploaded
        if ($request->hasFile('icon')) {

            // delete old icon if exists
            if ($subject->icon && Storage::disk('public')->exists($subject->icon)) {
                Storage::disk('public')->delete($subject->icon);
            }

            // store new icon
            $validated['icon'] = $request->file('icon')->store('subjects/icons', 'public');
        }
        $subject->update($validated);
        return redirect()->route('admin.subjects.index')->with('success', 'Subject updated successfully');
    }

    /**
     * Remove the specified subject.
     */
    public function destroy(Subject $subject)
    {
        $subject->delete();
        return back()->with('success', 'Subject deleted successfully');
    }
}
