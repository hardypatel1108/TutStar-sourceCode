<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CheckoutOffer;
use App\Models\ClassSession;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    /**
     * Display a listing of checkout offers.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Get student profile (Student model)
        $student = $user->studentProfile;

        if (! $student) {
            return response()->json([
                'sessions' => [],
                'message' => 'No student profile found.',
            ]);
        }

        // Get active batch IDs student is enrolled in
        $batchIds = $student->batches()
            ->wherePivot('status', 'active')
            ->where(function ($q) {
                $q->whereNull('batch_students.ended_at')
                    ->orWhere('batch_students.ended_at', '>', now());
            })
            ->pluck('batches.id');

        // Fetch all class sessions from these batches
        $todayStart = now()->startOfDay()->toDateTimeString();
$weekEnd    = now()->addDays(7)->endOfDay()->toDateTimeString();

        $schedule = ClassSession::with([
            'batch:id,batch_code,class_id,subject_id',
            'batch.clazz:id,name,board_id',
            'batch.clazz.board:id,name',
            'subject:id,name',
            'teacher.user:id,name,email'
        ])
            ->whereIn('batch_id', $batchIds)
            ->whereBetween('class_date', [$todayStart, $weekEnd])
            ->orderBy('class_date', 'asc')
            ->get()  ->map(function ($c) {
                $c->classTime = $this->formatTimePretty($c->class_date);
                $c->classDate = $this->formatDatePretty($c->class_date);
                $c->classDay = $this->classDayPretty($c->class_date);
                
                 // ---------------------------
                // 📌 PAST OR COMPLETED CHECK
                // ---------------------------

                // Convert stored class_date as Carbon UTC
                $classDate = \Carbon\Carbon::parse($c->class_date)->utc(); 

                // Current time UTC
                $now = now()->utc();

                // 1) If COMPLETED → always true
                if ($c->status === 'completed' || $c->status === 'COMPLETED') {
                    $c->isPastOrCompleted = true;
                }
                // 2) Else if class date is older than 1 hour from now → true
                elseif ($classDate->lt($now->copy()->subHour())) {
                    $c->isPastOrCompleted = true;
                }
                // 3) Otherwise → false
                else {
                    $c->isPastOrCompleted = false;
                }
                
                return $c;
            });
        // ----- Upcoming Events (Active Only) -----
        $now = now();

        $nearStart = $now->copy()->subMinutes(15)->toDateTimeString();
        $minEnd    = $now->copy()->addHour()->toDateTimeString();
        $events = Event::query()
            ->whereHas('batches', function ($q) use ($batchIds) {
                $q->whereIn('batches.id', $batchIds);
            })
            ->where('active', true)
            ->where('starts_at', '>=', $nearStart)
            ->where('ends_at', '>=', $minEnd)
            ->orderBy('starts_at', 'asc')
            ->get()->map(function ($c){
                 $c->uiTime = $this->formatUiTimePretty($c->starts_at);
                return $c;
            });

        return Inertia::render('Student/schedule', [
            'scheduleData' => $schedule,
            'events'       => $events,
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
    public function store(Request $request) {}

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

     private function formatTimePretty(string $datetime): string
    {
        // Parse EXACTLY as UTC and DO NOT convert
        $date = Carbon::createFromFormat('Y-m-d H:i:s', $datetime, 'UTC');

        return $date->format('g:i A'); 
    }
     private function formatDatePretty(string $datetime): string
    {
        // Parse EXACTLY as UTC and DO NOT convert
        $date = Carbon::createFromFormat('Y-m-d H:i:s', $datetime, 'UTC');

        return $date->format('d M Y'); 
    }
   private function classDayPretty(string $datetime): string
    {
        // Parse EXACTLY as UTC and DO NOT convert
        $date = Carbon::createFromFormat('Y-m-d H:i:s', $datetime, 'UTC');

        return $date->format('D'); 
    }
   private function formatUiTimePretty(string $datetime): string
    {
        // Parse EXACTLY as UTC and DO NOT convert
        $date = Carbon::createFromFormat('Y-m-d H:i:s', $datetime, 'UTC');
 $hours = $date->format('g');      // 1–12
    $minutes = $date->format('i');    // 00–59
    $ampm = $date->format('A');       // AM / PM
    $fullDate = $date->format('d F Y');

    // If minutes are "00", show only hour + AM/PM
    if ($minutes === '00') {
        return "{$hours} {$ampm}, {$fullDate}";
    }

    // Otherwise show full time with minutes
    return "{$hours}:{$minutes} {$ampm}, {$fullDate}";
    }
}
