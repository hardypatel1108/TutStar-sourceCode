<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Plan;
use App\Models\Clazz;
use App\Models\Board;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\ClassSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\NotificationService;
use App\Enums\NotificationType;
use Carbon\Carbon;

class BatchController extends Controller
{
    private const LEGACY_SLOT_MAP = [
        'morning' => '05:00-12:00',
        'afternoon' => '12:00-16:00',
        'slot_4_6_pm' => '16:00-18:00',
        'evening' => '18:00-21:00',
        'night' => '21:00-05:00',
    ];

    /**
     * Display a listing of batches.
     */
    public function index(Request $request)
    {
        $batches = Batch::query()
            ->when(
                $request->status,
                fn($q) =>
                $q->where('status', $request->status)
            )
            ->when(
                $request->class,
                fn($q) =>
                $q->where('class_id', $request->class)
            )
            ->when(
                $request->subject,
                fn($q) =>
                $q->where('subject_id', $request->subject)
            )
            ->when(
                $request->teacher,
                fn($q) =>
                $q->where('teacher_id', $request->teacher)
            )
            ->when(
                $request->plan,
                fn($q) =>
                $q->where('plan_id', $request->plan)
            )
            ->when(
                $request->board,
                fn($q) =>
                $q->whereHas('clazz', fn($clazzQuery) => $clazzQuery->where('board_id', $request->board))
            )
            ->when(
                $request->time_slot,
                fn($q) =>
                $q->where('time_slot', $request->time_slot)
            )
            ->when(
                $request->search,
                fn($q) =>
                $q->where(function ($query) use ($request) {
                    $query->where('batch_code', 'like', "%{$request->search}%")
                        ->orWhereHas('teacher.user', fn($teacherQuery) => $teacherQuery->where('name', 'like', "%{$request->search}%"));
                })
            )
            ->with([
                'plan:id,title', // ✅ 'name' → 'title' because Plan uses 'title'
                'clazz:id,name,board_id',
                'clazz.board:id,name',
                'subject:id,name',
                'teacher.user:id,name', // ✅ to fetch teacher's display name
            ])
            ->withCount([
                'students as current_students_count' => function ($q) {
                    $q->where('batch_students.status', 'active')
                        ->where(function ($pivotQuery) {
                            $pivotQuery->whereNull('batch_students.ended_at')
                                ->orWhere('batch_students.ended_at', '>', now());
                        });
                },
            ])
            ->when($request->strength === 'lt10', fn($q) => $q->having('current_students_count', '<', 10))
            ->when($request->strength === '10_15', fn($q) => $q->havingBetween('current_students_count', [10, 15]))
            ->when($request->strength === '15_20', fn($q) => $q->havingBetween('current_students_count', [15, 20]))
            ->when($request->strength === 'gt20', fn($q) => $q->having('current_students_count', '>', 20))
            ->orderByDesc('id')
            ->paginate(config('app.paginate'))
            ->withQueryString();

        // Dropdown filters
        $classes = Clazz::select('id', 'name')->get();
        $subjects = Subject::select('id', 'name')->get();
        $teachers = Teacher::with('user:id,name')->get(['id', 'user_id']);
        $plans = Plan::select('id', 'title')->get();
        $boards = Board::select('id', 'name')->get();

        return Inertia::render('Admin/Batches/index', [
            'batches' => $batches,
            'classes' => $classes,
            'subjects' => $subjects,
            'teachers' => $teachers,
            'plans' => $plans,
            'boards' => $boards,
            'filters' => $request->only('status', 'class', 'subject', 'teacher', 'plan', 'board', 'time_slot', 'strength', 'search'),
        ]);
    }

