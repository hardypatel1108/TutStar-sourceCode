<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BatchStatus;
use App\Enums\ClassSessionStatus;
use App\Enums\DoubtStatus;
use App\Http\Controllers\Controller;
use App\Models\Clazz;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Spatie\Image\Image;
use Spatie\Permission\Models\Role;
use App\Mail\TeacherRegisteredMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class TeacherController extends Controller
{
    /**
     * Display a listing of teachers.
     */
    public function index(Request $request)
    {
        $teachers = Teacher::query()
            ->with([
                'user:id,name,email,role,profile_image',
                'batches:id,teacher_id,batch_code,status,class_id,subject_id',
                'classSessions:id,teacher_id,batch_id,subject_id,class_date,status',
                'homeworks:id,teacher_id,classes_session_id,title,due_date',
                // 'batches:id,teacher_id,batch_code',
                'doubts:id,teacher_id,classes_session_id,student_id,status'
            ])

            // Filter by teacher name/email search
            ->when(
                $request->search,
                fn($q) =>
                $q->whereHas(
                    'user',
                    fn($u) =>
                    $u->where('name', 'like', "%{$request->search}%")
                        ->orWhere('email', 'like', "%{$request->search}%")
                )
            )

            // Filter by batch status
            ->when(
                $request->batch_status,
                fn($q) =>
                $q->whereHas(
                    'batches',
                    fn($b) =>
                    $b->where('status', $request->batch_status)
                )
            )

            // Filter by class (batches linked to specific class)
            ->when(
                $request->class,
                fn($q) =>
                $q->whereHas(
                    'batches',
                    fn($b) =>
                    $b->where('class_id', $request->class)
                )
            )

            // Filter by subject (batches or sessions)
            ->when(
                $request->subject,
                fn($q) =>
                $q->whereHas(
                    'batches',
                    fn($b) =>
                    $b->where('subject_id', $request->subject)
                )
            )

            // Filter by session status
            ->when(
                $request->session_status,
                fn($q) =>
                $q->whereHas(
                    'classSessions',
                    fn($s) =>
                    $s->where('status', $request->session_status)
                )
            )

            // Filter by upcoming sessions date range
            ->when($request->session_from && $request->session_to, function ($q) use ($request) {
                $q->whereHas('classSessions', function ($s) use ($request) {
                    $s->whereBetween('class_date', [$request->session_from, $request->session_to]);
                });
            })

            // Filter by homework due date
            ->when($request->homework_due_from && $request->homework_due_to, function ($q) use ($request) {
                $q->whereHas('homeworks', function ($h) use ($request) {
                    $h->whereBetween('due_date', [$request->homework_due_from, $request->homework_due_to]);
                });
            })


            // Filter by doubt status
            ->when(
                $request->doubt_status,
                fn($q) =>
                $q->whereHas(
                    'doubts',
                    fn($d) =>
                    $d->where('status', $request->doubt_status)
                )
            )

            ->orderByDesc('id')
            ->paginate(config('app.paginate'))
            ->withQueryString();

        // Filters for dropdowns
        $classes = Clazz::select('id', 'name')->get();
        $batchStatuses = array_column(BatchStatus::cases(), 'value');
        $sessionStatuses = array_column(ClassSessionStatus::cases(), 'value');
        $doubtStatuses = array_column(DoubtStatus::cases(), 'value');

        return Inertia::render('Admin/Teachers/index', [
            'teachers' => $teachers,
            'classes' => $classes,
            'batchStatuses' => $batchStatuses,
            'sessionStatuses' => $sessionStatuses,
            'doubtStatuses' => $doubtStatuses,
            'filters' => $request->only([
                'search',
                'class',
                'batch_status',
                'subject',
                'session_status',
                'session_from',
                'session_to',
                'homework_due_from',
                'homework_due_to',
                'doubt_status'
            ]),
        ]);
    }


    /**
     * Show the form for creating a new teacher.
     */
    public function create()
    {
        return Inertia::render('Admin/Teachers/create', [
            'classes' => Clazz::with('subjects:id,class_id,name')->get(['id', 'name']),
        ]);
    }
    /**
     * Store a newly created teacher and its user record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',

            'bio' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'contact_email' => 'nullable|email',
            'contact_mobile' => 'nullable|string|max:20',

            'salary' => 'nullable|numeric|min:0',
            'experience_years' => 'nullable|integer|min:0',

            'languages' => 'nullable|array',
            'languages.*' => 'string|max:50',

            // ✅ validate structure ONLY
            'comfortable_timings' => 'nullable|array',
            'comfortable_timings.*.day' => 'required|string',
            'comfortable_timings.*.from' => 'required|string',
            'comfortable_timings.*.to' => 'required|string',

            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'teaching_experiences' => 'required|array|min:1',
            'teaching_experiences.*.class_id' => 'required|exists:classes,id',
            'teaching_experiences.*.subject_id' => 'required|exists:subjects,id',
            'teaching_experiences.*.experience_years' => 'nullable|integer|min:0',
            'teaching_experiences.*.description' => 'nullable|string',
        ]);
        DB::transaction(function () use ($validated, $request) {
            $normalizedTimings = [];

            if (!empty($validated['comfortable_timings'])) {
                $normalizedTimings = collect($validated['comfortable_timings'])
                    ->filter(fn($row) => !empty($row['day']) && !empty($row['from']) && !empty($row['to']))
                    ->groupBy('day')
                    ->map(
                        fn($rows) =>
                        $rows->map(fn($r) => "{$r['from']}-{$r['to']}")->values()
                    )
                    ->toArray();
            }

            $normalizedLanguages = collect($validated['languages'] ?? [])
                ->map(fn($language) => trim((string) $language))
                ->filter(fn($language) => $language !== '')
                ->values()
                ->all();

            $plainPassword = Str::random(8);

            // 🖼 Profile image
            $profileImagePath = null;
            if ($request->hasFile('profile_image')) {
                $profileImagePath = $request
                    ->file('profile_image')
                    ->store('teacher/profile-images', 'public');

                Image::load(storage_path("app/public/{$profileImagePath}"))
                    // ->crop(300, 300)
                    ->optimize()
                    ->save();
            }

            // 1️⃣ User
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => 'teacher',
                'password' => bcrypt($plainPassword),
                'profile_image' => $profileImagePath,
            ]);

            $user->assignRole(
                Role::where('name', 'teacher')->where('guard_name', 'teacher')->firstOrFail()
            );

            // 2️⃣ Teacher profile
            $teacher = Teacher::create([
                'user_id' => $user->id,
                'bio' => $validated['bio'] ?? null,
                'city' => $validated['city'] ?? null,
                'state' => $validated['state'] ?? null,
                'contact_email' => $validated['contact_email'] ?? $validated['email'],
                'contact_mobile' => $validated['contact_mobile'] ?? null,
                'salary' => $validated['salary'] ?? null,
                'languages' => $normalizedLanguages,
                'comfortable_timings' => $normalizedTimings ?? [],
                'experience_years' => $validated['experience_years'] ?? null,
            ]);

            // 3️⃣ Teaching experiences (MULTIPLE)
            // foreach ($validated['teaching_experiences'] as $exp) {
            //     $teacher->teachingExperiences()->create([
            //         'class_id' => $exp['class_id'],
            //         'subject_id' => $exp['subject_id'],
            //         'experience_years' => $exp['experience_years'] ?? 0,
            //     ]);
            // }
            foreach ($validated['teaching_experiences'] as $exp) {
                $teacher->teachingExperiences()->create($exp);
            }

            Mail::to($user->email)
                ->queue(new TeacherRegisteredMail($user, $plainPassword));
        });

        return redirect()->route('admin.teachers.index')->with('success', 'Teacher added successfully');
    }

    /**
     * Show the form for editing a teacher.
     */
    public function edit(Teacher $teacher)
    {
        $teacher->load([
            'user:id,name,email,profile_image',
            'teachingExperiences:id,teacher_id,class_id,subject_id,experience_years,description',
        ]);

        return Inertia::render('Admin/Teachers/edit', [
            'teacher' => $teacher,
            'classes' => Clazz::with('subjects:id,class_id,name')->get(['id', 'name']),
        ]);
        //  $teacher->load('user');
        //     return Inertia::render('Admin/Teachers/Edit', [
        //         'teacher' => $teacher,
        //     ]);
    }

    /**
     * Update the specified teacher.
     */
    public function update(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => "required|email|unique:users,email,{$teacher->user_id}",
            'bio' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'contact_email' => 'nullable|email',
            'contact_mobile' => 'nullable|string|max:20',
            'salary' => 'nullable|numeric|min:0',
            'experience_years' => 'nullable|integer|min:0',
            'languages' => 'nullable|array',
            'languages.*' => 'string|max:50',
            'comfortable_timings' => 'nullable|array',
            'comfortable_timings.*.day' => 'required|string',
            'comfortable_timings.*.from' => 'required|string',
            'comfortable_timings.*.to' => 'required|string',
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'teaching_experiences' => 'required|array|min:1',
            'teaching_experiences.*.class_id' => 'required|exists:classes,id',
            'teaching_experiences.*.subject_id' => 'required|exists:subjects,id',
            'teaching_experiences.*.experience_years' => 'nullable|integer|min:0',
            'teaching_experiences.*.description' => 'nullable|string',
        ]);

        DB::transaction(function () use ($teacher, $validated, $request) {
            $user = $teacher->user;
            $normalizedTimings = [];

            if (!empty($validated['comfortable_timings'])) {
                $normalizedTimings = collect($validated['comfortable_timings'])
                    ->filter(fn($row) => !empty($row['day']) && !empty($row['from']) && !empty($row['to']))
                    ->groupBy('day')
                    ->map(fn($rows) => $rows->map(fn($r) => "{$r['from']}-{$r['to']}")->values())
                    ->toArray();
            }

            $normalizedLanguages = collect($validated['languages'] ?? [])
                ->map(fn($language) => trim((string) $language))
                ->filter(fn($language) => $language !== '')
                ->values()
                ->all();

            // 🖼 Handle profile image update
            if ($request->hasFile('profile_image')) {

                // ❌ Delete old image
                if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
                    Storage::disk('public')->delete($user->profile_image);
                }

                // ✅ Store new image
                $path = $request->file('profile_image')
                    ->store('teacher/profile-images', 'public');

                Image::load(storage_path("app/public/{$path}"))
                    // ->crop(300, 300)
                    ->optimize()
                    ->save();

                // Save path
                $user->profile_image = $path;
            }


            $teacher->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            $teacher->update([
                'bio' => $validated['bio'] ?? null,
                'city' => $validated['city'] ?? null,
                'state' => $validated['state'] ?? null,
                'contact_email' => $validated['contact_email'] ?? $validated['email'],
                'contact_mobile' => $validated['contact_mobile'] ?? null,
                'salary' => $validated['salary'] ?? null,
                'languages' => $normalizedLanguages,
                'comfortable_timings' => $normalizedTimings ?? [],
                'experience_years' => $validated['experience_years'] ?? null,
            ]);

            $teacher->teachingExperiences()->delete();
            foreach ($validated['teaching_experiences'] as $exp) {
                $teacher->teachingExperiences()->create($exp);
            }
        });

        return redirect()->route('admin.teachers.index')->with('success', 'Teacher updated successfully');
    }

    /**
     * Remove the specified teacher.
     */
    public function destroy(Teacher $teacher)
    {
        DB::transaction(function () use ($teacher) {
            $teacher->delete();
            $teacher->user()->delete(); // soft delete user as well
        });

        return back()->with('success', 'Teacher deleted successfully');
    }
}
