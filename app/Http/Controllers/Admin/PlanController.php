<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Board;
use App\Models\Clazz;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PlanController extends Controller
{
    /**
     * Display a listing of the plans.
     */
    public function index(Request $request)
    {
        $plans = Plan::query()
            ->with([
                'board:id,name',
                'clazz:id,name',
                'subjects:id,name',
                'offers:id,plan_id,title,active',
                'batches:id,plan_id',
                'subscriptions:id,plan_id',
            ])

            /**
             * Filter: Status (active/inactive)
             */
            ->when(
                $request->status,
                fn($q) =>
                $q->where('status', $request->status)
            )

            /**
             * Filter: Type (single/combo/all)
             */
            ->when(
                $request->type,
                fn($q) =>
                $q->where('type', $request->type)
            )

            /**
             * Filter: Board
             */
            ->when(
                $request->board,
                fn($q) =>
                $q->where('board_id', $request->board)
            )

            /**
             * Filter: Class
             */
            ->when(
                $request->class,
                fn($q) =>
                $q->where('class_id', $request->class)
            )

            /**
             * Filter: Subject (via many-to-many)
             */
            ->when($request->subject, function ($q) use ($request) {
                $q->whereHas(
                    'subjects',
                    fn($s) =>
                    $s->where('subjects.id', $request->subject)
                );
            })

            /**
             * Filter: Price Range
             */
            ->when(
                $request->min_price,
                fn($q) =>
                $q->where('price', '>=', $request->min_price)
            )
            ->when(
                $request->max_price,
                fn($q) =>
                $q->where('price', '<=', $request->max_price)
            )

            /**
             * Filter: Duration Range (days)
             */
            ->when(
                $request->min_duration,
                fn($q) =>
                $q->where('duration_days', '>=', $request->min_duration)
            )
            ->when(
                $request->max_duration,
                fn($q) =>
                $q->where('duration_days', '<=', $request->max_duration)
            )

            /**
             * Filter: Has Offer (active offers only)
             */
            ->when(
                $request->has_offer,
                fn($q) =>
                $q->whereHas(
                    'offers',
                    fn($s) =>
                    $s->where('active', true)
                )
            )

            /**
             * Full Text Search: Title / Description
             */
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($inner) use ($request) {
                    $inner->where('title', 'like', "%{$request->search}%")
                        ->orWhere('description', 'like', "%{$request->search}%");
                });
            })

            /**
             * Sort by newest first
             */
            ->orderByDesc('id')

            ->paginate(config('app.paginate'))
            ->withQueryString();


        // Load filters data
        $boards = Board::select('id', 'name')->get();
        $classes = Clazz::select('id', 'name')->get();
        $subjects = Subject::select('id', 'name')->get();

        return Inertia::render('Admin/Plans/index', [
            'plans' => $plans,
            'boards' => $boards,
            'classes' => $classes,
            'subjects' => $subjects,
            'filters' => $request->only([
                'status',
                'type',
                'board',
                'class',
                'subject',
                'min_price',
                'max_price',
                'min_duration',
                'max_duration',
                'has_offer',
                'search'
            ]),
        ]);
    }


    /**
     * Show the form for creating a new plan.
     */
    public function create()
    {
        // $boards = Board::select('id', 'name')->get();
        // $classes = Clazz::select('id', 'name')->get();

        // return Inertia::render('Admin/Plans/Create', [
        //     'boards' => $boards,
        //     'classes' => $classes,
        // ]);
        return Inertia::render('Admin/Plans/create', [
            'boards' => Board::select('id', 'name')->get(),
        ]);
    }

    /**
     * Store a newly created plan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'board_id'        => 'required|exists:boards,id',
            'class_id'        => 'required|exists:classes,id',
            'title'           => 'required|string|max:255',
            'type'            => 'required|in:single,combo,all',
            'duration_days'   => 'required|integer|min:1',
            'ongoing_batches' => 'required|integer|min:0',
            'price'           => 'required|numeric|min:0',
            'description'     => 'nullable|string',
            'status'          => 'required|in:active,inactive',

            // subject_ids validation
            'subject_ids' => [
                $request->type === 'all' ? 'nullable' : 'required',
                function ($attribute, $value, $fail) use ($request) {

                    // SINGLE → must be numeric
                    if ($request->type === 'single' && !is_numeric($value)) {
                        return $fail("A single subject must be selected.");
                    }

                    // COMBO → must be array
                    if ($request->type === 'combo' && !is_array($value)) {
                        return $fail("Subject selection must be an array.");
                    }
                }
            ],

            // validate only if combo or all
            'subject_ids.*' => $request->type === 'combo'
                ? 'exists:subjects,id'
                : 'nullable',
        ]);

        /**
         * Normalize subject IDs
         */
        if ($validated['type'] === 'all') {
            // Auto select all subjects for the class
            $validated['subject_ids'] = Subject::where('class_id', $validated['class_id'])
                ->pluck('id')
                ->toArray();
        }

        if ($validated['type'] === 'single') {
            // Convert to array
            $validated['subject_ids'] = [(int) $request->subject_ids];
        }

        /** Create plan */
        $plan = Plan::create($validated);

        /** Sync subjects for all types */
        if (!empty($validated['subject_ids'])) {
            $plan->subjects()->sync($validated['subject_ids']);
        }

        return redirect()
            ->route('admin.plans.edit', $plan)
            ->with('success', 'Plan created successfully');
    }

    /**
     * Get classes by board
     */
    public function classesByBoard($boardId)
    {
        return Clazz::where('board_id', $boardId)
            ->select('id', 'name')
            ->get();
    }

    /**
     * Get subjects by class
     */
    public function subjectsByClass($classId)
    {
        return Subject::where('class_id', $classId)
            ->select('id', 'name')
            ->get();
    }

    /**
     * Show the form for editing the specified plan.
     */
    public function edit(Plan $plan)
    {
        $boards = Board::select('id', 'name')->get();

        // Load classes of the plan's board
        $classes = Clazz::where('board_id', $plan->board_id)
            ->select('id', 'name')
            ->get();

        // Load subjects of the plan's class
        $subjects = Subject::where('class_id', $plan->class_id)
            ->select('id', 'name')
            ->get();

        $planOffers = $plan->offers()
            ->orderByDesc('id')
            ->get(['id', 'plan_id', 'title', 'type', 'value', 'active', 'starts_at', 'ends_at'])
            ->map(function ($offer) {
                return [
                    'id' => $offer->id,
                    'title' => $offer->title,
                    'type' => $offer->type,
                    'value' => (float) $offer->value,
                    'active' => (bool) $offer->active,
                    'starts_at_formatted' => $offer->starts_at ? Carbon::parse($offer->starts_at)->format('d M Y') : null,
                    'ends_at_formatted' => $offer->ends_at ? Carbon::parse($offer->ends_at)->format('d M Y') : null,
                ];
            });

        return Inertia::render('Admin/Plans/edit', [
            'plan' => $plan->load('subjects:id'),
            'boards' => $boards,
            'classes' => $classes,
            'subjects' => $subjects,
            'selectedSubjects' => $plan->subjects->pluck('id'),
            'planOffers' => $planOffers,
        ]);
    }

    /**
     * Update the specified plan.
     */
    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'board_id'        => 'required|exists:boards,id',
            'class_id'        => 'required|exists:classes,id',
            'title'           => 'required|string|max:255',
            'type'            => 'required|in:single,combo,all',
            'duration_days'   => 'required|integer|min:1',
            'ongoing_batches' => 'required|integer|min:0',
            'price'           => 'required|numeric|min:0',
            'description'     => 'nullable|string',
            'status'          => 'required|in:active,inactive',

            'subject_ids' => [
                $request->type === 'all' ? 'nullable' : 'required',
                function ($attribute, $value, $fail) use ($request) {

                    if ($request->type === 'single' && !is_numeric($value)) {
                        return $fail("A single subject must be selected.");
                    }

                    if ($request->type === 'combo' && !is_array($value)) {
                        return $fail("Subject selection must be an array.");
                    }
                }
            ],

            'subject_ids.*' => $request->type === 'combo'
                ? 'exists:subjects,id'
                : 'nullable',
        ]);

        /** Normalize subject IDs **/
        if ($validated['type'] === 'all') {
            $validated['subject_ids'] = Subject::where('class_id', $validated['class_id'])
                ->pluck('id')
                ->toArray();
        }

        if ($validated['type'] === 'single') {
            $validated['subject_ids'] = [(int) $request->subject_ids];
        }

        /** Update base fields */
        $plan->update($validated);

        /** Sync subjects */
        if (!empty($validated['subject_ids'])) {
            $plan->subjects()->sync($validated['subject_ids']);
        }

        return redirect()
            ->route('admin.plans.index')
            ->with('success', 'Plan updated successfully');
    }

    /**
     * Remove the specified plan.
     */
    public function destroy(Plan $plan)
    {
        $plan->delete();
        return back()->with('success', 'Plan deleted successfully');
    }
}
