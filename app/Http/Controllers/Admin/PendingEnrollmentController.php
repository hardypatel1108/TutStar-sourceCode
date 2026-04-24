<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Batch;
use App\Models\BatchStudent;
use App\Models\PendingEnrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use App\Services\NotificationService;
use App\Enums\NotificationType;

class PendingEnrollmentController extends Controller
{
    /**
     * Show all pending enrollments (students who paid but not assigned to batch).
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $pending = PendingEnrollment::query()
            ->with([
                // Student details
                'student:id,user_id,class_id',
                'student.user:id,name,email',
                'student.clazz:id,name',

                // Plan details
                'plan:id,title,duration_days',

                // Plan → related batches with full metadata
                'plan.batches' => fn($q) => $q
                    ->select('id', 'plan_id', 'batch_code', 'class_id', 'subject_id', 'teacher_id', 'time_slot', 'students_limit', 'status', 'created_at')
                    ->withCount([
                        'students as current_students_count' => function ($studentsQuery) {
                            $studentsQuery
                                ->where('batch_students.status', 'active')
                                ->where(function ($pivotQuery) {
                                    $pivotQuery->whereNull('batch_students.ended_at')
                                        ->orWhere('batch_students.ended_at', '>', now());
                                });
                        },
                    ])
                    ->orderBy('created_at', 'desc'),
                // Batch relations
                'plan.batches.clazz:id,name',
                'plan.batches.subject:id,name',
                'plan.batches.teacher:id,user_id',
                'plan.batches.teacher.user:id,name,email',

                // CheckoutPlan details
                'checkoutPlan:id,title,months',

                // Payment details
                'payment:id,amount,status,created_at',
            ])
            ->where('resolved', false)
            ->when($search, function ($query, $search) {
                $query->whereHas('student.user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(config('app.paginate'))
            ->through(function ($pendingItem) {
                $studentId = (int) ($pendingItem->student?->id ?? 0);
                if ($studentId <= 0) {
                    return $pendingItem;
                }

                $activeBatchAllocations = BatchStudent::query()
                    ->with([
                        'batch:id,batch_code,time_slot,subject_id,teacher_id',
                        'batch.subject:id,name',
                        'batch.teacher:id,user_id',
                        'batch.teacher.user:id,name',
                    ])
                    ->where('student_id', $studentId)
                    ->where('status', 'active')
                    ->where(function ($query) {
                        $query->whereNull('ended_at')
                            ->orWhere('ended_at', '>', now());
                    })
                    ->get();

                $activeBatches = $activeBatchAllocations
                    ->pluck('batch')
                    ->filter()
                    ->values();

                $activeBatchIds = $activeBatches->pluck('id')->map(fn($id) => (int) $id)->all();
                $activeTimeSlots = $activeBatches->pluck('time_slot')->filter()->values()->all();

                $allEnrolledBatchIds = BatchStudent::query()
                    ->where('student_id', $studentId)
                    ->pluck('batch_id')
                    ->map(fn($id) => (int) $id)
                    ->unique()
                    ->values()
                    ->all();

                if ($pendingItem->relationLoaded('plan') && $pendingItem->plan?->relationLoaded('batches')) {
                    $pendingItem->plan->batches = $pendingItem->plan->batches->map(function ($batch) use ($allEnrolledBatchIds, $activeBatchIds, $activeTimeSlots, $activeBatches) {
                        $batchId = (int) $batch->id;
                        $isAlreadyEnrolled = in_array($batchId, $allEnrolledBatchIds, true);
                        $isCurrentlyActive = in_array($batchId, $activeBatchIds, true);
                        $hasTimeConflict = !empty($batch->time_slot)
                            && in_array($batch->time_slot, $activeTimeSlots, true)
                            && !$isCurrentlyActive;

                        $conflictingBatches = $activeBatches
                            ->filter(fn($activeBatch) => $activeBatch->time_slot === $batch->time_slot && (int) $activeBatch->id !== $batchId)
                            ->map(fn($activeBatch) => [
                                'id' => $activeBatch->id,
                                'batch_code' => $activeBatch->batch_code,
                                'time_slot' => $activeBatch->time_slot,
                            ])
                            ->values();

                        $batch->is_already_enrolled = $isAlreadyEnrolled;
                        $batch->is_currently_active = $isCurrentlyActive;
                        $batch->has_time_conflict = $hasTimeConflict;
                        $batch->conflicting_batches = $conflictingBatches;
                        $batch->teacher_name = $batch->teacher?->user?->name;
                        $batch->teacher_email = $batch->teacher?->user?->email;
                        $batch->current_strength = (int) ($batch->current_students_count ?? 0);

                        return $batch;
                    })->values();
                }

                $pendingItem->student_active_batches = $activeBatches->map(function ($batch) {
                    return [
                        'id' => $batch->id,
                        'batch_code' => $batch->batch_code,
                        'time_slot' => $batch->time_slot,
                        'subject_name' => $batch->subject?->name,
                        'teacher_name' => $batch->teacher?->user?->name,
                    ];
                })->values();

                return $pendingItem;
            })
            ->withQueryString();
        return Inertia::render('Admin/PendingEnrollments/index', [
            'pending' => $pending,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function resolve(PendingEnrollment $pending): RedirectResponse
    {
        // Already resolved → Do nothing
        if ($pending->resolved) {
            return back()->with('success', 'Already resolved.');
        }

        $pending->update([
            'resolved' => true,
            'resolved_at' => Carbon::now(),
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'pending_enrollment_resolved',
            'model_type' => PendingEnrollment::class,
            'model_id' => $pending->id,
            'changes' => [
                'resolved' => true,
                'resolved_at' => now()->toDateTimeString(),
            ],
        ]);

        return back()->with('success', 'Enrollment marked as resolved.');
    }

    public function assign(Request $request, PendingEnrollment $pending)
    {
        $request->validate([
            'batch_id' => 'nullable|exists:batches,id',
            'auto' => 'nullable|boolean'
        ]);

        $student = $pending->student;
        $plan = $pending->plan;
        $checkoutPlan = $pending->checkoutPlan;
        /** AUTO ASSIGN */
        if ($request->boolean('auto')) {
            $batch = $plan->batches()
                ->where('status', 'active')
                ->get()
                ->filter(fn($item) => $this->batchHasCapacity($item))
                ->sortBy(fn($item) => $this->currentActiveStudentsCount($item->id))
                ->first();

            if (! $batch) {
                return back()->with('error', 'No available batch found for auto assignment.');
            }
        }
        /** MANUAL ASSIGN */
        else {
            $batchId = $request->batch_id;
            if (! $batchId) {
                return back()->with('error', 'Please select a batch.');
            }
            $batch = $plan->batches()->findOrFail($batchId);
        }

