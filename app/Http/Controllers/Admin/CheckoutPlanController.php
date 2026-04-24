<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CheckoutOffer;
use App\Models\CheckoutPlan;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CheckoutPlanController extends Controller
{
    /**
     * Display a listing of checkout offers.
     */
    public function index(Request $request)
    {
        $plans = Plan::query()
            ->with([
                'checkoutPlans' => fn($q) => $q
                    ->withCount('offers')
                    ->orderBy('months')
                    ->orderBy('id'),
            ])
            ->whereHas('checkoutPlans')
            ->orderBy('title')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'title' => $plan->title,
                    'checkout_plans' => $plan->checkoutPlans->map(function ($checkoutPlan) {
                        return [
                            'id' => $checkoutPlan->id,
                            'title' => $checkoutPlan->title,
                            'months' => $checkoutPlan->months,
                            'offers_count' => $checkoutPlan->offers_count,
                        ];
                    })->values(),
                ];
            });

        return Inertia::render('Admin/CheckoutPlans/index', [
            'plans' => $plans,
        ]);
    }

    /**
     * Show the form for creating a new offer.
     */
    public function create()
    {
        return Inertia::render('Admin/CheckoutPlans/create', [
            'plans' => Plan::query()
                ->select('id', 'title', 'type', 'price')
                ->with([
                    'subjects:id,name',
                    'offers' => fn($q) => $q->orderByDesc('id')->limit(5),
                ])
                ->orderBy('title')
                ->get()
                ->map(function ($plan) {
                    return [
                        'id' => $plan->id,
                        'name' => $plan->title,
                        'type' => $plan->type instanceof \BackedEnum ? $plan->type->value : (string) ($plan->type ?? ''),
                        'price' => $plan->price !== null ? (float) $plan->price : null,
                        'subjects' => $plan->subjects->pluck('name')->values(),
                        'offers' => $plan->offers->map(fn($offer) => [
                            'id' => $offer->id,
                            'title' => $offer->title,
                            'type' => $offer->type,
                            'value' => (float) $offer->value,
                            'active' => (bool) $offer->active,
                        ])->values(),
                    ];
                }),
        ]);
    }



    /**
     * Store a newly created offer in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'title' => 'nullable|string|max:255',
            'months' => 'required|integer|min:1',
        ]);

        $validated['title'] = trim((string) ($validated['title'] ?? ''));
        if ($validated['title'] === '') {
            $planTitle = Plan::query()->whereKey($validated['plan_id'])->value('title');
            $validated['title'] = $planTitle
                ? "{$planTitle} - {$validated['months']} Month(s)"
                : "Plan {$validated['plan_id']} - {$validated['months']} Month(s)";
        }

        $checkoutPlan = CheckoutPlan::create($validated);

        return redirect()
            ->route('admin.checkoutPlans.edit', $checkoutPlan)
            ->with('success', 'Checkout plan created successfully');
    }

    /**
     * Show the form for editing an offer.
     */
    public function edit(CheckoutPlan $checkoutPlan)
    {
        return Inertia::render('Admin/CheckoutPlans/edit', [
            'checkoutPlan' => $checkoutPlan,
            'plans' => Plan::query()
                ->select('id', 'title', 'type', 'price')
                ->with([
                    'subjects:id,name',
                    'offers' => fn($q) => $q->orderByDesc('id')->limit(5),
                ])
                ->orderBy('title')
                ->get()
                ->map(function ($plan) {
                    return [
                        'id' => $plan->id,
                        'name' => $plan->title,
                        'type' => $plan->type instanceof \BackedEnum ? $plan->type->value : (string) ($plan->type ?? ''),
                        'price' => $plan->price !== null ? (float) $plan->price : null,
                        'subjects' => $plan->subjects->pluck('name')->values(),
                        'offers' => $plan->offers->map(fn($offer) => [
                            'id' => $offer->id,
                            'title' => $offer->title,
                            'type' => $offer->type,
                            'value' => (float) $offer->value,
                            'active' => (bool) $offer->active,
                        ])->values(),
                    ];
                }),
        ]);
    }


    /**
     * Update the specified offer in storage.
     */
    public function update(Request $request, CheckoutPlan $checkoutPlan)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'title'   => 'nullable|string|max:255',
            'months'  => 'required|integer|min:1',
        ]);

        $validated['title'] = trim((string) ($validated['title'] ?? ''));
        if ($validated['title'] === '') {
            $planTitle = Plan::query()->whereKey($validated['plan_id'])->value('title');
            $validated['title'] = $planTitle
                ? "{$planTitle} - {$validated['months']} Month(s)"
                : "Plan {$validated['plan_id']} - {$validated['months']} Month(s)";
        }

        $checkoutPlan->update($validated);

        return redirect()
            ->route('admin.checkoutPlans.index')
            ->with('success', 'Checkout plan updated successfully');
    }

    /**
     * Remove the specified offer.
     */
    public function destroy(CheckoutPlan $checkoutPlan)
    {
        $checkoutPlan->delete();
        return back()->with('success', 'Checkout offer deleted successfully');
    }
}
