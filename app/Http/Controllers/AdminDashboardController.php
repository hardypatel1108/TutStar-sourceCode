<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\BatchStudent;
use App\Models\Board;
use App\Models\ClassSession;
use App\Models\Clazz;
use App\Models\Doubt;
use App\Models\Homework;
use App\Models\Payment;
use App\Models\PendingEnrollment;
use App\Models\Student;
use App\Models\StudentSubscription;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rules;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use App\Mail\UserRegisteredMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $normalizeStatus = function ($status): string {
            if ($status instanceof \BackedEnum) {
                return (string) $status->value;
            }

            if ($status instanceof \UnitEnum) {
                return $status->name;
            }

            return (string) $status;
        };

        $now = now();
        $range = $request->input('range', '30d');
        $boardId = $request->input('board');
        $classId = $request->input('class');
        $teacherId = $request->input('teacher');

        $days = match ($range) {
            '7d' => 7,
            '90d' => 90,
            '180d' => 180,
            default => 30,
        };

        $todayStart = $now->copy()->startOfDay();
        $todayEnd = $now->copy()->endOfDay();
        $next7End = $now->copy()->addDays(7)->endOfDay();
        $periodStart = $now->copy()->subDays($days)->startOfDay();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();

        $sessionBaseQuery = ClassSession::query()
            ->when($teacherId, fn($q) => $q->where('teacher_id', $teacherId))
            ->when($classId, fn($q) => $q->whereHas('batch', fn($batchQuery) => $batchQuery->where('class_id', $classId)))
            ->when($boardId, fn($q) => $q->whereHas('batch.clazz', fn($clazzQuery) => $clazzQuery->where('board_id', $boardId)));

        $batchBaseQuery = Batch::query()
            ->when($teacherId, fn($q) => $q->where('teacher_id', $teacherId))
            ->when($classId, fn($q) => $q->where('class_id', $classId))
            ->when($boardId, fn($q) => $q->whereHas('clazz', fn($clazzQuery) => $clazzQuery->where('board_id', $boardId)));

        $studentBaseQuery = Student::query()
            ->when($classId, fn($q) => $q->where('class_id', $classId))
            ->when($boardId, fn($q) => $q->where('board_id', $boardId));

        $homeworkBaseQuery = Homework::query()
            ->when($teacherId, fn($q) => $q->where('teacher_id', $teacherId))
            ->when($classId, fn($q) => $q->whereHas('session.batch', fn($batchQuery) => $batchQuery->where('class_id', $classId)))
            ->when($boardId, fn($q) => $q->whereHas('session.batch.clazz', fn($clazzQuery) => $clazzQuery->where('board_id', $boardId)));

        $doubtBaseQuery = Doubt::query()
            ->when($teacherId, fn($q) => $q->where('teacher_id', $teacherId))
            ->when($classId, fn($q) => $q->whereHas('session.batch', fn($batchQuery) => $batchQuery->where('class_id', $classId)))
            ->when($boardId, fn($q) => $q->whereHas('session.batch.clazz', fn($clazzQuery) => $clazzQuery->where('board_id', $boardId)));

        $paymentBaseQuery = Payment::query()
            ->when($classId, fn($q) => $q->whereHas('student', fn($studentQuery) => $studentQuery->where('class_id', $classId)))
            ->when($boardId, fn($q) => $q->whereHas('student', fn($studentQuery) => $studentQuery->where('board_id', $boardId)));

        $kpis = [
            'students_total' => (clone $studentBaseQuery)->count(),
            'teachers_total' => Teacher::count(),
            'batches_total' => (clone $batchBaseQuery)->count(),
            'active_batches' => (clone $batchBaseQuery)->where('status', 'active')->count(),
            'sessions_today' => (clone $sessionBaseQuery)->whereBetween('class_date', [$todayStart, $todayEnd])->count(),
            'upcoming_sessions' => (clone $sessionBaseQuery)->whereIn('status', ['scheduled', 'rescheduled'])
                ->where('class_date', '>=', $now)
                ->count(),
            'completed_sessions_30_days' => (clone $sessionBaseQuery)->where('status', 'completed')
                ->where('class_date', '>=', $periodStart)
                ->count(),
            'open_doubts' => (clone $doubtBaseQuery)->where('status', 'open')->count(),
            'pending_enrollments' => PendingEnrollment::query()
                ->where('resolved', false)
                ->when($classId, fn($q) => $q->whereHas('student', fn($studentQuery) => $studentQuery->where('class_id', $classId)))
                ->when($boardId, fn($q) => $q->whereHas('student', fn($studentQuery) => $studentQuery->where('board_id', $boardId)))
                ->count(),
            'homeworks_30_days' => (clone $homeworkBaseQuery)->where('created_at', '>=', $periodStart)->count(),
            'active_subscriptions' => StudentSubscription::query()
                ->where('status', 'active')
                ->when($classId, fn($q) => $q->whereHas('student', fn($studentQuery) => $studentQuery->where('class_id', $classId)))
                ->when($boardId, fn($q) => $q->whereHas('student', fn($studentQuery) => $studentQuery->where('board_id', $boardId)))
                ->count(),
            'payments_this_month' => (float) (clone $paymentBaseQuery)->where('status', 'completed')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount'),
            'payments_count_this_month' => (clone $paymentBaseQuery)->where('status', 'completed')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->count(),
        ];

        $completedPaymentsForFlow = (clone $paymentBaseQuery)
            ->where('status', 'completed')
            ->whereNotNull('checkout_plan_id')
            ->with(['checkoutPlan:id,plan_id'])
            ->get();

        $unresolvedPendingForFlow = PendingEnrollment::query()
            ->where('resolved', false)
            ->when($classId, fn($q) => $q->whereHas('student', fn($studentQuery) => $studentQuery->where('class_id', $classId)))
            ->when($boardId, fn($q) => $q->whereHas('student', fn($studentQuery) => $studentQuery->where('board_id', $boardId)))
            ->count();

        $completedPaymentsMissingDownstream = $completedPaymentsForFlow
            ->filter(function ($payment) {
                $planId = optional($payment->checkoutPlan)->plan_id;

                $hasPending = PendingEnrollment::query()
                    ->where('payment_id', $payment->id)
                    ->exists();

                $hasActiveBatchForPlan = false;
                if ($planId) {
                    $hasActiveBatchForPlan = BatchStudent::query()
                        ->where('student_id', $payment->student_id)
                        ->where('status', 'active')
                        ->where(function ($query) {
                            $query->whereNull('ended_at')
                                ->orWhere('ended_at', '>', now());
                        })
                        ->whereHas('batch', fn($batchQuery) => $batchQuery->where('plan_id', $planId))
                        ->exists();
                }

                return is_null($payment->subscription_id) && ! $hasPending && ! $hasActiveBatchForPlan;
            })
            ->count();

        $expiredButStillActive = BatchStudent::query()
            ->where('status', 'active')
            ->whereNotNull('ended_at')
            ->where('ended_at', '<=', $now)
            ->when($classId, fn($q) => $q->whereHas('student', fn($studentQuery) => $studentQuery->where('class_id', $classId)))
            ->when($boardId, fn($q) => $q->whereHas('student', fn($studentQuery) => $studentQuery->where('board_id', $boardId)))
            ->when($teacherId, fn($q) => $q->whereHas('batch', fn($batchQuery) => $batchQuery->where('teacher_id', $teacherId)))
            ->count();

        $activeBatchWithoutSubscription = BatchStudent::query()
            ->with('batch:id,plan_id')
            ->where('status', 'active')
            ->where(function ($query) use ($now) {
                $query->whereNull('ended_at')
                    ->orWhere('ended_at', '>', $now);
            })
            ->when($classId, fn($q) => $q->whereHas('student', fn($studentQuery) => $studentQuery->where('class_id', $classId)))
            ->when($boardId, fn($q) => $q->whereHas('student', fn($studentQuery) => $studentQuery->where('board_id', $boardId)))
            ->when($teacherId, fn($q) => $q->whereHas('batch', fn($batchQuery) => $batchQuery->where('teacher_id', $teacherId)))
            ->get()
            ->filter(function ($batchStudent) use ($now) {
                $planId = optional($batchStudent->batch)->plan_id;

                if (! $planId) {
                    return true;
                }

                return ! StudentSubscription::query()
                    ->where('student_id', $batchStudent->student_id)
                    ->where('plan_id', $planId)
                    ->where('status', 'active')
                    ->where('end_at', '>', $now)
                    ->exists();
            })
            ->count();

        $sessionsByDayRaw = (clone $sessionBaseQuery)
            ->selectRaw('DATE(class_date) as day, COUNT(*) as total')
            ->whereIn('status', ['scheduled', 'rescheduled'])
            ->whereBetween('class_date', [$todayStart, $next7End])
            ->groupBy(DB::raw('DATE(class_date)'))
            ->orderBy(DB::raw('DATE(class_date)'))
            ->pluck('total', 'day');

        $sessionsByDay = collect(range(0, 6))->map(function (int $offset) use ($todayStart, $sessionsByDayRaw) {
            $date = $todayStart->copy()->addDays($offset);
            $key = $date->toDateString();

            return [
                'date' => $key,
                'label' => $date->format('D'),
                'total' => (int) ($sessionsByDayRaw[$key] ?? 0),
            ];
        })->values();

        $revenueTrend = (clone $paymentBaseQuery)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month_key")
            ->selectRaw("DATE_FORMAT(created_at, '%b %Y') as month_label")
            ->selectRaw('SUM(amount) as amount')
            ->selectRaw('COUNT(*) as payments_count')
            ->where('status', 'completed')
            ->where('created_at', '>=', $now->copy()->subMonths(5)->startOfMonth())
            ->groupBy('month_key', 'month_label')
            ->orderBy('month_key')
            ->get()
            ->map(fn($row) => [
                'month_key' => $row->month_key,
                'month_label' => $row->month_label,
                'amount' => (float) $row->amount,
                'payments_count' => (int) $row->payments_count,
            ])
            ->values();

        $topTeachers = Teacher::query()
            ->with('user:id,name')
            ->withCount([
                'classSessions as sessions_next_7_days' => function ($q) use ($todayStart, $next7End) {
                    $q->whereIn('status', ['scheduled', 'rescheduled'])
                        ->whereBetween('class_date', [$todayStart, $next7End]);
                },
                'classSessions as completed_sessions_30_days' => function ($q) use ($periodStart) {
                    $q->where('status', 'completed')
                        ->where('class_date', '>=', $periodStart);
                },
                'homeworks as homeworks_30_days' => function ($q) use ($periodStart) {
                    $q->where('created_at', '>=', $periodStart);
                },
            ])
            ->when($teacherId, fn($q) => $q->where('id', $teacherId))
            ->orderByDesc('sessions_next_7_days')
            ->take(5)
            ->get()
            ->map(fn($teacher) => [
                'id' => $teacher->id,
                'name' => $teacher->user?->name ?? '-',
                'sessions_next_7_days' => (int) $teacher->sessions_next_7_days,
                'completed_sessions_30_days' => (int) $teacher->completed_sessions_30_days,
                'homeworks_30_days' => (int) $teacher->homeworks_30_days,
            ])
            ->values();

        $topBatches = (clone $batchBaseQuery)
            ->with(['clazz:id,name', 'subject:id,name', 'teacher.user:id,name'])
            ->withCount([
                'students as current_students_count' => function ($q) {
                    $q->where('batch_students.status', 'active')
                        ->where(function ($pivotQuery) {
                            $pivotQuery->whereNull('batch_students.ended_at')
                                ->orWhere('batch_students.ended_at', '>', now());
                        });
                },
                'sessions as upcoming_sessions_count' => function ($q) use ($now) {
                    $q->whereIn('status', ['scheduled', 'rescheduled'])
                        ->where('class_date', '>=', $now);
                },
            ])
            ->orderByDesc('current_students_count')
            ->take(6)
            ->get()
            ->map(function ($batch) {
                $limit = (int) ($batch->students_limit ?? 0);
                $current = (int) $batch->current_students_count;
                $occupancy = $limit > 0 ? min(100, (int) round(($current / $limit) * 100)) : 0;

                return [
                    'id' => $batch->id,
                    'batch_code' => $batch->batch_code,
                    'class_name' => $batch->clazz?->name ?? '-',
                    'subject_name' => $batch->subject?->name ?? '-',
                    'teacher_name' => $batch->teacher?->user?->name ?? '-',
                    'students_limit' => $limit,
                    'current_students_count' => $current,
                    'upcoming_sessions_count' => (int) $batch->upcoming_sessions_count,
                    'occupancy_percent' => $occupancy,
                ];
            })
            ->values();

        $classDistribution = Clazz::query()
            ->withCount('students')
            ->when($boardId, fn($q) => $q->where('board_id', $boardId))
            ->when($classId, fn($q) => $q->where('id', $classId))
            ->orderByDesc('students_count')
            ->take(8)
            ->get(['id', 'name'])
            ->map(fn($clazz) => [
                'id' => $clazz->id,
                'name' => $clazz->name,
                'students_count' => (int) $clazz->students_count,
            ])
            ->values();

        $sessionStatusBreakdown = (clone $sessionBaseQuery)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(fn($row) => [
                'status' => $normalizeStatus($row->status),
                'total' => (int) $row->total,
            ])
            ->values();

        $paymentStatusBreakdown = (clone $paymentBaseQuery)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(fn($row) => [
                'status' => $normalizeStatus($row->status),
                'total' => (int) $row->total,
            ])
            ->values();

        $batchStatusBreakdown = (clone $batchBaseQuery)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(fn($row) => [
                'status' => $normalizeStatus($row->status),
                'total' => (int) $row->total,
            ])
            ->values();

        $doubtStatusBreakdown = (clone $doubtBaseQuery)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(fn($row) => [
                'status' => $normalizeStatus($row->status),
                'total' => (int) $row->total,
            ])
            ->values();

        $months = collect(range(5, 0))->map(function (int $offset) use ($now) {
            return $now->copy()->subMonths($offset)->startOfMonth();
        })->push($now->copy()->startOfMonth())->values();

        $monthlyActivity = $months->map(function ($monthStartItem) use ($sessionBaseQuery, $homeworkBaseQuery, $doubtBaseQuery) {
            $monthEndItem = $monthStartItem->copy()->endOfMonth();

            return [
                'month_key' => $monthStartItem->format('Y-m'),
                'month_label' => $monthStartItem->format('M'),
                'sessions_completed' => (int) (clone $sessionBaseQuery)->where('status', 'completed')
                    ->whereBetween('class_date', [$monthStartItem, $monthEndItem])
                    ->count(),
                'homeworks_created' => (int) (clone $homeworkBaseQuery)->whereBetween('created_at', [$monthStartItem, $monthEndItem])->count(),
                'doubts_raised' => (int) (clone $doubtBaseQuery)->whereBetween('created_at', [$monthStartItem, $monthEndItem])->count(),
            ];
        })->values();

        $boards = Board::query()->select('id', 'name')->orderBy('name')->get();
        $classes = Clazz::query()
            ->select('id', 'name', 'board_id')
            ->when($boardId, fn($q) => $q->where('board_id', $boardId))
            ->orderBy('name')
            ->get();
        $teachers = Teacher::query()
            ->with('user:id,name')
            ->select('id', 'user_id')
            ->orderBy('id')
            ->get()
            ->map(fn($teacher) => [
                'id' => $teacher->id,
                'name' => $teacher->user?->name ?? '-',
            ])
            ->values();

        return Inertia::render("Admin/dashboard", [
            'analytics' => [
                'generated_at' => $now->toDateTimeString(),
                'kpis' => $kpis,
                'sessions_by_day' => $sessionsByDay,
                'revenue_trend' => $revenueTrend,
                'top_teachers' => $topTeachers,
                'top_batches' => $topBatches,
                'class_distribution' => $classDistribution,
                'session_status_breakdown' => $sessionStatusBreakdown,
                'payment_status_breakdown' => $paymentStatusBreakdown,
                'batch_status_breakdown' => $batchStatusBreakdown,
                'doubt_status_breakdown' => $doubtStatusBreakdown,
                'monthly_activity' => $monthlyActivity,
                'enrollment_flow' => [
                    'completed_payments' => (int) $completedPaymentsForFlow->count(),
                    'unresolved_pending' => (int) $unresolvedPendingForFlow,
                    'completed_payments_missing_downstream' => (int) $completedPaymentsMissingDownstream,
                    'expired_but_active_batch_allocations' => (int) $expiredButStillActive,
                    'active_batch_without_subscription' => (int) $activeBatchWithoutSubscription,
                ],
            ],
            'filters' => [
                'range' => $range,
                'board' => $boardId ? (string) $boardId : '',
                'class' => $classId ? (string) $classId : '',
                'teacher' => $teacherId ? (string) $teacherId : '',
            ],
            'boards' => $boards,
            'classes' => $classes,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render("users/create");
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name'       => ['required', 'string', 'max:255'],
            'middle_name'      => ['nullable', 'string', 'max:255'],
            'last_name'        => ['required', 'string', 'max:255'],
            'email'            => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            // 'city'             => ['nullable', 'string', 'max:255'],
            // 'custom_text'      => ['nullable', 'string', 'max:500'],
            // 'experience_years' => ['required', 'string', 'max:20'],
            // 'primary_role'     => ['required', 'string', 'max:100'],
            // 'referral_source'  => ['nullable', 'string', 'max:100'],
            'profile_image'    => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:5000'],
        ]);

        // 🔹 Generate random password
        $plainPassword = Str::random(10);

        // 🔹 Handle file upload (store privately, not public)
        $profilePath = null;
        if ($request->hasFile('profile_image')) {
            $profilePath = $request->file('profile_image')->store('profile_images', 'public');
        }
        // 🔹 Create User
        $user = User::create([
            'first_name'       => $request->first_name,
            'middle_name'      => $request->middle_name,
            'last_name'        => $request->last_name,
            'name'             => trim($request->first_name . ' ' . $request->last_name),
            'email'            => $request->email,
            'password'         => Hash::make($plainPassword),
            // 'city'             => $request->city,
            // 'custom_text'      => $request->custom_text,
            // 'experience_years' => $request->experience_years,
            // 'primary_role'     => $request->primary_role,
            // 'referral_source'  => $request->referral_source,
            'profile_image'    => $profilePath,
        ]);
        $user->assignRole('student');
        // 🔹 Send welcome email
        Mail::to($user->email)->send(new UserRegisteredMail($user, $plainPassword));

        return redirect()->route('users.index')
            ->with('success', 'User registered successfully and email sent.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = User::findOrFail($id);

        return Inertia::render("users/edit", [
            "user" => $user
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {

        $user = User::findOrFail($id);

        $request->validate([
            'first_name'       => ['required', 'string', 'max:255'],
            'middle_name'      => ['nullable', 'string', 'max:255'],
            'last_name'        => ['required', 'string', 'max:255'],
            'email'            => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,' . $user->id],
            // 'city'             => ['nullable', 'string', 'max:255'],
            // 'custom_text'      => ['nullable', 'string', 'max:500'],
            // 'experience_years' => ['required', 'string', 'max:20'],
            // 'primary_role'     => ['required', 'string', 'max:100'],
            // 'referral_source'  => ['nullable', 'string', 'max:100'],
            'profile_image'    => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:5000'],
        ]);

        // Update file if new uploaded
        if ($request->hasFile('profile_image')) {
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }
            $user->profile_image = $request->file('profile_image')->store('profile_images', 'public');
        }

        $user->update([
            'first_name'       => $request->first_name,
            'middle_name'      => $request->middle_name,
            'last_name'        => $request->last_name,
            'name'             => trim($request->first_name . ' ' . $request->last_name),
            'email'            => $request->email,
            // 'city'             => $request->city,
            // 'custom_text'      => $request->custom_text,
            // 'experience_years' => $request->experience_years,
            // 'primary_role'     => $request->primary_role,
            // 'referral_source'  => $request->referral_source,
        ]);
        // dd($user);
        // $user->assignRole('user');

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();


        return redirect()->route('users.index')->with('success', 'User deleted (soft delete).');
    }

    // public function members()
    // {
    //     // Get all users with portfolio count
    //     $users = User::with('portfolios')->get();

    //     return Inertia::render('members', [
    //         'members' => $users->map(function ($user) {
    //             return [
    //                 'id' => $user->id,
    //                 'full_name' => $user->name,
    //                 'primary_role' => $user->primary_role,
    //                 'city_state' => $user->city,
    //                 'one_line_pitch' => $user->custom_text,
    //                 'joining_date' => $user->created_at->format('Y-m-d'),
    //                 'experience' => $user->experience_years,
    //                 'membership_type' => 'premium', // if you have column, replace
    //                 'has_portfolio' => $user->portfolios->count() > 0,
    //             ];
    //         })
    //     ]);
    // }

    public function members(Request $request)
    {
        $query = User::query()->with('portfolios');

        // Filters
        if ($request->role && $request->role !== 'all') {
            $query->where('primary_role', $request->role);
        }

        if ($request->experience && $request->experience !== 'all') {
            $query->where('experience', $request->experience);
        }

        if ($request->membership && $request->membership !== 'all') {
            $query->where('membership_type', $request->membership);
        }

        // Pagination
        $members = $query->orderBy('created_at', 'desc')->paginate(config('app.paginate'));
        // dd($request->input('role', 'all'));
        return Inertia::render('freelancers_list', [
            'members' => $members,
            'filters' => [
                'role' => $request->input('role', 'all'),
                'experience' => $request->input('experience', 'all'),
                'membership' => $request->input('membership', 'all'),
            ],
        ]);
    }
}
