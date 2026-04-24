<?php

namespace App\Http\Controllers\Admin;

use App\Enums\StudentStatus;
use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Student;
use App\Models\User;
use App\Models\Clazz;
use App\Models\Plan;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Mail\UserRegisteredMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Spatie\Image\Image;
use Spatie\Permission\Models\Role;
use App\Services\NotificationService;
use App\Enums\NotificationType;

class StudentController extends Controller
{
    /**
     * Display a listing of students.
     */
    public function index(Request $request)
    {
        $now = now();
        $expiringInDays = is_numeric($request->expiring_in_days) ? (int) $request->expiring_in_days : null;

        $students = Student::query()
            ->withTrashed()
            ->with([
                'user' => fn($q) => $q->withTrashed(),
                'clazz:id,name,board_id',
                'clazz.board:id,name',
                'batches:id,batch_code,subject_id,plan_id',
                'batches.subject:id,name',
                'batches.plan:id,title',
                'subscriptions:id,student_id,plan_id,end_at,status',
                'subscriptions.plan:id,title',
                'subscriptions.plan.subjects:id,name',
            ])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->class, fn($q) => $q->where('class_id', $request->class))
            ->when($request->board, fn($q) => $q->whereHas('clazz', fn($c) => $c->where('board_id', $request->board)))
            ->when($request->city, fn($q) => $q->where('city', 'like', "%{$request->city}%"))
            ->when($request->state, fn($q) => $q->where('state', 'like', "%{$request->state}%"))
            ->when($request->school, fn($q) => $q->where('school', 'like', "%{$request->school}%"))
            ->when($request->dob_from, fn($q) => $q->whereDate('dob', '>=', $request->dob_from))
            ->when($request->dob_to, fn($q) => $q->whereDate('dob', '<=', $request->dob_to))
            ->when($request->search, function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($inner) use ($search) {
                    $inner->where('student_uid', 'like', "%$search%")
                        ->orWhere('school', 'like', "%$search%")
                        ->orWhere('city', 'like', "%$search%")
                        ->orWhere('state', 'like', "%$search%")
                        ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%$search%")
                            ->orWhere('email', 'like', "%$search%")
                            ->orWhere('phone', 'like', "%$search%"))
                        ->orWhereHas('batches', fn($b) => $b->where('batch_code', 'like', "%$search%")
                            ->orWhere('batches.id', $search));
                });
            })
            ->when($request->teacher, fn($q) => $q->whereHas('batches', fn($b) => $b->where('teacher_id', $request->teacher)))
            ->when($request->batch, fn($q) => $q->whereHas('batches', fn($b) => $b->where('batches.id', $request->batch)
                ->orWhere('batch_code', 'like', "%{$request->batch}%")))
            ->when($request->subject, fn($q) => $q->where(function ($w) use ($request) {
                $w->whereHas('batches', fn($b) => $b->where('subject_id', $request->subject))
                    ->orWhereHas('subscriptions.plan.subjects', fn($s) => $s->where('subjects.id', $request->subject));
            }))
            ->when($request->plan, fn($q) => $q->where(function ($w) use ($request) {
                $w->whereHas('subscriptions', fn($s) => $s->where('plan_id', $request->plan))
                    ->orWhereHas('batches', fn($b) => $b->where('plan_id', $request->plan));
            }))
            ->when($request->allotted, function ($q) use ($now, $request) {
                if ($request->allotted === 'allotted') {
                    $q->whereHas('batches', function ($b) use ($now) {
                        $b->where('batch_students.status', 'active')
                            ->where(function ($inner) use ($now) {
                                $inner->whereNull('batch_students.ended_at')
                                    ->orWhere('batch_students.ended_at', '>', $now);
                            });
                    });
                }
                if ($request->allotted === 'unallotted') {
                    $q->whereDoesntHave('batches', function ($b) use ($now) {
                        $b->where('batch_students.status', 'active')
                            ->where(function ($inner) use ($now) {
                                $inner->whereNull('batch_students.ended_at')
                                    ->orWhere('batch_students.ended_at', '>', $now);
                            });
                    });
                }
            })
            ->when($request->enrollment_status, function ($q) use ($now, $request) {
                if ($request->enrollment_status === 'active') {
                    $q->where(function ($inner) use ($now) {
                        $inner->whereHas('subscriptions', fn($s) => $s->where('status', 'active')->where('end_at', '>', $now))
                            ->orWhereHas('batches', function ($b) use ($now) {
                                $b->where('batch_students.status', 'active')
                                    ->where(function ($x) use ($now) {
                                        $x->whereNull('batch_students.ended_at')->orWhere('batch_students.ended_at', '>', $now);
                                    });
                            });
                    });
                }
                if ($request->enrollment_status === 'inactive') {
                    $q->whereDoesntHave('subscriptions', fn($s) => $s->where('status', 'active')->where('end_at', '>', $now))
                        ->whereDoesntHave('batches', function ($b) use ($now) {
                            $b->where('batch_students.status', 'active')
                                ->where(function ($x) use ($now) {
                                    $x->whereNull('batch_students.ended_at')->orWhere('batch_students.ended_at', '>', $now);
                                });
                        });
                }
                if ($request->enrollment_status === 'expiring_soon') {
                    $limit = $now->copy()->addDays(5);
                    $q->where(function ($inner) use ($now, $limit) {
                        $inner->whereHas('subscriptions', fn($s) => $s->where('status', 'active')->whereBetween('end_at', [$now, $limit]))
                            ->orWhereHas('batches', function ($b) use ($now, $limit) {
                                $b->where('batch_students.status', 'active')
                                    ->whereNotNull('batch_students.ended_at')
                                    ->whereBetween('batch_students.ended_at', [$now, $limit]);
                            });
                    });
                }
            })
            ->when($expiringInDays !== null, function ($q) use ($now, $expiringInDays) {
                $limit = $now->copy()->addDays($expiringInDays);
                $q->where(function ($inner) use ($now, $limit) {
                    $inner->whereHas('subscriptions', fn($s) => $s->where('status', 'active')->whereBetween('end_at', [$now, $limit]))
                        ->orWhereHas('batches', function ($b) use ($now, $limit) {
                            $b->where('batch_students.status', 'active')
                                ->whereNotNull('batch_students.ended_at')
                                ->whereBetween('batch_students.ended_at', [$now, $limit]);
                        });
                });
            })
            ->when($request->subscription_status, fn($q) => $q->whereHas('subscriptions', fn($s) => $s->where('status', $request->subscription_status)))
            ->when($request->payment_status, fn($q) => $q->whereHas('payments', fn($p) => $p->where('status', $request->payment_status)))
            ->when($request->gateway, fn($q) => $q->whereHas('payments', fn($p) => $p->where('gateway', $request->gateway)))
            ->when($request->paid_min || $request->paid_max, function ($q) use ($request) {
                $q->whereHas('payments', function ($p) use ($request) {
                    if ($request->paid_min) {
                        $p->havingRaw('SUM(amount) >= ?', [$request->paid_min]);
                    }
                    if ($request->paid_max) {
                        $p->havingRaw('SUM(amount) <= ?', [$request->paid_max]);
                    }
                });
            })
            ->when($request->trashed === 'only', fn($q) => $q->onlyTrashed())
            ->when($request->trashed === 'with', fn($q) => $q->withTrashed())
            ->when($request->sort_registered === 'oldest', fn($q) => $q->orderBy('created_at'))
            ->when($request->sort_registered === 'latest' || !$request->sort_registered, fn($q) => $q->orderByDesc('created_at'))
            ->paginate(config('app.paginate'))
            ->through(function ($student) {
                $now = now();
                $student->dob_date_formatted = $student->dob ? Carbon::parse($student->dob)->format('d M Y') : null;
                $student->registered_at_formatted = $student->created_at ? Carbon::parse($student->created_at)->format('d M Y') : null;

                $batchCodes = $student->batches->pluck('batch_code')->filter()->values();
                $batchIds = $student->batches->pluck('id')->filter()->map(fn($id) => (string) $id)->values();

                $activeBatches = $student->batches->filter(function ($batch) {
                    $status = $batch->pivot?->status;
                    $statusValue = is_object($status) && property_exists($status, 'value') ? $status->value : (string) $status;
                    $endedAt = $batch->pivot?->ended_at;
                    return $statusValue === 'active' && (is_null($endedAt) || $endedAt->isFuture());
                });

                $expiredBatches = $student->batches->filter(function ($batch) {
                    $endedAt = $batch->pivot?->ended_at;
                    return !is_null($endedAt) && $endedAt->isPast();
                });

                $nearestBatchExpiry = $activeBatches->pluck('pivot.ended_at')->filter()->sort()->first();

                $activeSubscriptions = $student->subscriptions->filter(function ($sub) use ($now) {
                    $status = $sub->status;
                    $statusValue = is_object($status) && property_exists($status, 'value') ? $status->value : (string) $status;
                    return $statusValue === 'active' && $sub->end_at && $sub->end_at->isFuture();
                });

                $nearestSubExpiry = $activeSubscriptions->pluck('end_at')->filter()->sort()->first();
                $nearestExpiryAny = collect([$nearestBatchExpiry, $nearestSubExpiry])->filter()->sort()->first();

                $subjectNames = collect()
                    ->merge($student->batches->pluck('subject.name')->filter())
                    ->merge($student->subscriptions->flatMap(fn($s) => $s->plan?->subjects?->pluck('name') ?? collect())->filter())
                    ->unique()
                    ->values();

                $planTitles = collect()
                    ->merge($student->batches->pluck('plan.title')->filter())
                    ->merge($student->subscriptions->pluck('plan.title')->filter())
                    ->unique()
                    ->values();

                $enrollmentStatus = 'inactive';
                if ($nearestExpiryAny && $nearestExpiryAny->isFuture()) {
                    $enrollmentStatus = $nearestExpiryAny->lte($now->copy()->addDays(5)) ? 'expiring_soon' : 'active';
                } elseif ($activeBatches->count() > 0 || $activeSubscriptions->count() > 0) {
                    $enrollmentStatus = 'active';
                }

                $student->batch_codes_csv = $batchCodes->isNotEmpty() ? $batchCodes->implode(', ') : null;
                $student->batch_ids_csv = $batchIds->isNotEmpty() ? $batchIds->implode(', ') : null;
                $student->subjects_csv = $subjectNames->isNotEmpty() ? $subjectNames->implode(', ') : null;
                $student->plans_csv = $planTitles->isNotEmpty() ? $planTitles->implode(', ') : null;
                $student->active_batches_count = $activeBatches->count();
                $student->expired_batches_count = $expiredBatches->count();
                $student->nearest_expiry_formatted = $nearestExpiryAny ? $nearestExpiryAny->format('d M Y') : null;
                $student->nearest_expiry_iso = $nearestExpiryAny ? $nearestExpiryAny->toDateString() : null;
                $student->expires_in_days = $nearestExpiryAny ? $now->diffInDays($nearestExpiryAny, false) : null;
                $student->enrollment_status = $enrollmentStatus;
                $student->payments_link = route('admin.payments.index', ['student_id' => $student->id]);

                return $student;
            })
            ->withQueryString();

        $classes = Clazz::select('id', 'name')->get();
        $boards = Board::select('id', 'name')->get();
        $plans = Plan::select('id', 'title')->get();
        $subjects = Subject::select('id', 'name')->get();

        return Inertia::render('Admin/Students/index', [
            'students' => $students,
            'classes' => $classes,
            'boards' => $boards,
            'plans' => $plans,
            'subjects' => $subjects,
            'filters' => $request->all(),
        ]);
    }

    /**
     * Show the form for creating a new student.
     */
    public function create()
    {
        $classes = Clazz::select('id', 'name')->orderBy('ordinal')->get();

        return Inertia::render('Admin/Students/create', [
            'classes' => $classes,
            'statuses' => StudentStatus::cases(),
        ]);
    }

    /**
     * Store a newly created student (and linked user).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'phone'     => 'nullable|string|max:20|unique:users,phone',
            'class_id'  => 'required|exists:classes,id',
            'school'    => 'nullable|string|max:255',
            'city'      => 'nullable|string|max:255',
            'state'     => 'nullable|string|max:255',
            'dob'       => 'nullable|date',
            'status'    => 'required|in:active,inactive,blocked',
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        DB::transaction(function () use ($validated, $request) {

            // 🔐 Generate temporary password
            $plainPassword = Str::random(8);

            // 🖼 Upload image (if provided)
            $profileImagePath = null;

            if ($request->hasFile('profile_image')) {
                $profileImagePath = $request
                    ->file('profile_image')
                    ->store('student/profile-images', 'public');

                Image::load(storage_path("app/public/{$profileImagePath}"))
                    // ->crop(300, 300)
                    ->optimize()
                    ->save();
            }
            // Create user
            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'phone'    => $validated['phone'] ?? null,
                'role'     => 'student',
                'password' => bcrypt($plainPassword),
                'profile_image' => $profileImagePath,
            ]);
            $studentRole = Role::where('name', 'student')
                ->where('guard_name', 'web')
                ->firstOrFail();
            $user->assignRole($studentRole);

            // Create student profile
            Student::create([
                'user_id'     => $user->id,
                'student_uid' => 'STU-' . strtoupper(uniqid()),
                'class_id'    => $validated['class_id'],
                'school'      => $validated['school'] ?? null,
                'city'        => $validated['city'] ?? null,
                'state'       => $validated['state'] ?? null,
                'dob'         => $validated['dob'] ?? null,
                'status'      => $validated['status'],
            ]);
            // 📧 Send welcome mail (queued)
            Mail::to($user->email)
                ->queue(new UserRegisteredMail($user, $plainPassword));
        });

        return redirect()->route('admin.students.index')->with('success', 'Student added successfully');
    }

    /**
     * Show the form for editing the specified student.
     */
    public function edit(Student $student)
    {
        $student->load('user:id,name,email,profile_image', 'clazz:id,name');
        $classes = Clazz::select('id', 'name')->get();
        $student->dob_date_local = $student->getRawOriginal('dob');
        return Inertia::render('Admin/Students/edit', [
            'student' => $student,
            'classes' => $classes,
            'statuses' => StudentStatus::cases(),
        ]);
    }

    /**
     * Update the specified student and linked user.
     */
    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => "required|email|unique:users,email,{$student->user_id}",
            'phone'    => "nullable|string|max:20|unique:users,phone,{$student->user_id}",
            'class_id' => 'required|exists:classes,id',   // ⭐ FIXED
            'school'   => 'nullable|string|max:255',
            'city'     => 'nullable|string|max:255',
            'state'    => 'nullable|string|max:255',
            'dob'      => 'nullable|date',
            'status'   => 'required|in:active,inactive,blocked',  // ⭐ FIXED
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        DB::transaction(function () use ($student, $validated, $request) {
            $user = $student->user;

            // 🖼 Handle profile image update
            if ($request->hasFile('profile_image')) {

                // ❌ Delete old image
                if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
                    Storage::disk('public')->delete($user->profile_image);
                }

                // ✅ Store new image
                $path = $request->file('profile_image')
                    ->store('student/profile-images', 'public');

                Image::load(storage_path("app/public/{$path}"))
                    // ->crop(300, 300)
                    ->optimize()
                    ->save();

                // Save path
                $user->profile_image = $path;
            }

            // Update user
            $student->user->update([
                'name'  => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
            ]);

            // Update student
            $student->update([
                'class_id' => $validated['class_id'],
                'school'   => $validated['school'] ?? null,
                'city'     => $validated['city'] ?? null,
                'state'    => $validated['state'] ?? null,
                'dob'      => $validated['dob'] ?? null,
                'status'   => $validated['status'] ?? 0,  // now matches enum
            ]);
        });
        return redirect()->route('admin.students.index')->with('success', 'Student updated successfully');
    }

    /**
     * Remove the specified student and their linked user.
     */
    public function destroy(Student $student)
    {
        $user = $student->user;
        if (!$user) {
            return back()->with('error', 'User not found.');
        }
        DB::transaction(function () use ($student) {
            $student->delete();
            $student->user()->delete();
        });
        // 2️ Send Notification
        app(NotificationService::class)->send(
            $user,
            title: "Account Restricted",
            message: "Your account has been temporarily restricted due to security reasons.",
            type: NotificationType::SYSTEM,
            emailSubject: "Your Account Has Been Restricted",
            emailMessage: "Your account has been temporarily restricted due to security reasons. Please contact support for assistance.",
            sendEmail: true,
            payload: [
                'action_text' => 'Contact Support',
                'action_url'  => '/support',
                'priority'    => 'high',
                'icon'        => 'ban',
                'popup'       => true   // 🔥 For frontend popup
            ]
        );

        return back()->with('success', 'Student deleted successfully');
    }


    // restore soft-deleted record
    public function restore($id)
    {
        $student = Student::withTrashed()
            ->with(['user' => fn($q) => $q->withTrashed()])
            ->findOrFail($id);
        $user = $student->user;
        if (!$user) {
            return back()->with('error', 'User not found.');
        }
        DB::transaction(function () use ($student) {

            // 1️⃣ Restore student
            $student->restore();

            // 2️⃣ Restore related user if deleted
            if ($student->user && $student->user->trashed()) {
                $student->user->restore();
            }
        });


        // 3️⃣ Send Account Restored Notification
        app(NotificationService::class)->send(
            $user,
            title: "Account Restored",
            message: "Your account has been restored successfully. You can now continue using the platform.",
            type: NotificationType::SYSTEM,
            emailSubject: "Your Account Has Been Restored",
            emailMessage: "Your account has been restored successfully. You may now log in and continue your learning.",
            sendEmail: true,
            payload: [
                'action_text' => 'Go to Dashboard',
                'action_url'  => '/student/dashboard',
                'priority'    => 'medium',
                'icon'        => 'refresh',
                'popup'       => true
            ]
        );

        return back()->with('success', 'Student restored successfully');
    }
}