        if (! $this->batchHasCapacity($batch)) {
            return back()->with('error', 'Selected batch is full. Please choose another batch.');
        }

        $activeBatches = $this->studentActiveBatches((int) $student->id);
        $hasConflict = $activeBatches->contains(function (Batch $activeBatch) use ($batch) {
            return (int) $activeBatch->id !== (int) $batch->id
                && !empty($activeBatch->time_slot)
                && !empty($batch->time_slot)
                && $activeBatch->time_slot === $batch->time_slot;
        });

        if ($hasConflict) {
            $conflictingBatchCodes = $activeBatches
                ->filter(function (Batch $activeBatch) use ($batch) {
                    return (int) $activeBatch->id !== (int) $batch->id
                        && !empty($activeBatch->time_slot)
                        && !empty($batch->time_slot)
                        && $activeBatch->time_slot === $batch->time_slot;
                })
                ->pluck('batch_code')
                ->filter()
                ->implode(', ');

            return back()->with(
                'error',
                'Batch timing conflict: student is already active in batch(es) '
                . ($conflictingBatchCodes ?: 'with the same time slot')
                . '.'
            );
        }

        $activeAllocation = BatchStudent::query()
            ->where('student_id', $student->id)
            ->where('batch_id', $batch->id)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('ended_at')
                    ->orWhere('ended_at', '>', now());
            })
            ->latest('id')
            ->first();

        if ($activeAllocation) {
            $previousEndedAt = $activeAllocation->ended_at ? $activeAllocation->ended_at->copy() : null;
            $baseDate = $activeAllocation->ended_at && $activeAllocation->ended_at->isFuture()
                ? $activeAllocation->ended_at
                : now();
            $extendedEndedAt = $baseDate->copy()->addMonths($checkoutPlan->months);

            $activeAllocation->update([
                'ended_at' => $extendedEndedAt,
            ]);

            $pending->update([
                'resolved' => true,
                'resolved_at' => Carbon::now(),
            ]);

            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'pending_enrollment_extended',
                'model_type' => PendingEnrollment::class,
                'model_id' => $pending->id,
                'changes' => [
                    'batch_id' => $batch->id,
                    'student_id' => $student->id,
                    'plan_id' => $plan->id,
                    'checkout_plan_id' => $checkoutPlan->id,
                    'previous_ended_at' => $previousEndedAt?->toDateTimeString(),
                    'ended_at' => $extendedEndedAt->toDateTimeString(),
                ],
            ]);

            $user = $student->user;
            if ($user) {
                $batchLabel = $batch->batch_code ?: "Batch #{$batch->id}";
                app(NotificationService::class)->send(
                    $user,
                    title: "Batch Access Extended",
                    message: "Your access for batch '{$batchLabel}' has been extended.",
                    type: NotificationType::clazz,
                    emailSubject: "Batch Access Extended - TutStar",
                    emailMessage: "Your access for batch '{$batchLabel}' has been extended till {$extendedEndedAt->format('d M Y')}.",
                    sendEmail: true,
                    payload: [
                        'batch_name'   => $batchLabel,
                        'plan_name'    => $plan->title ?? null,
                        'joined_at'    => $activeAllocation->joined_at?->format('d M Y'),
                        'ended_at'     => $extendedEndedAt->format('d M Y'),
                        'action_text'  => 'View Batch',
                        'action_url'   => '/student/batches',
                        'priority'     => 'medium',
                        'icon'         => 'calendar',
                        'popup'        => true
                    ]
                );
            }

            return back()->with('success', "Existing batch access extended till {$extendedEndedAt->format('d M Y')}.");
        }

        // prevent duplication
        if ($student->batches()->where('batch_id', $batch->id)->exists()) {
            return back()->with('info', 'Student already allocated to this batch.');
        }

        $joinedAt = now();
        $endedAt  = now()->addMonths($checkoutPlan->months);
        // add allocation
        BatchStudent::create([
            'batch_id' => $batch->id,
            'student_id' => $student->id,
            'status' => 'active',
            'allocated_by' => auth()->id(),
            'allocated_at' => Carbon::now(),
            'joined_at'    => $joinedAt,
            'ended_at'     => $endedAt,
        ]);

        // resolve pending enrolment
        $pending->update([
            'resolved' => true,
            'resolved_at' => Carbon::now(),
        ]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'pending_enrollment_assigned',
            'model_type' => PendingEnrollment::class,
            'model_id' => $pending->id,
            'changes' => [
                'batch_id' => $batch->id,
                'student_id' => $student->id,
                'plan_id' => $plan->id,
                'checkout_plan_id' => $checkoutPlan->id,
                'joined_at' => $joinedAt->toDateTimeString(),
                'ended_at' => $endedAt->toDateTimeString(),
            ],
        ]);

        $user = $student->user;

        if ($user) {
            $batchLabel = $batch->batch_code ?: "Batch #{$batch->id}";
            app(NotificationService::class)->send(
                $user,
                title: "Batch Assigned Successfully",
                message: "You have been assigned to batch '{$batchLabel}'.",
                type: NotificationType::clazz,
                emailSubject: "Batch Assigned - TutStar",
                emailMessage: "You have been successfully assigned to batch '{$batchLabel}'. Your access is valid till {$endedAt->format('d M Y')}.",
                sendEmail: true,
                payload: [
                    'batch_name'   => $batchLabel,
                    'plan_name'    => $plan->title ?? null,
                    'joined_at'    => $joinedAt->format('d M Y'),
                    'ended_at'     => $endedAt->format('d M Y'),
                    'action_text'  => 'View Batch',
                    'action_url'   => '/student/batches',
                    'priority'     => 'medium',
                    'icon'         => 'book-open',
                    'popup'        => true
                ]
            );
        }

        return back()->with('success', "Student assigned for {$checkoutPlan->months} month(s). Access valid till {$endedAt->format('d M Y')}.");
    }

    private function currentActiveStudentsCount(int $batchId): int
    {
        return BatchStudent::query()
            ->where('batch_id', $batchId)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('ended_at')
                    ->orWhere('ended_at', '>', now());
            })
            ->count();
    }

    private function batchHasCapacity($batch): bool
    {
        $limit = (int) ($batch->students_limit ?? 0);

        if ($limit <= 0) {
            return true;
        }

        return $this->currentActiveStudentsCount((int) $batch->id) < $limit;
    }

    private function studentActiveBatches(int $studentId)
    {
        $batchIds = BatchStudent::query()
            ->where('student_id', $studentId)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('ended_at')
                    ->orWhere('ended_at', '>', now());
            })
            ->pluck('batch_id')
            ->unique()
            ->values();

        return Batch::query()
            ->whereIn('id', $batchIds)
            ->get(['id', 'batch_code', 'time_slot']);
    }
}
