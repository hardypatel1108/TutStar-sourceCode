<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\ClassSession;
use App\Models\Event;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;


class StudentClazzController extends Controller
{
    /**
     * Display a listing of classes for the selected board.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if (! $user || ! $user->studentProfile) {
            return Inertia::render('Student/classes_detail', [
                'todayClasses' => [],
                'nearbyClasses' => [],
                'events' => [],
                'batches' => [],
                'message' => 'Student profile not found.'
            ]);
        }

        $student = $user->studentProfile;

        // Student batches
        $batchIds = $student->batches()
            ->wherePivot('status', 'active')
            ->where(function ($query) {
                $query->whereNull('batch_students.ended_at')
                    ->orWhere('batch_students.ended_at', '>', now());
            })
            ->pluck('batches.id');

        // Date range for today (midnight -> 23:59:59)
        $todayStart = now()->startOfDay()->toDateTimeString();
        $todayEnd   = now()->endOfDay()->toDateTimeString();

        // Eager loads used by both queries
        $with = [
            'batch:id,batch_code,class_id,subject_id',
            'batch.clazz:id,name,board_id',
            'batch.clazz.board:id,name',
            'subject:id,name,color,icon',
            'teacher.user:id,name,email'
        ];
        
        // Today's Classes
        $classes = ClassSession::with($with)
            ->whereIn('batch_id', $batchIds)
            ->whereBetween('class_date', [$todayStart, $todayEnd])
            ->orderBy('class_date', 'asc')
            ->get()
            ->map(function ($c) {
                $c->formatted_date = $this->formatDateTimePretty($c->class_date);
                $c->formatted_time = $this->formatTimePretty($c->class_date);
                return $c;
            });

             // 2) Nearby Classes: from (now - 15 minutes) to (now + 2 hours)
        $now = now();
        $nearStart = $now->copy()->subMinutes(15)->toDateTimeString();
        $nearEnd   = $now->copy()->addHours(2)->toDateTimeString();

        $nearbyClasses = ClassSession::with($with)
            ->whereIn('batch_id', $batchIds)
            ->whereBetween('class_date', [$nearStart, $nearEnd])
            ->orderBy('class_date', 'asc')
            ->get()
             ->map(function ($c) {
                $c->formatted_date = $this->formatDateTimePrettyNearbyClasses($c->class_date);
                return $c;
            });

        // Active Events
        $events = Event::query()
            ->where('active', true)
            ->orderBy('starts_at', 'asc')
            ->get();

        // Extract My Batches
        $batches = $student->batches()
            ->wherePivot('status', 'active')
            ->where(function ($query) {
                $query->whereNull('batch_students.ended_at')
                    ->orWhere('batch_students.ended_at', '>', now());
            })
            ->with([
                'subject:id,name',     
                'clazz:id,name',
                'plan:id,title',
                'teacher.user:id,name,email',
            ])
            ->get()
            ->map(function ($batch) {
        return [
            'batch_id'     => $batch->id,
            'plan_id'      => $batch->plan_id,
            'plan_title'   => $batch->plan?->title,
            'course'      => $batch->subject?->name,
            'teacher'     => $batch->teacher?->user?->name,
            'clazz'       => $batch->clazz?->name,
            'join_date'   => $batch->pivot?->joined_at?->format('d M Y'),
            'expire_date' => $batch->pivot?->ended_at?->format('d M Y'),
           
        ];
    });

        return Inertia::render('Student/classes_detail', [
            'todayClasses' => $classes,
            'nearbyClasses' => $nearbyClasses,
            'events' => $events,
            'batches' => $batches,
            'recommendedPlans' => $this->getRecommendedPlans($student),
        ]);
        // return Inertia::render('Student/classes_detail', [
        //     'todayClasses' => $classes,

        // ]);
        // return Inertia::render('Student/classes_detail');
    }
   private function formatDateTimePretty(string $datetime): string
{
    // Parse EXACTLY as UTC and DO NOT convert
    $date = Carbon::createFromFormat('Y-m-d H:i:s', $datetime, 'UTC');

    return $date->format('d F Y g:i A'); 
}
   private function formatTimePretty(string $datetime): string
{
    // Parse EXACTLY as UTC and DO NOT convert
    $date = Carbon::createFromFormat('Y-m-d H:i:s', $datetime, 'UTC');

    return $date->format('g:i A'); 
}
 private function formatDateTimePrettyNearbyClasses(string $datetime): string
{
    // Parse EXACTLY as UTC and DO NOT convert
    $date = Carbon::createFromFormat('Y-m-d H:i:s', $datetime, 'UTC');

    return $date->format('g:i A'); 
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