    /**
     * Show the form for creating a new batch.
     */
    public function create()
    {
        // $classes = Clazz::select('id', 'name')->get();
        // $subjects = Subject::select('id', 'name')->get();
        // $teachers = Teacher::select('id', 'name')->get();
        // $plans = Plan::select('id', 'name')->get();

        // return Inertia::render('Admin/Batches/Create', [
        //     'classes' => $classes,
        //     'subjects' => $subjects,
        //     'teachers' => $teachers,
        //     'plans' => $plans,
        // ]);

        return Inertia::render('Admin/Batches/create', [
            'plans' => Plan::query()
                ->with(['board:id,name', 'clazz:id,name', 'subjects:id,name'])
                ->get()
                ->map(fn($plan) => [
                    'id' => $plan->id,
                    'title' => $plan->title,
                    'class_id' => $plan->class_id,
                    'type' => $plan->type instanceof \BackedEnum ? $plan->type->value : (string) $plan->type,
                    'duration_days' => $plan->duration_days,
                    'price' => (float) $plan->price,
                    'status' => $plan->status instanceof \BackedEnum ? $plan->status->value : (string) $plan->status,
                    'description' => $plan->description,
                    'board_name' => $plan->board?->name,
                    'class_name' => $plan->clazz?->name,
                    'subjects' => $plan->subjects->map(fn($subject) => [
                        'id' => $subject->id,
                        'name' => $subject->name,
                    ])->values(),
                ]),
            'teachers' => Teacher::with('user:id,name')->get()->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->user->name
            ]),
        ]);
    }

    /**
     * Store a newly created batch.
     */
    public function store(Request $request)
    {
        // $validated = $request->validate([
        //     'batch_code' => 'required|string|max:50|unique:batches,batch_code',
        //     'plan_id' => 'required|exists:plans,id',
        //     'class_id' => 'required|exists:clazzes,id',
        //     'subject_id' => 'required|exists:subjects,id',
        //     'teacher_id' => 'required|exists:teachers,id',
        //     'students_limit' => 'required|integer|min:1',
        //     'status' => 'required|in:active,inactive,completed',
        // ]);
        $validated = $request->validate([
            'batch_code' => 'required|string|max:50|unique:batches,batch_code',
            'plan_id' => 'required|exists:plans,id',
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'time_slot' => 'required|string|max:30',
            'students_limit' => 'required|integer|min:1',
            'status' => 'required|in:upcoming,active,inactive,completed',
        ]);
        $normalizedTimeSlot = $this->normalizeTimeSlot($validated['time_slot']);
        if (!$normalizedTimeSlot) {
            return back()
                ->withErrors(['time_slot' => 'Please select valid start and end time.'])
                ->withInput();
        }
        $validated['time_slot'] = $normalizedTimeSlot;

        if (!$this->isTeacherAvailableForSlot((int) $validated['teacher_id'], $validated['time_slot'])) {
            return back()
                ->withErrors(['teacher_id' => 'Teacher is not available for the selected time slot.'])
                ->withInput();
        }

        $plan = Plan::query()->with('subjects:id')->findOrFail($validated['plan_id']);
        $planSubjectIds = $plan->subjects->pluck('id')->all();
        if ((int) $validated['class_id'] !== (int) $plan->class_id || !in_array((int) $validated['subject_id'], $planSubjectIds, true)) {
            return back()
                ->withErrors([
                    'class_id' => 'Selected class does not match the selected plan.',
                    'subject_id' => 'Selected subject is not part of the selected plan.',
                ])
                ->withInput();
        }

        $batch = Batch::create($validated);

        $teacherUser = Teacher::query()->with('user:id,name,email')->find($validated['teacher_id'])?->user;
        if ($teacherUser) {
            app(NotificationService::class)->send(
                $teacherUser,
                title: 'New Batch Assigned',
                message: "You have been assigned to batch '{$batch->batch_code}'.",
                type: NotificationType::clazz,
                sendEmail: false,
                payload: [
                    'batch_name' => $batch->batch_code,
                    'action_text' => 'Open Batches',
                    'action_url' => '/teacher/allotted-batches',
                    'priority' => 'high',
                ],
                modelType: Batch::class,
                modelId: $batch->id
            );
        }

        return redirect()->route('admin.batches.index')->with('success', 'Batch created successfully');
    }
    /**
     * Dynamic Subjects by Class
     */
    public function subjectsByClass($classId)
    {
        return Subject::where('class_id', $classId)
            ->select('id', 'name')
            ->get();
    }

    /**
     * Dynamic Classes by Plan
     */
    public function classesByPlan($planId)
    {
        $plan = Plan::findOrFail($planId);

        return Clazz::where('id', $plan->class_id)
            ->select('id', 'name')
            ->get();
    }
    public function teachersBySubject($subjectId)
    {
        return Teacher::whereHas(
            'subjects',
            fn($q) =>
            $q->where('subjects.id', $subjectId)
        )
            ->with('user:id,name')
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->user->name
            ]);
    }

    public function eligibleTeachers(Request $request)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'time_slot' => 'required|string|max:30',
            'class_id' => 'nullable|exists:classes,id',
            'batch_id' => 'nullable|exists:batches,id',
        ]);
        $normalizedTimeSlot = $this->normalizeTimeSlot($validated['time_slot']);
        if (!$normalizedTimeSlot) {
            return response()->json([], 422);
        }

        $candidateBatches = Batch::query()
            ->whereIn('status', ['upcoming', 'active'])
            ->when(
                !empty($validated['batch_id']),
                fn($query) => $query->where('id', '!=', $validated['batch_id'])
            )
            ->whereNotNull('teacher_id')
            ->get(['teacher_id', 'time_slot']);

        $occupiedTeacherIds = $candidateBatches
            ->filter(fn($batch) => $this->timeSlotsOverlap($normalizedTimeSlot, (string) $batch->time_slot))
            ->pluck('teacher_id')
            ->unique()
            ->values();

        $occupiedBySessions = ClassSession::query()
            ->whereIn('status', ['scheduled', 'rescheduled'])
            ->whereNotNull('class_date')
            ->get(['teacher_id', 'class_date'])
            ->filter(function ($session) use ($normalizedTimeSlot) {
                $date = Carbon::parse($session->class_date);
                $minutes = ($date->hour * 60) + $date->minute;
                return $this->isMinutesWithinSlot($minutes, $normalizedTimeSlot);
            })
            ->pluck('teacher_id')
            ->unique()
            ->values();

        $occupiedTeacherIds = $occupiedTeacherIds->merge($occupiedBySessions)->unique()->values();

        return Teacher::query()
            ->whereHas('teachingExperiences', function ($query) use ($validated) {
                $query->where('subject_id', $validated['subject_id'])
                    ->when(
                        !empty($validated['class_id']),
                        fn($q) => $q->where('class_id', $validated['class_id'])
                    );
            })
            ->whereNotIn('id', $occupiedTeacherIds)
            ->with('user:id,name')
            ->orderBy('id')
            ->get()
            ->map(fn($teacher) => [
                'id' => $teacher->id,
                'name' => $teacher->user?->name,
            ])
            ->values();
    }
    /**
     * Show the form for editing the specified batch.
     */
    public function edit(Batch $batch)
    {
        $batch->load(['plan', 'clazz', 'subject', 'teacher.user']);

        return Inertia::render('Admin/Batches/edit', [
            'batch' => [
                'id' => $batch->id,
                'batch_code' => $batch->batch_code,
                'plan_id' => $batch->plan_id,
                'class_id' => $batch->class_id,
                'subject_id' => $batch->subject_id,
                'teacher_id' => $batch->teacher_id,
                'time_slot' => $batch->time_slot,
                'students_limit' => $batch->students_limit,
                'status' => $batch->status,
            ],

            // Dropdowns
            'plans' => Plan::query()
                ->with(['board:id,name', 'clazz:id,name', 'subjects:id,name'])
                ->get()
                ->map(fn($plan) => [
                    'id' => $plan->id,
                    'title' => $plan->title,
                    'class_id' => $plan->class_id,
                    'type' => $plan->type instanceof \BackedEnum ? $plan->type->value : (string) $plan->type,
                    'duration_days' => $plan->duration_days,
                    'price' => (float) $plan->price,
                    'status' => $plan->status instanceof \BackedEnum ? $plan->status->value : (string) $plan->status,
                    'description' => $plan->description,
                    'board_name' => $plan->board?->name,
                    'class_name' => $plan->clazz?->name,
                    'subjects' => $plan->subjects->map(fn($subject) => [
                        'id' => $subject->id,
                        'name' => $subject->name,
                    ])->values(),
                ]),

            'teachers' => Teacher::with('user:id,name')->get()->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->user->name
            ]),

            // Preload dependent values
            'classes' => Clazz::select('id', 'name')->get(),
            'subjects' => Subject::select('id', 'name')->get(),
        ]);
    }


    /**
     * Update the specified batch.
     */
    public function update(Request $request, Batch $batch)
    {
        $validated = $request->validate([
            'batch_code' => "required|string|max:50|unique:batches,batch_code,{$batch->id}",
            'plan_id' => 'required|exists:plans,id',
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'time_slot' => 'required|string|max:30',
            'students_limit' => 'required|integer|min:1',
            'status' => 'required|in:upcoming,active,inactive,completed',
        ]);
        $normalizedTimeSlot = $this->normalizeTimeSlot($validated['time_slot']);
        if (!$normalizedTimeSlot) {
            return back()
                ->withErrors(['time_slot' => 'Please select valid start and end time.'])
                ->withInput();
        }
        $validated['time_slot'] = $normalizedTimeSlot;

        if (!$this->isTeacherAvailableForSlot((int) $validated['teacher_id'], $validated['time_slot'], (int) $batch->id)) {
            return back()
                ->withErrors(['teacher_id' => 'Teacher is not available for the selected time slot.'])
                ->withInput();
        }

        $plan = Plan::query()->with('subjects:id')->findOrFail($validated['plan_id']);
        $planSubjectIds = $plan->subjects->pluck('id')->all();
        if ((int) $validated['class_id'] !== (int) $plan->class_id || !in_array((int) $validated['subject_id'], $planSubjectIds, true)) {
            return back()
                ->withErrors([
                    'class_id' => 'Selected class does not match the selected plan.',
                    'subject_id' => 'Selected subject is not part of the selected plan.',
                ])
                ->withInput();
        }

         $oldTeacherId = $batch->teacher_id;
         
        $batch->update($validated);

        // =====================================================
    // 🔔 If Teacher Changed → Notify Students
    // =====================================================
         if ($oldTeacherId != $validated['teacher_id']) {

        $oldTeacher = Teacher::find($oldTeacherId);
        $newTeacher = Teacher::find($validated['teacher_id']);

        // Get all ACTIVE students in this batch
        $students = $batch->students()
            ->wherePivot('status', 'active')
            ->with('user')
            ->get();

        foreach ($students as $student) {

            $user = $student->user;

            if (!$user) continue;

            app(NotificationService::class)->send(
                $user,
                title: "Teacher Updated",
                message: "Your teacher for batch '{$batch->batch_code}' has been changed.",
                type: NotificationType::clazz,
                emailSubject: "Teacher Updated - TutStar",
                emailMessage: "Your teacher for '{$batch->batch_code}' has been changed from '{$oldTeacher?->user?->name}' to '{$newTeacher?->user?->name}'.",
                sendEmail: false, // Disable email for this notification
                payload: [
                    'batch_name'   => $batch->batch_code,
                    'old_teacher'  => $oldTeacher?->user?->name,
                    'new_teacher'  => $newTeacher?->user?->name,
                    'action_text'  => 'View Batch',
                    'action_url'   => '/student/batches',
                    'priority'     => 'medium',
                    'icon'         => 'user-check',
                    'popup'        => true
                ]
            );
        }

        if ($newTeacher?->user) {
            app(NotificationService::class)->send(
                $newTeacher->user,
                title: 'Batch Assignment Updated',
                message: "You are now assigned to batch '{$batch->batch_code}'.",
                type: NotificationType::clazz,
                sendEmail: false,
                payload: [
                    'batch_name' => $batch->batch_code,
                    'action_text' => 'Open Batches',
                    'action_url' => '/teacher/allotted-batches',
                    'priority' => 'high',
                ],
                modelType: Batch::class,
                modelId: $batch->id
            );
        }
    }
        return redirect()->route('admin.batches.index')->with('success', 'Batch updated successfully');
    }

    /**
     * Remove the specified batch from storage.
     */
    public function destroy(Batch $batch)
    {
        $batch->delete();
        return back()->with('success', 'Batch deleted successfully');
    }

    private function normalizeTimeSlot(string $value): ?string
    {
        $value = trim($value);
        $mapped = self::LEGACY_SLOT_MAP[$value] ?? $value;

        if (!preg_match('/^\d{2}:\d{2}-\d{2}:\d{2}$/', $mapped)) {
            return null;
        }

        [$from, $to] = explode('-', $mapped, 2);
        if (!$this->isValidTimeString($from) || !$this->isValidTimeString($to)) {
            return null;
        }

        if ($from === $to) {
            return null;
        }

        return $mapped;
    }

    private function isValidTimeString(string $time): bool
    {
        if (!preg_match('/^\d{2}:\d{2}$/', $time)) {
            return false;
        }

        [$hour, $minute] = array_map('intval', explode(':', $time, 2));
        return $hour >= 0 && $hour <= 23 && $minute >= 0 && $minute <= 59;
    }

    private function parseTimeSlotToSegments(string $slot): array
    {
        $normalized = $this->normalizeTimeSlot($slot);
        if (!$normalized) {
            return [];
        }

        [$from, $to] = explode('-', $normalized, 2);
        $start = $this->toMinutes($from);
        $end = $this->toMinutes($to);

        if ($end > $start) {
            return [[$start, $end]];
        }

        return [[$start, 1440], [0, $end]];
    }

    private function toMinutes(string $time): int
    {
        [$hour, $minute] = array_map('intval', explode(':', $time, 2));
        return ($hour * 60) + $minute;
    }

    private function timeSlotsOverlap(string $a, string $b): bool
    {
        $aSegments = $this->parseTimeSlotToSegments($a);
        $bSegments = $this->parseTimeSlotToSegments($b);

        foreach ($aSegments as [$aStart, $aEnd]) {
            foreach ($bSegments as [$bStart, $bEnd]) {
                if (max($aStart, $bStart) < min($aEnd, $bEnd)) {
                    return true;
                }
            }
        }

        return false;
    }

    private function isMinutesWithinSlot(int $minutes, string $slot): bool
    {
        $segments = $this->parseTimeSlotToSegments($slot);
        foreach ($segments as [$start, $end]) {
            if ($minutes >= $start && $minutes < $end) {
                return true;
            }
        }
        return false;
    }

    private function isTeacherAvailableForSlot(int $teacherId, string $timeSlot, ?int $ignoreBatchId = null): bool
    {
        $normalizedTimeSlot = $this->normalizeTimeSlot($timeSlot);
        if (!$normalizedTimeSlot) {
            return false;
        }

        $batchConflict = Batch::query()
            ->whereIn('status', ['upcoming', 'active'])
            ->where('teacher_id', $teacherId)
            ->when($ignoreBatchId, fn($q) => $q->where('id', '!=', $ignoreBatchId))
            ->get(['time_slot'])
            ->contains(fn($batch) => $this->timeSlotsOverlap($normalizedTimeSlot, (string) $batch->time_slot));

        if ($batchConflict) {
            return false;
        }

        $sessionConflict = ClassSession::query()
            ->where('teacher_id', $teacherId)
            ->whereIn('status', ['scheduled', 'rescheduled'])
            ->whereNotNull('class_date')
            ->get(['class_date'])
            ->contains(function ($session) use ($normalizedTimeSlot) {
                $date = Carbon::parse($session->class_date);
                $minutes = ($date->hour * 60) + $date->minute;
                return $this->isMinutesWithinSlot($minutes, $normalizedTimeSlot);
            });

        return !$sessionConflict;
    }
}

