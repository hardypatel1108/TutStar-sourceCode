<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BatchStudent;
use App\Models\Batch;
use App\Models\Student;
use App\Models\Clazz;
use App\Models\Subject;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Services\NotificationService;
use App\Enums\NotificationType;
use Illuminate\Validation\Rule;

class BatchStudentController extends Controller
{
    /**
     * Display a listing of batch-student allocations.
     */
    public function index(Request $request)
    {
        $now = now();
        $expiringInDays = is_numeric($request->expiring_in_days) ? (int) $request->expiring_in_days : null;

        $batchStudents = BatchStudent::query()
            ->with([
                'batch:id,batch_code,class_id,subject_id,plan_id,teacher_id',
                'batch.clazz:id,name',
                'batch.subject:id,name',
                'batch.plan:id,title',
                'batch.teacher:id,user_id',
                'batch.teacher.user:id,name',
                'student:id,student_uid,user_id,class_id',
                'student.user:id,name,email',
                'student.subscriptions:id,student_id,plan_id,status,end_at',
                'student.subscriptions.plan:id,title',
                'student.subscriptions.plan.subjects:id,name',
                'student.batches:id,subject_id,plan_id',
                'student.batches.subject:id,name',
                'student.batches.plan:id,title',
                'allocator:id,name,role',
            ])
            ->whereHas('allocator', fn($q) => $q->where('role', 'admin'))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->batch, fn($q) => $q->where('batch_id', $request->batch))
            ->when($request->class_id, fn($q) => $q->whereHas('batch', fn($b) => $b->where('class_id', $request->class_id)))
            ->when($request->subject_id, fn($q) => $q->whereHas('batch', fn($b) => $b->where('subject_id', $request->subject_id)))
            ->when($request->plan_id, fn($q) => $q->whereHas('batch', fn($b) => $b->where('plan_id', $request->plan_id)))
            ->when($expiringInDays !== null, function ($q) use ($now, $expiringInDays) {
                if ($expiringInDays === 0) {
                    $q->whereDate('ended_at', $now->toDateString());
                    return;
                }
                $q->whereBetween('ended_at', [$now, $now->copy()->addDays($expiringInDays)]);
            })
            ->when(
                $request->search,
                function ($q) use ($request) {
                    $term = $request->search;
                    $q->where(function ($inner) use ($term) {
                        $inner->whereHas('student.user', fn($s) => $s->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%"))
                            ->orWhereHas('student', fn($s) => $s->where('student_uid', 'like', "%{$term}%"))
                            ->orWhereHas('batch', fn($b) => $b->where('batch_code', 'like', "%{$term}%")->orWhere('batches.id', $term));
                    });
                }
            )
            ->orderByDesc('id')
            ->paginate(config('app.paginate'))
            ->through(function ($item) use ($now) {
                $subjects = collect()
                    ->merge($item->student?->batches?->pluck('subject.name') ?? collect())
                    ->merge(
                        ($item->student?->subscriptions ?? collect())
                            ->flatMap(fn($sub) => $sub->plan?->subjects?->pluck('name') ?? collect())
                    )
                    ->filter()
                    ->unique()
                    ->values();

                $plans = collect()
                    ->merge($item->student?->batches?->pluck('plan.title') ?? collect())
                    ->merge($item->student?->subscriptions?->pluck('plan.title') ?? collect())
                    ->filter()
                    ->unique()
                    ->values();

                $expiresInDays = $item->ended_at ? $now->diffInDays($item->ended_at, false) : null;
                $expiryTag = null;
                if ($expiresInDays !== null) {
                    if ($expiresInDays < 0) {
                        $expiryTag = 'expired';
                    } elseif ($expiresInDays === 0) {
                        $expiryTag = 'today';
                    } elseif ($expiresInDays <= 1) {
                        $expiryTag = 'in_1_day';
                    } elseif ($expiresInDays <= 2) {
                        $expiryTag = 'in_2_days';
                    } elseif ($expiresInDays <= 5) {
                        $expiryTag = 'in_5_days';
                    } else {
                        $expiryTag = 'later';
                    }
                }

                $item->student_uid = $item->student?->student_uid;
                $item->class_name = $item->batch?->clazz?->name;
                $item->teacher_name = $item->batch?->teacher?->user?->name;
                $item->subjects_enrolled_csv = $subjects->isNotEmpty() ? $subjects->implode(', ') : null;
                $item->plans_csv = $plans->isNotEmpty() ? $plans->implode(', ') : null;
                $item->expiry_date_formatted = $item->ended_at ? $item->ended_at->format('d M Y') : null;
                $item->expires_in_days = $expiresInDays;
                $item->expiry_tag = $expiryTag;

                return $item;
            })
            ->withQueryString();

        $batches = Batch::select('id', 'batch_code')->get();
        $classes = Clazz::select('id', 'name')->orderBy('ordinal')->orderBy('name')->get();
        $subjects = Subject::select('id', 'name')->orderBy('name')->get();
        $plans = Plan::select('id', 'title')->orderBy('title')->get();

        return Inertia::render('Admin/BatchStudents/index', [
            'batchStudents' => $batchStudents,
            'batches' => $batches,
            'classes' => $classes,
            'subjects' => $subjects,
            'plans' => $plans,
            'filters' => $request->only('status', 'batch', 'class_id', 'subject_id', 'plan_id', 'expiring_in_days', 'search'),
        ]);
    }

