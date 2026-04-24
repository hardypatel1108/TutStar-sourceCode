<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CheckoutPlan;
use App\Models\Clazz;
use App\Models\Payment;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Plan;
use App\Models\User;
use App\Models\StudentSubscription;
use App\Services\EnrollmentFulfillmentService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    private function applyFilters($query, Request $request)
    {
        return $query
            // Filter: Status
            ->when(
                $request->status,
                fn($q) =>
                $q->where('status', $request->status)
            )

            // Filter: Payment Gateway (PhonePe / Manual)
            ->when(
                $request->gateway,
                fn($q) =>
                $q->where('gateway', $request->gateway)
            )

            // Filter: Student Name (via student->user->name)
            ->when(
                $request->student_id,
                fn($q) =>
                $q->where('student_id', $request->student_id)
            )
            ->when($request->student, function ($q) use ($request) {
                $q->whereHas(
                    'student.user',
                    fn($u) =>
                    $u->where('name', 'like', "%{$request->student}%")
                );
            })

            // Filter: Subscription (subscription id)
            ->when(
                $request->subscription,
                fn($q) =>
                $q->where('subscription_id', $request->subscription)
            )

            // Filter: Subscription Plan
            ->when($request->plan, function ($q) use ($request) {
                $q->where(function ($inner) use ($request) {
                    $inner->whereHas(
                        'subscription',
                        fn($s) =>
                        $s->where('plan_id', $request->plan)
                    )->orWhereHas(
                        'checkoutPlan',
                        fn($cp) =>
                        $cp->where('plan_id', $request->plan)
                    );
                });
            })

            // Filter: Class (from plan)
            ->when($request->class_id, function ($q) use ($request) {
                $q->where(function ($inner) use ($request) {
                    $inner->whereHas(
                        'subscription.plan',
                        fn($p) =>
                        $p->where('class_id', $request->class_id)
                    )->orWhereHas(
                        'checkoutPlan.plan',
                        fn($p) =>
                        $p->where('class_id', $request->class_id)
                    );
                });
            })

            // Filter: Subject (from plan subjects)
            ->when($request->subject_id, function ($q) use ($request) {
                $q->where(function ($inner) use ($request) {
                    $inner->whereHas(
                        'subscription.plan.subjects',
                        fn($s) =>
                        $s->where('subjects.id', $request->subject_id)
                    )->orWhereHas(
                        'checkoutPlan.plan.subjects',
                        fn($s) =>
                        $s->where('subjects.id', $request->subject_id)
                    );
                });
            })

            // Filter: Month wise (payment creation month)
            ->when($request->month, function ($q) use ($request) {
                try {
                    $monthDate = Carbon::createFromFormat('Y-m', $request->month);
                    $q->whereYear('created_at', $monthDate->year)
                        ->whereMonth('created_at', $monthDate->month);
                } catch (\Throwable $e) {
                    // Ignore invalid month format
                }
            })

            // Filter: Creator (Admin User ID)
            ->when(
                $request->created_by,
                fn($q) =>
                $q->where('created_by', $request->created_by)
            )

            // Filter: Date Range (payment created_at)
            ->when(
                $request->from_date,
                fn($q) =>
                $q->whereDate('created_at', '>=', $request->from_date)
            )
            ->when(
                $request->to_date,
                fn($q) =>
                $q->whereDate('created_at', '<=', $request->to_date)
            )

            // Filter: Search (student name/uid, txn ID, note)
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($inner) use ($request) {
                    $inner->where('gateway_txn_id', 'like', "%{$request->search}%")
                        ->orWhere('note', 'like', "%{$request->search}%")
                        ->orWhereHas('student', fn($s) => $s->where('student_uid', 'like', "%{$request->search}%"))
                        ->orWhereHas('student.user', fn($u) => $u->where('name', 'like', "%{$request->search}%"));
                });
            });
    }

    /**
     * Display a listing of payments.
     */
    public function index(Request $request)
    {
        $statsBase = Payment::query()
            ->where('status', PaymentStatus::COMPLETED);

        $paymentStats = [
            'confirmed_total' => (float) (clone $statsBase)->sum('amount'),
            'confirmed_last_30_days' => (float) (clone $statsBase)->where('created_at', '>=', now()->subDays(30))->sum('amount'),
            'confirmed_last_7_days' => (float) (clone $statsBase)->where('created_at', '>=', now()->subDays(7))->sum('amount'),
        ];

        $filteredBase = $this->applyFilters(Payment::query(), $request);

        $paymentStats['confirmed_filtered_total'] = (float) (clone $filteredBase)
            ->where('status', PaymentStatus::COMPLETED)
            ->sum('amount');

        $payments = $filteredBase
            ->with([
                'student.user:id,name',         // Student name from User
                'student.clazz:id,name',
                'subscription.plan:id,title,type,board_id,class_id',    // Subscription plan info
                'subscription.plan.board:id,name',
                'subscription.plan.clazz:id,name',
                'subscription.plan.subjects:id,name',
                'creator:id,name',              // Admin who created payment
                'checkoutPlan.plan:id,title,type,board_id,class_id',
                'checkoutPlan.plan.board:id,name',
                'checkoutPlan.plan.clazz:id,name',
                'checkoutPlan.plan.subjects:id,name',
            ])

            ->latest()
            ->paginate(config('app.paginate'))
            ->withQueryString();

        $paymentIds = $payments->getCollection()->pluck('id')->filter()->all();

        $fulfillmentLogsByPaymentId = AuditLog::query()
            ->where('action', 'payment_fulfilled')
            ->where('model_type', Payment::class)
            ->whereIn('model_id', $paymentIds)
            ->orderByDesc('id')
            ->get()
            ->keyBy('model_id');

        $payments->setCollection(
            $payments->getCollection()->map(function ($payment) use ($fulfillmentLogsByPaymentId) {
                $payment->created_at_formatted = Carbon::parse($payment->created_at)->format('d M Y, h:i a');

                $kind = 'new';
                $log = $fulfillmentLogsByPaymentId->get($payment->id);

                if ($log && is_array($log->changes)) {
                    $mode = data_get($log->changes, 'mode');
                    $extendedBatchRows = (int) data_get($log->changes, 'extended_batch_rows', 0);

                    if ($mode === 'renewal' && $extendedBatchRows > 0) {
                        $kind = 'extend';
                    } elseif ($mode === 'renewal') {
                        $kind = 'renew';
                    } elseif ($mode === 'new') {
                        $kind = 'new';
                    }
                }

                $payment->payment_kind = $kind;

                $plan = $payment->checkoutPlan?->plan ?? $payment->subscription?->plan;
                $planTypeValue = $plan?->type instanceof \BackedEnum ? $plan->type->value : (string) ($plan?->type ?? '');
                $payment->display_plan = $plan?->title ?? '-';
                $payment->display_plan_type_name = trim(implode(' - ', array_filter([
                    $planTypeValue ? ucfirst($planTypeValue) : null,
                    $plan?->title,
                ]))) ?: '-';
                $payment->display_board = $plan?->board?->name ?? '-';
                $payment->display_class = $plan?->clazz?->name ?? $payment->student?->clazz?->name ?? '-';
                $payment->display_subjects = $plan?->subjects?->pluck('name')->filter()->values()->all() ?? [];
                $payment->student_uid = $payment->student?->student_uid ?? null;
                $payment->student_display = $payment->student?->user?->name ?? '-';
                $payment->display_payment_method = $this->resolvePaymentMethod($payment);

                return $payment;
            })
        );

        $classes = Clazz::query()->select('id', 'name')->orderBy('ordinal')->orderBy('name')->get();
        $subjects = Subject::query()->select('id', 'name')->orderBy('name')->get();
        $plans = Plan::query()->select('id', 'title')->orderBy('title')->get();

        return Inertia::render('Admin/Payments/index', [
            'payments' => $payments,
            'paymentStats' => $paymentStats,
            'classes' => $classes,
            'subjects' => $subjects,
            'plans' => $plans,
            'filters' => $request->only([
                'status',
                'gateway',
                'student_id',
                'student',
                'month',
                'class_id',
                'subject_id',
                'subscription',
                'plan',
                'created_by',
                'from_date',
                'to_date',
                'search',
            ]),
        ]);
    }


    /**
     * Show the form for creating a new payment.
     */
    public function create()
    {
        // Students
        $students = Student::with('user:id,name')
            ->select('id', 'user_id')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->user->name,
            ]);



        // ✅ Checkout Plans
        $checkoutPlans = CheckoutPlan::with('plan:id,title')
            ->select('id', 'plan_id', 'title')
            ->orderBy('title')
            ->get()
            ->map(fn($cp) => [
                'id' => $cp->id,
                'label' => $cp->title . ' (' . $cp->plan->title . ')',
            ]);

        return Inertia::render('Admin/Payments/create', [
            'students' => $students,
            'checkoutPlans' => $checkoutPlans,
        ]);
    }

    /**
     * Store a newly created payment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id'        => 'required|exists:students,id',
            'checkout_plan_id'  => 'nullable|exists:checkout_plans,id',

            'amount'            => 'required|numeric|min:0',

            'gateway'           => 'required|in:phonepe,manual',
            'gateway_txn_id'    => 'nullable|string|max:100',

            'gateway_response'  => 'nullable|array',
            'gateway_verified'  => 'boolean',

            'status'            => 'required|in:pending,completed,failed,refunded',
            'note'              => 'nullable|string|max:500',
        ]);

        $validated['created_by'] = auth()->id();

        $payment = Payment::create($validated);

        if ($payment->status === PaymentStatus::COMPLETED) {
            app(EnrollmentFulfillmentService::class)->createPendingFromPayment($payment);
        }

        return redirect()->route('admin.payments.index')
            ->with('success', 'Payment added successfully');
    }

    /**
     * Show the form for editing a payment.
     */
    public function edit(Payment $payment)
    {
        // Students
        $students = Student::with('user:id,name')
            ->select('id', 'user_id')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->user->name,
            ]);

        // ✅ Checkout Plans
        $checkoutPlans = CheckoutPlan::with('plan:id,title')
            ->select('id', 'plan_id', 'title')
            ->orderBy('title')
            ->get()
            ->map(fn($cp) => [
                'id' => $cp->id,
                'label' => $cp->title . ' (' . $cp->plan->title . ')',
            ]);

        $paymentData = [
            'id' => $payment->id,
            'student_id' => $payment->student_id,
            'checkout_plan_id' => $payment->checkout_plan_id,
            'amount' => (float) $payment->amount,
            'gateway' => $payment->gateway instanceof \BackedEnum ? $payment->gateway->value : (string) $payment->gateway,
            'gateway_txn_id' => $payment->gateway_txn_id,
            'gateway_verified' => (bool) $payment->gateway_verified,
            'status' => $payment->status instanceof \BackedEnum ? $payment->status->value : (string) $payment->status,
            'note' => $payment->note,
        ];

        return Inertia::render('Admin/Payments/edit', [
            'payment' => $paymentData,
            'students' => $students,
            'checkoutPlans' => $checkoutPlans,
        ]);
    }

    /**
     * Update the specified payment.
     */
    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'student_id'        => 'required|exists:students,id',
            'checkout_plan_id'  => 'nullable|exists:checkout_plans,id',

            'amount'            => 'required|numeric|min:0',

            'gateway'           => 'required|in:phonepe,manual',
            'gateway_txn_id'    => 'nullable|string|max:100',

            'gateway_response'  => 'nullable|array',
            'gateway_verified'  => 'boolean',

            'status'            => 'required|in:pending,completed,failed,refunded',
            'note'              => 'nullable|string|max:500',
        ]);

        /**
         * Normalize boolean values (important for Select inputs)
         */
        $validated['gateway_verified'] = $request->boolean('gateway_verified');

        /**
         * Update payment
         */
        $payment->update($validated);

        if ($payment->fresh()->status === PaymentStatus::COMPLETED) {
            app(EnrollmentFulfillmentService::class)->createPendingFromPayment($payment->fresh());
        }

        return redirect()
            ->route('admin.payments.index')
            ->with('success', 'Payment updated successfully');
    }

    public function destroy(Payment $payment)
{
    // 🔒 Safety check (optional but recommended)
    if ($payment->status === 'completed') {
        return back()->withErrors([
            'payment' => 'Completed payments cannot be deleted.',
        ]);
    }

    $payment->delete(); // soft delete

    return back()->with('success', 'Payment deleted successfully.');
}

    private function resolvePaymentMethod(Payment $payment): string
    {
        if (($payment->gateway instanceof \BackedEnum ? $payment->gateway->value : (string) $payment->gateway) === 'manual') {
            return 'other';
        }

        $payload = strtolower(json_encode($payment->gateway_response ?? [], JSON_UNESCAPED_UNICODE) ?: '');
        $txn = strtolower((string) ($payment->gateway_txn_id ?? ''));

        if (str_contains($payload, 'netbank') || str_contains($payload, 'net banking') || str_contains($txn, 'netbank')) {
            return 'net banking';
        }
        if (str_contains($payload, 'card') || str_contains($txn, 'card')) {
            return 'card';
        }
        if (str_contains($payload, 'upi') || str_contains($txn, 'upi')) {
            return 'upi';
        }

        return 'other';
    }
}
