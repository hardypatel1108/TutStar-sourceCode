<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Board;
use App\Models\PracticeTest;
use App\Models\Clazz;
use App\Models\Subject;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;


class PracticeTestController extends Controller
{
    /**
     * Display all practice tests for the logged-in teacher.
     */
    public function index(Request $request)
    {
        $teacher = Auth::guard('teacher')->user()?->teacher;

        if (! $teacher) {
            return Inertia::render('Teacher/PracticeTests/index', [
                'practicetests' => null,
                'filters' => $request->all(),
                'subjects' => [],
                'batches' => [],
                'teacher' => null,
            ]);
        }

        $query = PracticeTest::query()
            ->where('teacher_id', $teacher->id)
            ->with([
                'batch:id,batch_code,class_id,subject_id',
                'batch.clazz:id,name,board_id',
                'batch.clazz.board:id,name',
                'batch.subject:id,name',
            ]);

        // 🔍 Search
        if ($request->filled('search')) {
            $query->where(
                fn($q) =>
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%")
            );
        }

        // 🎯 Subject filter
        if ($request->filled('subject')) {
            $query->whereHas(
                'batch',
                fn($b) => $b->where('subject_id', $request->subject)
            );
        }

        // 🎯 Batch filter
        if ($request->filled('batch')) {
            $query->where('batch_id', $request->batch);
        }

        // 📅 Due date range
        if ($request->filled('date_from')) {
            $query->whereDate('due_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('due_date', '<=', $request->date_to);
        }

        $practicetests = $query
            ->orderByDesc('id')
            ->paginate(config('app.paginate'))
            ->through(function ($pt) {
                $pt->due_date_formatted = $pt->due_date
                    ? $pt->due_date->format('d M Y, h:i a')
                    : null;

                $minutesDiff = $pt->created_at?->diffInMinutes(now()) ?? 999999;
                $pt->can_edit = $minutesDiff <= 30;
                $pt->edit_block_reason = $pt->can_edit
                    ? null
                    : 'Editing is allowed only within 30 minutes of creation.';

                return $pt;
            })
            ->withQueryString();

        return Inertia::render('Teacher/PracticeTests/index', [
            'practicetests' => $practicetests,
            'filters' => $request->only(
                'search',
                'subject',
                'batch',
                'date_from',
                'date_to'
            ),
            'subjects' => Subject::select('id', 'name')->orderBy('name')->get(),
            'batches' => Batch::where('teacher_id', $teacher->id)
                ->select('id', 'batch_code')
                ->orderBy('batch_code')
                ->get(),
            'teacher' => $teacher->load('user:id,name'),
        ]);
    }


    /**
     * Show form to create a new practice test.
     */
    public function create()
    {
        $teacher = Auth::guard('teacher')->user()?->teacher;

        if (! $teacher) {
            return Inertia::render('Teacher/PracticeTests/Create', [
                'batches' => [],
                'blocked' => true,
                'message' => 'Unauthorized access.',
            ]);
        }

        $batches = Batch::where('teacher_id', $teacher->id)
            ->with('clazz:id,name', 'subject:id,name')
            ->select('id', 'batch_code', 'class_id', 'subject_id')
            ->orderBy('batch_code')
            ->get();

        return Inertia::render('Teacher/PracticeTests/create', [
            'batches' => $batches,
            'blocked' => false,
        ]);
    }


    /**
     * Store a newly created practice test.
     */
    public function store(Request $request)
    {
        $teacherId = Auth::guard('teacher')->user()?->teacher->id;

        $validated = $request->validate([
            'batch_id'    => 'required|exists:batches,id',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'required|date|after:now',
            'attachment'  => 'nullable|file|max:5120',
        ]);

        // Ensure batch belongs to teacher
        Batch::where('id', $validated['batch_id'])
            ->where('teacher_id', $teacherId)
            ->firstOrFail();

        $validated['teacher_id'] = $teacherId;

        if ($request->hasFile('attachment')) {
            $validated['attachment'] =
                $request->file('attachment')->store('practice-tests', 'public');
        }

        PracticeTest::create($validated);

        return redirect()
            ->route('teacher.practiceTests.index')
            ->with('success', 'Practice test created successfully.');
    }


    /**
     * Show form for editing a practice test.
     */
    public function edit(PracticeTest $practiceTest)
    {
        $teacherId = Auth::guard('teacher')->user()?->teacher?->id;

        abort_unless($practiceTest->teacher_id === $teacherId, 403);
        $practiceTest->due_date_local = $practiceTest->getRawOriginal('due_date');
        $canEdit = $practiceTest->created_at?->diffInMinutes(now()) <= 30;
        if (! $canEdit) {
            return redirect()
                ->route('teacher.practiceTests.index')
                ->withErrors([
                    'edit' => 'Editing is allowed only within 30 minutes of creation.',
                ]);
        }

        return Inertia::render('Teacher/PracticeTests/edit', [
            'practiceTest' => $practiceTest->load('batch'),
            'canEdit' => $canEdit,
            'edit_block_reason' => $canEdit ? null : 'Editing is allowed only within 30 minutes of creation.',
        ]);
    }


    /**
     * Update a practice test.
     */
    public function update(Request $request, PracticeTest $practiceTest)
    {
        $teacherId = Auth::guard('teacher')->user()?->teacher?->id;

        abort_unless($practiceTest->teacher_id === $teacherId, 403);

        if (($practiceTest->created_at?->diffInMinutes(now()) ?? 999999) > 30) {
            return back()
                ->withInput()
                ->withErrors([
                    '_error' => 'Editing is allowed only within 30 minutes of creation.',
                ]);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date|after:now',
            'attachment' => 'nullable|file|max:10240',
        ]);

        if ($request->hasFile('attachment')) {
            if ($practiceTest->attachment) {
                Storage::disk('public')->delete($practiceTest->attachment);
            }

            $validated['attachment'] =
                $request->file('attachment')->store('practice-tests', 'public');
        }

        $validated['due_date'] = Carbon::parse($validated['due_date']);

        $practiceTest->update($validated);

        return back()->with('success', 'Practice test updated successfully.');
    }


    /**
     * Delete a practice test.
     */
    public function destroy(PracticeTest $practiceTest)
    {
        $teacherId = Auth::guard('teacher')->user()?->teacher?->id;

        abort_unless($practiceTest->teacher_id === $teacherId, 403);

        if ($practiceTest->attachment) {
            Storage::disk('public')->delete($practiceTest->attachment);
        }

        $practiceTest->delete();

        return back()->with('success', 'Practice test deleted successfully.');
    }
}
