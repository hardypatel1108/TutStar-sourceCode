<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of the student's subscriptions.
     */
    public function index(Request $request)
    {
        $student = Auth::user()?->student;

        $subscriptions = StudentSubscription::query()
            ->where('student_id', $student?->id ?? 0)
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) =>
                $q->whereHas('plan', fn($p) =>
                    $p->where('title', 'like', "%{$request->search}%")
                )
            )
            ->with(['plan'])
            ->latest()
            ->paginate(config('app.paginate'))
            ->through(function ($subscription) {
                return [
                    'id' => $subscription->id,
                    'status' => $subscription->status instanceof \BackedEnum ? $subscription->status->value : (string) $subscription->status,
                    'plan' => [
                        'id' => $subscription->plan?->id,
                        'title' => $subscription->plan?->title,
                    ],
                    'start_at' => optional($subscription->start_at)->toDateTimeString(),
                    'end_at' => optional($subscription->end_at)->toDateTimeString(),
                    'start_at_formatted' => optional($subscription->start_at)->format('d M Y'),
                    'end_at_formatted' => optional($subscription->end_at)->format('d M Y'),
                    'days_left' => $subscription->end_at ? (int) now()->diffInDays($subscription->end_at, false) : null,
                    'auto_renew' => (bool) $subscription->auto_renew,
                    'price_paid' => (float) $subscription->price_paid,
                    'renew_url' => $subscription->plan_id ? route('checkout', ['id' => $subscription->plan_id]) : null,
                ];
            });

        return Inertia::render('Student/subscriptions', [
            'subscriptions' => $subscriptions->items(),
            'pagination' => [
                'current_page' => $subscriptions->currentPage(),
                'last_page' => $subscriptions->lastPage(),
                'per_page' => $subscriptions->perPage(),
                'total' => $subscriptions->total(),
            ],
            'filters' => $request->only('status', 'search'),
        ]);
    }
}
