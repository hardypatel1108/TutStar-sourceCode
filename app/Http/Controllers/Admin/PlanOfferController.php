<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PlanType;
use App\Http\Controllers\Controller;
use App\Models\PlanOffer;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class PlanOfferController extends Controller
{
    /**
     * Display a listing of plan offers.
     */
    public function index(Request $request)
    {
        $search = trim((string) $request->search);
        $now = now();

        $baseOfferFilter = function ($q) use ($request) {
            $q->when($request->status, function ($query) use ($request) {
                $query->where('active', $request->status === 'active');
            })
                ->when($request->type, fn($query) => $query->where('type', $request->type))
                ->when($request->min_value, fn($query) => $query->where('value', '>=', $request->min_value))
                ->when($request->max_value, fn($query) => $query->where('value', '<=', $request->max_value))
                ->when($request->starts_from, fn($query) => $query->whereDate('starts_at', '>=', $request->starts_from))
                ->when($request->starts_to, fn($query) => $query->whereDate('starts_at', '<=', $request->starts_to))
                ->when($request->ends_from, fn($query) => $query->whereDate('ends_at', '>=', $request->ends_from))
                ->when($request->ends_to, fn($query) => $query->whereDate('ends_at', '<=', $request->ends_to));
        };

        $planOffers = Plan::query()
            ->select('id', 'title', 'board_id', 'class_id', 'type')
            ->when($request->plan, fn($q) => $q->whereKey($request->plan))
            ->whereHas('offers', $baseOfferFilter)
            ->when($search !== '', function ($q) use ($search, $baseOfferFilter) {
                $q->where(function ($inner) use ($search, $baseOfferFilter) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhereHas('offers', function ($offerQuery) use ($search, $baseOfferFilter) {
                            $baseOfferFilter($offerQuery);
                            $offerQuery->where('title', 'like', "%{$search}%");
                        });
                });
            })
            ->with([
                'offers' => function ($q) use ($baseOfferFilter) {
                    $baseOfferFilter($q);
                    $q->orderByDesc('id');
                }
            ])
            ->orderBy('title')
            ->paginate(config('app.paginate'))
            ->through(function (Plan $plan) use ($now) {
                $offers = $plan->offers->map(function (PlanOffer $offer) use ($now) {
                    $startsAt = $offer->starts_at ? Carbon::parse($offer->starts_at) : null;
                    $endsAt = $offer->ends_at ? Carbon::parse($offer->ends_at) : null;
                    $isActiveNow = (bool) $offer->active
                        && (!$startsAt || $startsAt->lte($now))
                        && (!$endsAt || $endsAt->gte($now));

                    return [
                        'id' => $offer->id,
                        'title' => $offer->title,
                        'type' => $offer->type,
                        'value' => (float) $offer->value,
                        'active' => (bool) $offer->active,
                        'starts_at' => $offer->starts_at,
                        'ends_at' => $offer->ends_at,
                        'starts_at_formatted' => $offer->starts_at ? Carbon::parse($offer->starts_at)->format('d M Y') : null,
                        'ends_at_formatted' => $offer->ends_at ? Carbon::parse($offer->ends_at)->format('d M Y') : null,
                        'is_currently_active' => $isActiveNow,
                    ];
                })->values();

                $activeOffer = $offers->firstWhere('is_currently_active', true)
                    ?? $offers->firstWhere('active', true);

                return [
                    'id' => $plan->id,
                    'title' => $plan->title,
                    'type' => $plan->type instanceof \BackedEnum ? $plan->type->value : (string) ($plan->type ?? ''),
                    'offers' => $offers,
                    'active_offer' => $activeOffer,
                ];
            })
            ->withQueryString();

        // Dropdown Filters
        $plans = Plan::select('id', 'title')->get();
        $planTypes = PlanType::cases();
        $offerTypes = PlanOffer::select('type')->distinct()->pluck('type');


        return Inertia::render('Admin/PlanOffers/index', [
            'planOffers' => $planOffers,
            'plans' => $plans,
            'offerTypes' => $offerTypes,
            'planTypes' => $planTypes,
            'filters' => $request->only([
                'status',
                'plan',
                'type',
                'min_value',
                'max_value',
                'starts_from',
                'starts_to',
                'ends_from',
                'ends_to',
                'search'
            ]),
        ]);
    }


    /**
     * Show the form for creating a new plan offer.
     */
    public function create(Request $request)
    {
        $plans = Plan::query()
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
            });
        $now = now();
        $activeConflictsByPlan = PlanOffer::query()
            ->where('active', true)
            ->where('starts_at', '<=', $now)
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->select('plan_id', DB::raw('COUNT(*) as total'))
            ->groupBy('plan_id')
            ->pluck('total', 'plan_id');

        return Inertia::render('Admin/PlanOffers/create', [
            'plans' => $plans,
            'activeConflictsByPlan' => $activeConflictsByPlan,
            'selectedPlanId' => $request->get('plan_id'),
        ]);
    }

    /**
     * Store a newly created plan offer.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'title' => 'required|string|max:255',
            'type' => 'required|in:percentage,flat',
            'value' => 'required|numeric|min:0',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'active' => 'required|boolean',
        ]);

        DB::transaction(function () use ($validated) {
            $offer = PlanOffer::create($validated);

            if ((bool) $offer->active) {
                PlanOffer::query()
                    ->where('plan_id', $offer->plan_id)
                    ->where('id', '!=', $offer->id)
                    ->where('active', true)
                    ->update(['active' => false]);
            }
        });

        return redirect()->route('admin.planOffers.index')->with('success', 'Plan offer created successfully');
    }

    /**
     * Show the form for editing a plan offer.
     */
    public function edit(PlanOffer $plan_offer)
    {


        $plan_offer->starts_at_local = $plan_offer->getRawOriginal('starts_at');
        $plan_offer->ends_at_local = $plan_offer->getRawOriginal('ends_at');
        $plans = Plan::query()
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
            });
        $now = now();
        $activeConflictsByPlan = PlanOffer::query()
            ->where('active', true)
            ->where('id', '!=', $plan_offer->id)
            ->where('starts_at', '<=', $now)
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->select('plan_id', DB::raw('COUNT(*) as total'))
            ->groupBy('plan_id')
            ->pluck('total', 'plan_id');

        return Inertia::render('Admin/PlanOffers/edit', [
            'planOffer' => $plan_offer,
            'plans' => $plans,
            'activeConflictsByPlan' => $activeConflictsByPlan,
        ]);
    }

    /**
     * Update the specified plan offer.
     */
    public function update(Request $request, PlanOffer $plan_offer)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'title' => 'required|string|max:255',
            'type' => 'required|in:percentage,flat',
            'value' => 'required|numeric|min:0',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'active' => 'required|boolean',
        ]);

        DB::transaction(function () use ($plan_offer, $validated) {
            $plan_offer->update($validated);

            if ((bool) $plan_offer->active) {
                PlanOffer::query()
                    ->where('plan_id', $plan_offer->plan_id)
                    ->where('id', '!=', $plan_offer->id)
                    ->where('active', true)
                    ->update(['active' => false]);
            }
        });

        return redirect()
            ->route('admin.planOffers.index')
            ->with('success', 'Plan offer updated successfully');
    }

    /**
     * Remove the specified plan offer.
     */
    public function destroy(PlanOffer $plan_offer)
    {
        $plan_offer->delete();
        return back()->with('success', 'Plan offer deleted successfully');
    }
}
