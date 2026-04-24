<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Clazz;
use App\Models\Feedback;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    /**
     * Display a listing of feedbacks.
     */
    public function index(Request $request)
    {
        $feedbacks = Feedback::query()
            ->with(['student.user:id,name,email'])

            // Filter: Rating (exact match)
            ->when(
                $request->rating,
                fn($q) =>
                $q->where('rating', $request->rating)
            )

            // Filter: Forced by admin (boolean)
            ->when(
                !is_null($request->forced),
                fn($q) =>
                $q->where('forced_by_admin', $request->forced)
            )

            // Filter: Search student (name/email)
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('student.user', function ($sub) use ($request) {
                    $sub->where('name', 'like', "%{$request->search}%")
                        ->orWhere('email', 'like', "%{$request->search}%");
                });
            })

            // Filter: Class ID
            ->when($request->class_id, function ($q) use ($request) {
                $q->whereHas(
                    'student',
                    fn($s) =>
                    $s->where('class_id', $request->class_id)
                );
            })

            // Filter: Student City
            ->when(
                $request->city,
                fn($q) =>
                $q->whereHas(
                    'student',
                    fn($s) =>
                    $s->where('city', 'like', "%{$request->city}%")
                )
            )

            // Filter: Student State
            ->when(
                $request->state,
                fn($q) =>
                $q->whereHas(
                    'student',
                    fn($s) =>
                    $s->where('state', 'like', "%{$request->state}%")
                )
            )

            // Filter: Student DOB
            ->when(
                $request->dob,
                fn($q) =>
                $q->whereHas(
                    'student',
                    fn($s) =>
                    $s->whereDate('dob', $request->dob)
                )
            )

            // Filter: Student Status (Enum)
            ->when(
                $request->status,
                fn($q) =>
                $q->whereHas(
                    'student',
                    fn($s) =>
                    $s->where('status', $request->status)
                )
            )

            // Filter: Feedback created date range
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

            ->orderByDesc('id')
            ->paginate(config('app.paginate'))
            ->withQueryString();
        $classes = Clazz::select('id', 'name')->get();
        return Inertia::render('Admin/Feedbacks/index', [
            'feedbacks' => $feedbacks,
            'classes' => $classes,
            // Return applied filters
            'filters' => $request->only([
                'rating',
                'forced',
                'search',
                'class_id',
                'city',
                'state',
                'status',
                'dob',
                'from_date',
                'to_date',
            ]),
        ]);
    }

    /**
     * Show the form for creating a new feedback.
     */
    public function create()
    {
        $students = User::where('role', 'student')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Feedbacks/Create', [
            'students' => $students,
        ]);
    }

    /**
     * Store a newly created feedback entry.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'forced_by_admin' => 'boolean',
        ]);

        Feedback::create($validated);

        return redirect()->route('admin.feedbacks.index')->with('success', 'Feedback added successfully');
    }

    /**
     * Show the form for editing a feedback entry.
     */
    public function edit(Feedback $feedback)
    {
        $students = User::where('role', 'student')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Feedbacks/Edit', [
            'feedback' => $feedback->load('student:id,name,email'),
            'students' => $students,
        ]);
    }

    /**
     * Update the specified feedback.
     */
    public function update(Request $request, Feedback $feedback)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'forced_by_admin' => 'boolean',
        ]);

        $feedback->update($validated);

        return back()->with('success', 'Feedback updated successfully');
    }

    /**
     * Remove the specified feedback entry.
     */
    public function destroy(Feedback $feedback)
    {
        $feedback->delete();
        return back()->with('success', 'Feedback deleted successfully');
    }
}