    /**
     * Show the form for creating a new allocation.
     */
    public function create()
    {
        $batches = $this->buildBatchOptions();
        $students = $this->buildStudentOptions();

        return inertia('Admin/BatchStudents/create', [
            'batches'  => $batches,
            'students' => $students,
            'defaults' => [
                'status' => 'active',
                'joined_at' => now()->format('Y-m-d\TH:i'),
            ],
            'statusOptions' => [
                ['id' => 'active',  'name' => 'Active'],
                ['id' => 'left',    'name' => 'Left'],
                ['id' => 'expired', 'name' => 'Expired'],
            ]
        ]);
    }

    /**
     * Store a new batch-student allocation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'batch_id'   => 'required|exists:batches,id',
            'student_id' => 'required|exists:students,id',
            'status'     => 'required|in:active,left,expired',
            'joined_at'  => 'required|date',
            'ended_at'   => [
                'nullable',
                'date',
                'after_or_equal:joined_at',
                Rule::requiredIf(fn() => in_array($request->status, ['left', 'expired'], true)),
            ],
        ]);

        $student  = Student::findOrFail($validated['student_id']);
        $newBatch = Batch::with(['clazz', 'subject'])
            ->findOrFail($validated['batch_id']);

        $user = $student->user;

        // 🔍 Get existing active batch
        $existingBatch = $student->batches()
            ->wherePivot('status', 'left') // Only consider active allocations
            ->with(['clazz', 'subject'])
            ->first();

        // Prevent duplicate same batch
        if ($existingBatch && $existingBatch->id == $newBatch->id) {
            return back()->with('info', 'Student already allocated to this batch.');
        }

        if ($validated['status'] === 'active' && empty($validated['ended_at'])) {
            $validated['ended_at'] = null;
        }

        $validated['allocated_by'] = auth()->id();
        $validated['allocated_at'] = now();

        BatchStudent::create($validated);

        if (!$user) {
            return back()->with('success', 'Student allocated successfully.');
        }

        // =====================================================
        // 🔄 CASE 1: SHUFFLE (Same Class + Same Subject)
        // =====================================================
        if (
            $existingBatch &&
            $existingBatch->class_id == $newBatch->class_id &&
            $existingBatch->subject_id == $newBatch->subject_id
        ) {

            app(NotificationService::class)->send(
                $user,
                title: "Batch Updated",
                message: "You have been moved from '{$existingBatch->name}' to '{$newBatch->name}'.",
                type: NotificationType::clazz,
                emailSubject: "Batch Updated - TutStar",
                emailMessage: "Your batch has been updated within the same class and subject. Please check your updated schedule.",
                sendEmail: true,
                payload: [
                    'old_batch'   => $existingBatch->name,
                    'new_batch'   => $newBatch->name,
                    'class'       => $newBatch->clazz?->name,
                    'subject'     => $newBatch->subject?->name,
                    'action_text' => 'View Batch',
                    'action_url'  => '/student/batches',
                    'priority'    => 'medium',
                    'icon'        => 'shuffle',
                    'popup'       => true
                ]
            );
        }

        // =====================================================
        // 🆕 CASE 2: DIFFERENT CLASS OR SUBJECT
        // =====================================================
        else {

            app(\App\Services\NotificationService::class)->send(
                $user,
                title: "New Batch Assigned",
                message: "You have been assigned to batch '{$newBatch->name}'.",
                type: \App\Enums\NotificationType::clazz,
                emailSubject: "New Batch Assigned - TutStar",
                emailMessage: "You have been successfully assigned to '{$newBatch->name}'.",
                sendEmail: true,
                payload: [
                    'batch_name'  => $newBatch->name,
                    'class'       => $newBatch->clazz?->name,
                    'subject'     => $newBatch->subject?->name,
                    'action_text' => 'View Batch',
                    'action_url'  => '/student/batches',
                    'priority'    => 'medium',
                    'icon'        => 'book-open',
                    'popup'       => true
                ]
            );
        }

        return redirect()->route('admin.batchStudents.index')->with('success', 'Student allocated to batch successfully');
    }

    /**
     * Show the form for editing an existing allocation.
     */
    public function edit(BatchStudent $batchStudent)
    {
        $batches = $this->buildBatchOptions();
        $students = $this->buildStudentOptions();

        return Inertia::render('Admin/BatchStudents/edit', [
            'batchStudent' => [
                'id' => $batchStudent->id,
                'batch_id' => $batchStudent->batch_id,
                'student_id' => $batchStudent->student_id,
                'status' => $batchStudent->status instanceof \BackedEnum ? $batchStudent->status->value : (string) $batchStudent->status,
                'joined_at' => optional($batchStudent->joined_at)->format('Y-m-d\TH:i'),
                'ended_at' => optional($batchStudent->ended_at)->format('Y-m-d\TH:i'),
                'allocated_at' => optional($batchStudent->allocated_at)->format('d M Y, h:i A'),
            ],
            'batches' => $batches,
            'students' => $students,
            'statusOptions' => [
                ['id' => 'active',  'name' => 'Active'],
                ['id' => 'left',    'name' => 'Left'],
                ['id' => 'expired', 'name' => 'Expired'],
            ]
        ]);
    }

