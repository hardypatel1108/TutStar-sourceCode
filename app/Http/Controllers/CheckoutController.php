<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CheckoutOffer;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    /**
     * Display a listing of checkout offers.
     */
    public function index(Request $request, $id)
    {
        // return Inertia::render('Checkout');
        $now = now();
        $student = auth()->check() ? auth()->user()->student : null;

        // Load single plan with same filters as index()
        $plan = Plan::with([
            'board:id,name',
            'clazz:id,name',
            'subjects:id,name,icon,color',
            'offers' => function ($q) use ($now) {
                $q->where('active', true)
                    ->where('starts_at', '<=', $now)
                    ->where('ends_at', '>=', $now);
            },
            'checkoutPlans'
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
            'ongoing_batches' => (int) ($plan->ongoing_batches ?? 0),
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
            'checkoutPlans' => $plan->checkoutPlans->map(function ($checkoutPlan) {
                $now = now();

                return [
                    'id' => $checkoutPlan->id,
                    'title' => $checkoutPlan->title,
                    'months' => $checkoutPlan->months,
                    'offers' => $checkoutPlan->offers()
                        ->where('active', true)
                        ->where('starts_at', '<=', $now)
                        ->where('ends_at', '>=', $now)
                        ->get()
                        ->map(fn($offer) => [
                            'id' => $offer->id,
                            'title' => $offer->title,
                            'type' => $offer->type,
                            'value' => $offer->value,
                            'starts_at' => $offer->starts_at,
                            'ends_at' => $offer->ends_at,
                            'active' => $offer->active,
                        ]),
                ];
            }),
        ];
        return Inertia::render('Checkout', [
            'plan' => $planData,
        ]);
    }

    /**
     * Show the form for creating a new offer.
     */
    public function create()
    {
        return Inertia::render('Admin/CheckoutOffers/Create');
    }

    /**
     * Store a newly created offer in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'active' => 'required|boolean',
        ]);

        CheckoutOffer::create($validated);

        return redirect()->route('admin.checkout-offers.index')
            ->with('success', 'Checkout offer created successfully');
    }

    /**
     * Show the form for editing an offer.
     */
    public function edit(CheckoutOffer $checkoutOffer)
    {
        return Inertia::render('Admin/CheckoutOffers/Edit', [
            'offer' => $checkoutOffer,
        ]);
    }

    /**
     * Update the specified offer in storage.
     */
    public function update(Request $request, CheckoutOffer $checkoutOffer)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'active' => 'required|boolean',
        ]);

        $checkoutOffer->update($validated);

        return back()->with('success', 'Checkout offer updated successfully');
    }

    /**
     * Remove the specified offer.
     */
    public function destroy(CheckoutOffer $checkoutOffer)
    {
        $checkoutOffer->delete();
        return back()->with('success', 'Checkout offer deleted successfully');
    }
}
