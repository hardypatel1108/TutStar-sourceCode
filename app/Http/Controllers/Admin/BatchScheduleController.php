<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BatchSchedule;
use App\Models\Batch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BatchScheduleController extends Controller
{
    /**
     * Display a listing of batch schedules.
     */
    public function index(Request $request)
    {
        $schedules = BatchSchedule::query()
            ->when($request->batch, fn($q) => $q->where('batch_id', $request->batch))
            ->when($request->from, fn($q) => $q->whereDate('start_datetime', '>=', $request->from))
            ->when($request->to, fn($q) => $q->whereDate('end_datetime', '<=', $request->to))
           ->with([
                'batch' => function ($q) {
                    $q->select('id', 'batch_code', 'plan_id', 'class_id', 'subject_id', 'teacher_id')
                        ->with([
                            'plan:id,title',
                            'clazz:id,name',
                            'subject:id,name',
                            'teacher.user:id,name',
                        ]);
                },
            ])
            ->orderByDesc('start_datetime')
            ->paginate(config('app.paginate'))
            ->withQueryString();

        $batches = Batch::select('id', 'batch_code')->get();

        return Inertia::render('Admin/BatchSchedules/index', [
            'schedules' => $schedules,
            'batches' => $batches,
            'filters' => $request->only('batch', 'from', 'to'),
        ]);
    }

    /**
     * Show the form for creating a new batch schedule.
     */
    public function create()
    {
        $batches = Batch::select('id', 'name')->get();

        return Inertia::render('Admin/BatchSchedules/Create', [
            'batches' => $batches,
        ]);
    }

    /**
     * Store a newly created batch schedule in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'timezone' => 'required|string|max:100',
        ]);

        BatchSchedule::create($validated);

        return redirect()->route('admin.batch-schedules.index')->with('success', 'Batch schedule created successfully');
    }

    /**
     * Show the form for editing a batch schedule.
     */
    public function edit(BatchSchedule $batchSchedule)
    {
        $batches = Batch::select('id', 'name')->get();

        return Inertia::render('Admin/BatchSchedules/Edit', [
            'schedule' => $batchSchedule,
            'batches' => $batches,
        ]);
    }

    /**
     * Update the specified batch schedule.
     */
    public function update(Request $request, BatchSchedule $batchSchedule)
    {
        $validated = $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'timezone' => 'required|string|max:100',
        ]);

        $batchSchedule->update($validated);

        return back()->with('success', 'Batch schedule updated successfully');
    }

    /**
     * Remove the specified batch schedule from storage.
     */
    public function destroy(BatchSchedule $batchSchedule)
    {
        $batchSchedule->delete();
        return back()->with('success', 'Batch schedule deleted successfully');
    }
}