    /**
     * Update batch allocation
     */
    public function update(Request $request, BatchStudent $batchStudent)
    {
        $validated = $request->validate([
            'batch_id'   => 'required|exists:batches,id',
            'student_id' => 'required|exists:students,id',
            'status'     => 'required|in:active,left,expired',
            'joined_at'  => 'required|date',
            'ended_at'   => [
                'nullable',
                'date',
                'after_or_equal:joined_at',
                Rule::requiredIf(fn() => in_array($request->status, ['left', 'expired'], true)),
            ],
        ]);

        $oldStatus = $batchStudent->status;
        if ($validated['status'] === 'active' && empty($validated['ended_at'])) {
            $validated['ended_at'] = null;
        }

        $batchStudent->update($validated);

        $student = $batchStudent->student;
        $batch   = $batchStudent->batch;
        $user    = $student?->user;

        if ($user && $oldStatus !== $validated['status']) {

            // =========================
            // 🚫 Student Removed
            // =========================
            if ($validated['status'] === 'left') {

                app(NotificationService::class)->send(
                    $user,
                    title: "Removed From Batch",
                    message: "You have been removed from batch '{$batch->name}'.",
                    type: NotificationType::clazz,
                    emailSubject: "Batch Access Removed",
                    emailMessage: "You have been removed from batch '{$batch->name}'. If this was unexpected, please contact support.",
                    sendEmail: true,
                    payload: [
                        'batch_name'  => $batch->name,
                        'action_text' => 'Contact Support',
                        'action_url'  => '/support',
                        'priority'    => 'high',
                        'icon'        => 'user-minus',
                        'popup'       => true
                    ]
                );
            }

            // =========================
            // ⏳ Batch Expired
            // =========================
            if ($validated['status'] === 'expired') {

                app(NotificationService::class)->send(
                    $user,
                    title: "Batch Access Expired",
                    message: "Your access to batch '{$batch->name}' has expired.",
                    type: NotificationType::clazz,
                    emailSubject: "Batch Access Expired",
                    emailMessage: "Your subscription period for '{$batch->name}' has expired. Please renew to continue access.",
                    sendEmail: true,
                    payload: [
                        'batch_name'  => $batch->name,
                        'action_text' => 'Renew Plan',
                        'action_url'  => '/student/checkout',
                        'priority'    => 'medium',
                        'icon'        => 'clock',
                        'popup'       => true
                    ]
                );
            }

            // =========================
            // ✅ Re-Activated (Optional)
            // =========================
            if ($validated['status'] === 'active' && $oldStatus !== 'active') {

                app(NotificationService::class)->send(
                    $user,
                    title: "Batch Access Activated",
                    message: "Your access to batch '{$batch->name}' is now active.",
                    type: NotificationType::clazz,
                    sendEmail: false,
                    payload: [
                        'batch_name'  => $batch->name,
                        'action_text' => 'View Batch',
                        'action_url'  => '/student/batches',
                        'priority'    => 'low',
                        'icon'        => 'check-circle',
                        'popup'       => true
                    ]
                );
            }
        }
        return redirect()->route('admin.batchStudents.index')
            ->with('success', 'Batch allocation updated successfully');
    }

