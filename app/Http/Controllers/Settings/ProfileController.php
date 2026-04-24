<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Board;
use App\Models\Clazz;
use App\Models\Payment;
use App\Models\Plan;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Image\Image;
use App\Services\NotificationService;
use App\Enums\NotificationType;
class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $student = auth()->user()->student()
            ->with([
                'clazz',
                'batches' => fn($q) => $q->with(['teacher.user', 'subject', 'clazz']),
            ])
            ->first();

        if (! $student) {
            return Inertia::render('settings/profile', [
                'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
                'status' => $request->session()->get('status'),
                'studentProfile' => null,
                'recommendedPlans' => [],
                'payments' => [
                    'data' => [],
                    'links' => [],
                ],
                'classes' => Clazz::select('id', 'name', 'board_id')
                    ->orderBy('ordinal')
                    ->orderBy('name')
                    ->get(),
                'boards' => Board::select('id', 'name')->orderBy('name')->get(),
            ]);
        }

        $student->batches->each(function ($batch) {
            $pivot = $batch->pivot;

            $batch->joined_at_formatted = $pivot?->joined_at
                ? $pivot->joined_at->format('d M Y, h:i a')
                : null;

            $batch->ended_at_formatted = $pivot?->ended_at
                ? $pivot->ended_at->format('d M Y, h:i a')
                : null;

            $batch->is_active = $pivot?->isActive() ?? false;
            $batch->is_completed = $pivot?->isCompleted() ?? false;
        });
        $payments = Payment::query()
            ->where('student_id', $student->id)
            ->with([
                'checkoutPlan.plan.subjects:id,name',
                'checkoutPlan.plan:id,title,type,price',
                'checkoutPlan:id,plan_id,title,months',
            ])
            ->latest()
            ->paginate(10, ['*'], 'payments_page')
            ->through(function ($payment) {
                $gateway = $payment->gateway instanceof \BackedEnum ? $payment->gateway->value : (string) $payment->gateway;
                $status = $payment->status instanceof \BackedEnum ? $payment->status->value : (string) $payment->status;

                $plan = $payment->checkoutPlan?->plan;
                $planTypeValue = $plan?->type instanceof \BackedEnum ? $plan->type->value : (string) ($plan?->type ?? '');
                $months = (int) ($payment->checkoutPlan?->months ?? 0);
                $planPrice = $plan?->price !== null ? (float) $plan->price : null;
                $mrpTotal = $planPrice !== null
                    ? ($months > 0 ? ($planPrice * $months) : $planPrice)
                    : null;
                $amountPaid = (float) ($payment->amount ?? 0);
                $discount = $mrpTotal !== null ? max(0, $mrpTotal - $amountPaid) : null;

                if ($payment->checkoutPlan) {
                    $expiry = $payment->created_at
                        ->copy()
                        ->addMonths($payment->checkoutPlan->months);

                    $payment->expiry_date = $expiry;
                    $payment->expiry_date_formatted = $expiry->format('d M Y');
                    $payment->is_expired = $expiry->isPast();
                    $payment->days_left = now()->diffInDays($expiry, false);
                } else {
                    $payment->expiry_date = null;
                    $payment->expiry_date_formatted = null;
                    $payment->is_expired = true;
                    $payment->days_left = null;
                }

                $payment->gateway = $gateway;
                $payment->status = $status;
                $payment->plan_title = $plan?->title;
                $payment->plan_type = $planTypeValue ?: null;
                $payment->plan_price = $planPrice;
                $payment->plan_subjects = $plan?->subjects?->pluck('name')->values() ?? collect();
                $payment->checkout_months = $months ?: null;
                $payment->mrp_total = $mrpTotal;
                $payment->discount_amount = $discount;

                return $payment;
            });

        $recommendedPlans = collect();
        if ($student) {
            $recommendedPlans = $this->getRecommendedPlans($student);
        }

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'studentProfile' => $student,
            'recommendedPlans' => $recommendedPlans,
            'payments' => $payments,

            'classes' => Clazz::select('id', 'name', 'board_id')
                ->orderBy('ordinal')
                ->orderBy('name')
                ->get(),
            'boards' => Board::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $student = $user->student;

        // Handle profile image
        if ($request->hasFile('profile_image')) {
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }

            $user->profile_image = $request
                ->file('profile_image')
                ->store('profile-images', 'public');

            Image::load(storage_path("app/public/{$user->profile_image}"))
                // ->crop(300, 300)
                ->optimize()
                ->save();
        }

        // Update user
        $user->fill($request->only(['email', 'phone']));
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        $user->save();

        // Update student profile
        if ($student) {
            $studentUpdatePayload = $request->only(['board_id', 'class_id', 'school', 'city', 'state']);

            $student->update($studentUpdatePayload);
        }
 // 🔔 Send In-App Notification
    app(NotificationService::class)->send(
        $user,
        title: "Profile Updated",
        message: "Your profile details have been updated successfully.",
        type: NotificationType::SYSTEM,
        sendEmail: false, // In-app only
        payload: [
            'action_text' => 'View Profile',
            'action_url'  => '/settings/profile',
            'priority'    => 'low',
            'icon'        => 'edit'
        ]
    );
        return back()->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    private function getRecommendedPlans($student)
    {
        if (empty($student->class_id) || empty($student->board_id)) {
            return collect();
        }

        $now = now();

        $ownedPlanIdsFromSubscriptions = $student->subscriptions()
            ->where('status', 'active')
            ->pluck('plan_id')
            ->toArray();

        $ownedPlanIdsFromBatches = $student->batches()
            ->wherePivot('status', 'active')
            ->where(function ($query) use ($now) {
                $query->whereNull('batch_students.ended_at')
                    ->orWhere('batch_students.ended_at', '>', $now);
            })
            ->pluck('batches.plan_id')
            ->toArray();

        $ownedPlanIds = array_values(array_unique(array_filter(array_merge($ownedPlanIdsFromSubscriptions, $ownedPlanIdsFromBatches))));

        $ownedSubjectIds = Plan::query()
            ->whereIn('id', $ownedPlanIds)
            ->with('subjects:id')
            ->get()
            ->flatMap(fn($plan) => $plan->subjects->pluck('id'))
            ->unique()
            ->values()
            ->toArray();

        return Plan::query()
            ->with([
                'board:id,name',
                'clazz:id,name',
                'subjects:id,name,color,icon',
                'offers' => function ($query) use ($now) {
                    $query->where('active', true)
                        ->where('starts_at', '<=', $now)
                        ->where('ends_at', '>=', $now)
                        ->orderByDesc('value');
                },
            ])
            ->where('status', 'active')
            ->where('class_id', $student->class_id)
            ->where('board_id', $student->board_id)
            ->when(! empty($ownedPlanIds), fn($query) => $query->whereNotIn('id', $ownedPlanIds))
            ->orderByDesc('created_at')
            ->take(8)
            ->get()
            ->map(function ($plan) use ($ownedSubjectIds) {
                $activeOffer = $plan->offers->first();
                $subjects = $plan->subjects->map(function ($subject) use ($ownedSubjectIds) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                        'icon' => $subject->icon,
                        'color' => $subject->color,
                        'already_owned' => in_array($subject->id, $ownedSubjectIds),
                    ];
                })->values();

                return [
                    'id' => $plan->id,
                    'title' => $plan->title,
                    'price' => (float) $plan->price,
                    'ongoing_batches' => (int) ($plan->ongoing_batches ?? 0),
                    'type' => $plan->type instanceof \BackedEnum ? $plan->type->value : (string) $plan->type,
                    'class_name' => $plan->clazz?->name,
                    'board_name' => $plan->board?->name,
                    'description' => $plan->description,
                    'subjects' => $subjects,
                    'new_subjects_count' => $subjects->where('already_owned', false)->count(),
                    'active_offer' => $activeOffer ? [
                        'title' => $activeOffer->title,
                        'type' => $activeOffer->type,
                        'value' => (float) $activeOffer->value,
                    ] : null,
                    'checkout_url' => route('checkout', ['id' => $plan->id]),
                ];
            })
            ->values();
    }
}
