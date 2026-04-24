<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlanSubject;
use App\Models\Plan;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanSubjectController extends Controller
{
    /**
     * Display a listing of plan–subject mappings.
     */
    public function index(Request $request)
    {
        $planSubjects = PlanSubject::query()
            ->when($request->plan, fn($q) => $q->where('plan_id', $request->plan))
            ->when($request->subject, fn($q) => $q->where('subject_id', $request->subject))
            ->with(['plan:id,name', 'subject:id,name'])
            ->orderByDesc('id')
            ->paginate(config('app.paginate'))
            ->withQueryString();

        $plans = Plan::select('id', 'name')->get();
        $subjects = Subject::select('id', 'name')->get();

        return Inertia::render('Admin/PlanSubjects/Index', [
            'planSubjects' => $planSubjects,
            'plans' => $plans,
            'subjects' => $subjects,
            'filters' => $request->only('plan', 'subject'),
        ]);
    }

    /**
     * Show the form for creating a new mapping.
     */
    public function create()
    {
        $plans = Plan::select('id', 'name')->get();
        $subjects = Subject::select('id', 'name')->get();

        return Inertia::render('Admin/PlanSubjects/Create', [
            'plans' => $plans,
            'subjects' => $subjects,
        ]);
    }

    /**
     * Store a newly created mapping in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        // prevent duplicate mapping
        $exists = PlanSubject::where('plan_id', $validated['plan_id'])
            ->where('subject_id', $validated['subject_id'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['subject_id' => 'This subject is already linked to the selected plan.']);
        }

        PlanSubject::create($validated);

        return redirect()->route('admin.plansubjects.index')->with('success', 'Plan–Subject mapping added successfully.');
    }

    /**
     * Show the form for editing the specified mapping.
     */
    public function edit(PlanSubject $planSubject)
    {
        $plans = Plan::select('id', 'name')->get();
        $subjects = Subject::select('id', 'name')->get();

        return Inertia::render('Admin/PlanSubjects/Edit', [
            'planSubject' => $planSubject->load(['plan', 'subject']),
            'plans' => $plans,
            'subjects' => $subjects,
        ]);
    }

    /**
     * Update the specified mapping.
     */
    public function update(Request $request, PlanSubject $planSubject)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $duplicate = PlanSubject::where('plan_id', $validated['plan_id'])
            ->where('subject_id', $validated['subject_id'])
            ->where('id', '!=', $planSubject->id)
            ->exists();

        if ($duplicate) {
            return back()->withErrors(['subject_id' => 'This subject is already linked to the selected plan.']);
        }

        $planSubject->update($validated);

        return back()->with('success', 'Plan–Subject mapping updated successfully.');
    }

    /**
     * Remove the specified mapping.
     */
    public function destroy(PlanSubject $planSubject)
    {
        $planSubject->delete();
        return back()->with('success', 'Plan–Subject mapping deleted successfully.');
    }
}