    /**
     * Remove the specified allocation.
     */
    public function destroy(BatchStudent $batchStudent)
    {
        $batchStudent->delete();
        return back()->with('success', 'Batch allocation removed successfully');
    }

    private function buildBatchOptions()
    {
        $now = now();

        return Batch::query()
            ->select('id', 'batch_code', 'class_id', 'subject_id', 'plan_id', 'teacher_id', 'time_slot', 'students_limit', 'status')
            ->with([
                'clazz:id,name',
                'subject:id,name',
                'plan:id,title',
                'teacher:id,user_id',
                'teacher.user:id,name,email',
            ])
            ->withCount([
                'students as current_students_count' => function ($q) use ($now) {
                    $q->where('batch_students.status', 'active')
                        ->where(function ($inner) use ($now) {
                            $inner->whereNull('batch_students.ended_at')
                                ->orWhere('batch_students.ended_at', '>', $now);
                        });
                },
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($batch) => [
                'id' => $batch->id,
                'batch_code' => $batch->batch_code,
                'class_name' => $batch->clazz?->name,
                'subject_name' => $batch->subject?->name,
                'plan_title' => $batch->plan?->title,
                'teacher_name' => $batch->teacher?->user?->name,
                'teacher_email' => $batch->teacher?->user?->email,
                'time_slot' => $batch->time_slot,
                'status' => $batch->status instanceof \BackedEnum ? $batch->status->value : (string) $batch->status,
                'students_limit' => $batch->students_limit,
                'current_students_count' => (int) ($batch->current_students_count ?? 0),
            ])
            ->values();
    }

    private function buildStudentOptions()
    {
        $now = now();

        return Student::query()
            ->select('id', 'user_id', 'student_uid', 'class_id', 'board_id')
            ->with([
                'user:id,name,email,phone',
                'clazz:id,name',
                'board:id,name',
                'batches' => function ($q) {
                    $q->select('batches.id', 'batch_code', 'subject_id', 'plan_id', 'time_slot')
                        ->withPivot(['status', 'ended_at'])
                        ->with(['subject:id,name', 'plan:id,title']);
                },
            ])
            ->orderByDesc('id')
            ->get()
            ->map(function ($student) use ($now) {
                $activeBatches = $student->batches
                    ->filter(fn($batch) => $batch->pivot?->status === 'active' && (!$batch->pivot?->ended_at || $batch->pivot->ended_at > $now))
                    ->values();

                return [
                    'id' => $student->id,
                    'student_uid' => $student->student_uid,
                    'name' => $student->user?->name,
                    'email' => $student->user?->email,
                    'phone' => $student->user?->phone,
                    'class_name' => $student->clazz?->name,
                    'board_name' => $student->board?->name,
                    'active_batches' => $activeBatches->map(fn($batch) => [
                        'id' => $batch->id,
                        'batch_code' => $batch->batch_code,
                        'subject_name' => $batch->subject?->name,
                        'plan_title' => $batch->plan?->title,
                        'time_slot' => $batch->time_slot,
                    ])->values(),
                ];
            })
            ->values();
    }
}
