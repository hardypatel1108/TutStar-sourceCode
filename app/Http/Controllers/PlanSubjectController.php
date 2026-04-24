<?php

namespace App\Http\Controllers;


use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Clazz;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanSubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($classId, $type)
    {
        $now = now();

        // Get ALL plans instead of just one
        $plans = Plan::with([
            'board:id,name',
            'clazz:id,name',
            'subjects:id,name,icon,color',
            'offers' => function ($q) use ($now) {
                $q->where('active', true)
                    ->where('starts_at', '<=', $now)
                    ->where('ends_at', '>=', $now);
            }
        ])
            ->where('class_id', $classId)
            ->where('type', $type)
            ->get(); // 🔥 CHANGED

        $student = auth()->check() ? auth()->user()->student : null;

        // Prepare all plan data
        $plansData = $plans->map(function ($plan) use ($student) {
            $ownedSubjectIds = [];
            $studentSubscription = null;

            if ($student) {
                $studentSubscription = $plan->subscriptions()
                    ->where('student_id', $student->id)
                    ->where('status', 'active')
                    ->first();

                if ($studentSubscription) {
                    $ownedSubjectIds = $plan->subjects->pluck('id')->toArray();
                }
            }

            return [
                'id' => $plan->id,
                'title' => $plan->title,
                'description' => $plan->description,
                'type' => $plan->type->value ?? $plan->type,
                'status' => $plan->status->value ?? $plan->status,
                'duration_days' => $plan->duration_days,
                'ongoing_batches' => $plan->ongoing_batches,
                'price' => $plan->price,
                'board' => $plan->board?->name,
                'class' => $plan->clazz?->name,
                'has_active_subscription' => (bool) $studentSubscription,

                'subjects' => $plan->subjects->map(fn($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'icon' => $s->icon ?? '/assets/svgs/default-subject.svg',
                    'color' => $s->color ?? '#2a70d3',
                    'already_owned' => in_array($s->id, $ownedSubjectIds),
                ]),

                'offers' => $plan->offers->map(fn($offer) => [
                    'id' => $offer->id,
                    'title' => $offer->title,
                    'type' => $offer->type,
                    'value' => $offer->value,
                    'starts_at' => $offer->starts_at,
                    'ends_at' => $offer->ends_at,
                    'active' => $offer->active,
                ]),

                'subscription' => $studentSubscription ? [
                    'start_at' => $studentSubscription->start_at,
                    'end_at' => $studentSubscription->end_at,
                    'status' => $studentSubscription->status->value ?? $studentSubscription->status,
                ] : null,
            ];
        });

        return Inertia::render('Plans', [
            'plans' => $plansData, // 🔥 CHANGED
        ]);
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    /**
     * Show details of a specific audit log.
     */
    public function show($id)
    {
        $now = now();
        $student = auth()->check() ? auth()->user()->student : null;

        // Load single plan with same filters as index()
        $plan = Plan::with([
            'board:id,name',
            'clazz:id,name',

            'subjects' => function ($q) {
                $q->select('subjects.id', 'subjects.name', 'subjects.icon', 'subjects.color')
                    ->with([
                        'overviews' => fn($q) =>
                        $q->with('points')->orderBy('sort_order'),
                        'features' => fn($q) =>
                        $q->orderBy('sort_order'),
                        'syllabusChapters' => fn($q) =>
                        $q->with('topics')->orderBy('sort_order'),
                    ]);
            },
            'offers' => function ($q) use ($now) {
                $q->where('active', true)
                    ->where('starts_at', '<=', $now)
                    ->where('ends_at', '>=', $now);
            }
        ])->findOrFail($id);

        // Determine student's subscription + owned subjects
        $ownedSubjectIds = [];
        $studentSubscription = null;

        if ($student) {
            $studentSubscription = $plan->subscriptions()
                ->where('student_id', $student->id)
                ->where('status', 'active')
                ->first();

            if ($studentSubscription) {
                $ownedSubjectIds = $plan->subjects->pluck('id')->toArray();
            }
        }

        // Prepare single plan data in SAME format as index()
        $planData = [
            'id' => $plan->id,
            'title' => $plan->title,
            'description' => $plan->description,
            'type' => $plan->type->value ?? $plan->type,
            'status' => $plan->status->value ?? $plan->status,
            'duration_days' => $plan->duration_days,
            'price' => $plan->price,
            'board' => $plan->board?->name,
            'class' => $plan->clazz?->name,

            'subjects' => $plan->subjects->map(function ($s) use ($ownedSubjectIds) {
                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'icon' => $s->icon ?? '/assets/svgs/default-subject.svg',
                    'color' => $s->color ?? '#2a70d3',
                    'already_owned' => in_array($s->id, $ownedSubjectIds),

                    'overviews' => $s->overviews->map(fn($o) => [
                        'title' => $o->title,
                        'pointer_type' => $o->pointer_type,
                        'points' => $o->points->pluck('content'),
                    ]),

                    'features' => $s->features->map(fn($f) => [
                        'title' => $f->title,
                        'description' => $f->description,
                    ]),

                    'syllabus' => $s->syllabusChapters->map(fn($c) => [
                        'chapter' => $c->name,
                        'topics' => $c->topics->pluck('title'),
                    ]),
                ];
            }),

            'offers' => $plan->offers->map(fn($offer) => [
                'id' => $offer->id,
                'title' => $offer->title,
                'type' => $offer->type,
                'value' => $offer->value,
                'starts_at' => $offer->starts_at,
                'ends_at' => $offer->ends_at,
                'active' => $offer->active,
            ]),

            'subscription' => $studentSubscription ? [
                'start_at' => $studentSubscription->start_at,
                'end_at' => $studentSubscription->end_at,
                'status' => $studentSubscription->status->value ?? $studentSubscription->status,
            ] : null,
        ];

        return Inertia::render('PlansDetail', [
            'plan' => $planData,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
