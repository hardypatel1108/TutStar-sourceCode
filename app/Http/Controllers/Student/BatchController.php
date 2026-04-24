<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BatchController extends Controller
{
    public function index(Request $request)
    {
        $batches = Batch::query()
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->class, fn($q) => $q->where('class_id', $request->class))
            ->when($request->subject, fn($q) => $q->where('subject_id', $request->subject))
            ->when($request->search, function ($q) use ($request) {
                $q->where('batch_code', 'like', "%{$request->search}%");
            })
            ->with(['clazz', 'subject', 'teacher', 'plan'])
            ->paginate(config('app.paginate'));

        return Inertia::render('Student/Batches/Index', [
            'batches' => $batches,
            'filters' => $request->only('status', 'class', 'subject', 'search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Student/Batches/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'batch_code' => 'required|string|max:255|unique:batches,batch_code',
            'plan_id' => 'required|exists:plans,id',
            'class_id' => 'required|exists:clazzes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'students_limit' => 'required|integer|min:1',
            'status' => 'required|string',
        ]);

        Batch::create($validated);

        return redirect()->route('student.batches.index')->with('success', 'Batch created successfully.');
    }

    public function edit(Batch $batch)
    {
        return Inertia::render('Student/Batches/Edit', [
            'batch' => $batch->load(['clazz', 'subject', 'teacher', 'plan']),
        ]);
    }

    public function update(Request $request, Batch $batch)
    {
        $validated = $request->validate([
            'batch_code' => "required|string|max:255|unique:batches,batch_code,{$batch->id}",
            'plan_id' => 'required|exists:plans,id',
            'class_id' => 'required|exists:clazzes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'students_limit' => 'required|integer|min:1',
            'status' => 'required|string',
        ]);

        $batch->update($validated);

        return back()->with('success', 'Batch updated successfully.');
    }

    public function destroy(Batch $batch)
    {
        $batch->delete();
        return back()->with('success', 'Batch deleted successfully.');
    }

    public function show(Batch $batch)
    {
        return Inertia::render('Student/Batches/Show', [
            'batch' => $batch->load(['clazz', 'subject', 'teacher', 'plan', 'students']),
        ]);
    }
}
