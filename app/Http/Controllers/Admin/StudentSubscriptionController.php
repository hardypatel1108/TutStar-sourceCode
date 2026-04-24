<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Clazz;
use App\Models\StudentSubscription;
use App\Models\User;
use App\Models\Plan;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentSubscriptionController extends Controller
{
    /**
     * Display a listing of student subscriptions.
     */
    public function index(Request $request)
    {
        $subscriptions = StudentSubscription::query()
            ->with([
                'student:id,user_id,class_id,student_uid,school,city,state,status',
                'student.user:id,name,email,role',
                'student.clazz:id,name,board_id',
                'plan:id,title,type,status',
                'payments:id,subscription_id,amount,status,gateway',
            ])

            // Filter: subscription status
            ->when(
                $request->status,
                fn($q) =>
                $q->where('status', $request->status)
            )

            // Filter: plan
            ->when(
                $request->plan,
                fn($q) =>
                $q->where('plan_id', $request->plan)
            )

            // Filter: student
            ->when(
                $request->student,
                fn($q) =>
                $q->where('student_id', $request->student)
            )

            // Filter: class
            ->when(
                $request->class,
                fn($q) =>
                $q->whereHas(
                    'student',
                    fn($s) =>
                    $s->where('class_id', $request->class)
                )
            )

            // Filter: board (via class)
            ->when(
                $request->board,
                fn($q) =>
                $q->whereHas(
                    'student.clazz',
                    fn($c) =>
                    $c->where('board_id', $request->board)
                )
            )

            // Filter: student status (active/inactive/blocked)
            ->when(
                $request->student_status,
                fn($q) =>
                $q->whereHas(
                    'student',
                    fn($s) =>
                    $s->where('status', $request->student_status)
                )
            )

            // Filter: search (student name, email, UID)
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas(
                    'student',
                    fn($s) =>
                    $s->whereHas(
                        'user',
                        fn($u) =>
                        $u->where('name', 'like', "%{$request->search}%")
                            ->orWhere('email', 'like', "%{$request->search}%")
                    )
                        ->orWhere('student_uid', 'like', "%{$request->search}%")
                );
            })

            // Filter: subscription date range
            ->when(
                $request->start_at,
                fn($q) =>
                $q->whereDate('start_at', '>=', $request->start_at)
            )
            ->when(
                $request->end_at,
                fn($q) =>
                $q->whereDate('end_at', '<=', $request->end_at)
            )

            // Filter: auto_renew
            ->when(
                !is_null($request->auto_renew),
                fn($q) =>
                $q->where('auto_renew', $request->auto_renew)
            )

            // Filter: student city
            ->when(
                $request->city,
                fn($q) =>
                $q->whereHas(
                    'student',
                    fn($s) =>
                    $s->where('city', 'like', "%{$request->city}%")
                )
            )

            // Filter: student state
            ->when(
                $request->state,
                fn($q) =>
                $q->whereHas(
                    'student',
                    fn($s) =>
                    $s->where('state', 'like', "%{$request->state}%")
                )
            )

            // Filter: payments (status)
            ->when(
                $request->payment_status,
                fn($q) =>
                $q->whereHas(
                    'payments',
                    fn($p) =>
                    $p->where('status', $request->payment_status)
                )
            )

            // Filter: payments (gateway)
            ->when(
                $request->gateway,
                fn($q) =>
                $q->whereHas(
                    'payments',
                    fn($p) =>
                    $p->where('gateway', $request->gateway)
                )
            )

            // Filter: min/max price paid
            ->when(
                $request->price_min,
                fn($q) =>
                $q->where('price_paid', '>=', $request->price_min)
            )
            ->when(
                $request->price_max,
                fn($q) =>
                $q->where('price_paid', '<=', $request->price_max)
            )

            ->orderByDesc('id')
            ->paginate(config('app.paginate'))
            ->withQueryString();

        // Dropdowns / filter options
        $plans = Plan::select('id', 'title')->get();
        $students = User::where('role', 'student')->select('id', 'name')->get();
        $classes = Clazz::select('id', 'name')->get();
        $boards = Board::select('id', 'name')->get();

        return Inertia::render('Admin/StudentSubscriptions/index', [
            'subscriptions' => $subscriptions,
            'plans' => $plans,
            'students' => $students,
            'classes' => $classes,
            'boards' => $boards,
            'filters' => $request->all(),
        ]);
    }


    /**
     * Show the form for creating a new student subscription.
     */
    public function create()
    {
        $plans = Plan::select('id', 'title')->get();
        // Selecting students from students table
        $students = Student::with('user:id,name')
            ->select('id', 'user_id')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->user->name,
            ]);

        return Inertia::render('Admin/StudentSubscriptions/create', [
            'plans' => $plans,
            'students' => $students,
        ]);
    }

    /**
     * Store a newly created student subscription.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'plan_id' => 'required|exists:plans,id',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after_or_equal:start_at',
            'status' => 'required|in:active,expired,cancelled',
            'auto_renew' => 'boolean',
            'price_paid' => 'nullable|numeric|min:0',
            'phonepe_order_id' => 'nullable|string|max:255',
        ]);

        StudentSubscription::create($validated);

        return redirect()->route('admin.studentSubscriptions.index')
            ->with('success', 'Student subscription created successfully');
    }

    /**
     * Show the form for editing a student subscription.
     */

    public function edit(StudentSubscription $student_subscription)
    {
        $plans = Plan::select('id', 'title')->get();

        $students = Student::with('user:id,name')
            ->select('id', 'user_id')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->user->name,
            ]);

        return Inertia::render('Admin/StudentSubscriptions/edit', [
            'subscription' => $student_subscription->load([
                'student.user:id,name',
                'plan:id,title'
            ]),
            'plans' => $plans,
            'students' => $students,
        ]);
    }

    /**
     * Update the specified subscription.
     */
    public function update(Request $request, StudentSubscription $student_subscription)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'plan_id' => 'required|exists:plans,id',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after_or_equal:start_at',
            'status' => 'required|in:active,inactive,expired,cancelled',
            'auto_renew' => 'boolean',
            'price_paid' => 'nullable|numeric|min:0',
            'phonepe_order_id' => 'nullable|string|max:255',
        ]);

        $student_subscription->update($validated);
        return redirect()->route('admin.studentSubscriptions.index')->with('success', 'Student subscription updated successfully');
    }

    /**
     * Remove the specified subscription.
     */
    public function destroy(StudentSubscription $student_subscription)
    {
        $student_subscription->delete();
        return back()->with('success', 'Student subscription deleted successfully');
    }
}
