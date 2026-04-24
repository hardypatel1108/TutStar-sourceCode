<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CheckoutOffer;
use App\Models\CheckoutPlan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckoutOfferController extends Controller
{
    /**
     * Display a listing of checkout offers.
     */
    public function index(Request $request)
    {
        $offers = CheckoutOffer::query()
            ->with([
                'checkoutPlan:id,plan_id,title,months',
                'checkoutPlan.plan:id,title',
            ])
            // Filter by active/inactive status
            ->when($request->status && $request->status !== 'all', function ($q) use ($request) {
                $q->where('active', $request->status === 'active' ? 1 : 0);
            })
            // Search by title
            ->when($request->search, function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%");
            })
            // Filter by type (percentage | flat)
            ->when($request->type && $request->type !== 'all', function ($q) use ($request) {
                $q->where('type', $request->type);
            })
            // Filter by date range
            ->when($request->start_date && $request->end_date, function ($q) use ($request) {
                $q->whereBetween('starts_at', [$request->start_date, $request->end_date])
                    ->orWhereBetween('ends_at', [$request->start_date, $request->end_date]);
            })
            ->orderByDesc('id')
            ->get()
            ->map(function ($offer) {
                $offer->starts_at_formatted = $offer->starts_at
                    ? Carbon::parse($offer->starts_at)->format('d M Y, h:i a')
                    : null;
                $offer->ends_at_formatted = $offer->ends_at
                    ? Carbon::parse($offer->ends_at)->format('d M Y, h:i a')
                    : null;
                $offer->checkout_plan_title = $offer->checkoutPlan?->title;
                $offer->checkout_plan_months = $offer->checkoutPlan?->months;
                $offer->base_plan_title = $offer->checkoutPlan?->plan?->title;
                return $offer;
            });

        $groupedOffers = $offers
            ->groupBy(fn($offer) => (int) ($offer->checkoutPlan?->plan_id ?? 0))
            ->filter(fn($items, $key) => $key > 0)
            ->map(function ($items) {
                $first = $items->first();
                $months = $items
                    ->pluck('checkout_plan_months')
                    ->filter()
                    ->unique()
                    ->sort()
                    ->values()
                    ->all();

                $checkoutPlans = $items
                    ->groupBy(fn($offer) => (int) ($offer->checkoutPlan?->id ?? 0))
                    ->filter(fn($planItems, $key) => $key > 0)
                    ->map(function ($planItems) {
                        $planFirst = $planItems->first();
                        return [
                            'checkout_plan_id' => $planFirst->checkoutPlan?->id,
                            'checkout_plan_title' => $planFirst->checkout_plan_title,
                            'checkout_plan_months' => $planFirst->checkout_plan_months,
                            'offers' => $planItems->map(function ($offer) {
                                return [
                                    'id' => $offer->id,
                                    'title' => $offer->title,
                                    'type' => $offer->type,
                                    'value' => $offer->value,
                                    'starts_at_formatted' => $offer->starts_at_formatted,
                                    'ends_at_formatted' => $offer->ends_at_formatted,
                                    'active' => (bool) $offer->active,
                                ];
                            })->values(),
                        ];
                    })
                    ->values();

                return [
                    'plan_id' => $first->checkoutPlan?->plan_id,
                    'base_plan_title' => $first->base_plan_title,
                    'months' => $months,
                    'checkout_plans' => $checkoutPlans,
                ];
            })
            ->values();

        return Inertia::render('Admin/CheckoutOffers/index', [
            'offers' => $groupedOffers,
            'filters' => $request->only(['status', 'search', 'type', 'start_date', 'end_date']),
        ]);
    }

    /**
     * Show the form for creating a new offer.
     */
    public function create()
    {
        $plans = CheckoutPlan::query()
            ->select('id', 'title', 'months', 'plan_id')
            ->with([
                'plan:id,title,type,price',
                'plan.subjects:id,name',
                'plan.offers' => fn($q) => $q->orderByDesc('id')->limit(5),
            ])
            ->orderBy('title')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'title' => $plan->title,
                    'months' => $plan->months,
                    'plan' => [
                        'id' => $plan->plan?->id,
                        'title' => $plan->plan?->title,
                        'type' => $plan->plan?->type instanceof \BackedEnum ? $plan->plan->type->value : (string) ($plan->plan?->type ?? ''),
                        'price' => $plan->plan?->price !== null ? (float) $plan->plan->price : null,
                        'subjects' => $plan->plan?->subjects?->pluck('name')->values() ?? collect(),
                        'offers' => $plan->plan?->offers?->map(fn($offer) => [
                            'id' => $offer->id,
                            'title' => $offer->title,
                            'type' => $offer->type,
                            'value' => (float) $offer->value,
                            'active' => (bool) $offer->active,
                        ])->values() ?? collect(),
                    ],
                ];
            });
        $activeConflictsByPlan = CheckoutOffer::query()
            ->where('active', true)
            ->select('checkout_plan_id', DB::raw('COUNT(*) as total'))
            ->groupBy('checkout_plan_id')
            ->pluck('total', 'checkout_plan_id');

        return Inertia::render('Admin/CheckoutOffers/create', [
            'plans' => $plans,
            'activeConflictsByPlan' => $activeConflictsByPlan,
        ]);
        // return Inertia::render('Admin/CheckoutOffers/create');
    }

    /**
     * Store a newly created offer in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'checkout_plan_id' => 'required|exists:checkout_plans,id',
            'title' => 'required|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'active' => 'nullable|boolean',
        ]);

        $validated['active'] = $request->boolean('active');

        DB::transaction(function () use ($validated) {
            $offer = CheckoutOffer::create($validated);

            if ((bool) $offer->active) {
                CheckoutOffer::query()
                    ->where('checkout_plan_id', $offer->checkout_plan_id)
                    ->where('id', '!=', $offer->id)
                    ->where('active', true)
                    ->update(['active' => false]);
            }
        });

        return redirect()->route('admin.checkoutOffers.index')
            ->with('success', 'Checkout offer created successfully');
    }

    /**
     * Show the form for editing an offer.
     */
    public function edit(CheckoutOffer $checkoutOffer)
    {
        $checkoutOffer->starts_at_local = $checkoutOffer->getRawOriginal('starts_at');
        $checkoutOffer->ends_at_local = $checkoutOffer->getRawOriginal('ends_at');
        $plans = CheckoutPlan::query()
            ->select('id', 'title', 'months', 'plan_id')
            ->with([
                'plan:id,title,type,price',
                'plan.subjects:id,name',
                'plan.offers' => fn($q) => $q->orderByDesc('id')->limit(5),
            ])
            ->orderBy('title')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'title' => $plan->title,
                    'months' => $plan->months,
                    'plan' => [
                        'id' => $plan->plan?->id,
                        'title' => $plan->plan?->title,
                        'type' => $plan->plan?->type instanceof \BackedEnum ? $plan->plan->type->value : (string) ($plan->plan?->type ?? ''),
                        'price' => $plan->plan?->price !== null ? (float) $plan->plan->price : null,
                        'subjects' => $plan->plan?->subjects?->pluck('name')->values() ?? collect(),
                        'offers' => $plan->plan?->offers?->map(fn($offer) => [
                            'id' => $offer->id,
                            'title' => $offer->title,
                            'type' => $offer->type,
                            'value' => (float) $offer->value,
                            'active' => (bool) $offer->active,
                        ])->values() ?? collect(),
                    ],
                ];
            });
        $activeConflictsByPlan = CheckoutOffer::query()
            ->where('active', true)
            ->where('id', '!=', $checkoutOffer->id)
            ->select('checkout_plan_id', DB::raw('COUNT(*) as total'))
            ->groupBy('checkout_plan_id')
            ->pluck('total', 'checkout_plan_id');

        return Inertia::render('Admin/CheckoutOffers/edit', [
            'offer' => $checkoutOffer,
            'plans' => $plans,
            'activeConflictsByPlan' => $activeConflictsByPlan,
        ]);
    }

    /**
     * Update the specified offer in storage.
     */
    public function update(Request $request, CheckoutOffer $checkoutOffer)
    {
        $validated = $request->validate([
            'checkout_plan_id' => 'required|exists:checkout_plans,id',
            'title'            => 'required|string|max:255',
            'type'             => 'required|in:percentage,fixed',
            'value'            => 'required|numeric|min:0',
            'starts_at'        => 'nullable|date',
            'ends_at'          => 'nullable|date|after_or_equal:starts_at',
            'active'           => 'required|boolean',
        ]);

        DB::transaction(function () use ($checkoutOffer, $validated) {
            $checkoutOffer->update($validated);

            if ((bool) $checkoutOffer->active) {
                CheckoutOffer::query()
                    ->where('checkout_plan_id', $checkoutOffer->checkout_plan_id)
                    ->where('id', '!=', $checkoutOffer->id)
                    ->where('active', true)
                    ->update(['active' => false]);
            }
        });
        return redirect()->route('admin.checkoutOffers.index')->with('success', 'Checkout offer updated successfully');
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
