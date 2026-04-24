<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Enums\NotificationType;
use App\Models\Batch;
use App\Models\Board;
use App\Models\Homework;
use App\Models\ClassSession;
use App\Models\Clazz;
use App\Models\Subject;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Services\NotificationService;

class HomeworkController extends Controller
{
    /**
     * Display a listing of the teacher's homework.
     */
    public function index(Request $request)
    {
        // Get authenticated user and the teacher profile
        $authUser = Auth::guard('teacher')->user();
        $teacher = $authUser?->teacher; // returns Teacher model or null

        if (! $teacher) {
            // no teacher profile — return empty
            return Inertia::render('Teacher/Homeworks/index', [
                'homeworks' => null,
                'filters' => $request->all(),
                'boards' => [],
                'classes' => [],
                'subjects' => [],
                'batches' => [],
                'csessions' => [],
            ]);
        }

        // Base query: teacher-specific homeworks
        $query = Homework::query()
            ->where('teacher_id', $teacher->id)
            ->with([
                // eager load nested relations used in listing
                'session:id,batch_id,subject_id,topic,class_date',
                'session.batch:id,batch_code,class_id,subject_id',
                'session.batch.clazz:id,board_id,name',
                'session.batch.clazz.board:id,name',
                'session.subject:id,name',
            ]);

        // Search: title, description, session.topic, batch.batch_code
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('session', function ($s) use ($search) {
                        $s->where('topic', 'like', "%{$search}%")
                            ->orWhereHas('batch', fn($b) => $b->where('batch_code', 'like', "%{$search}%"));
                    });
            });
        }

        // Board filter (via session -> batch -> clazz -> board_id)
        if ($request->filled('board')) {
            $boardId = $request->board;
            $query->whereHas('session.batch.clazz', fn($c) => $c->where('board_id', $boardId));
        }

        // Class filter (via batch.class_id)
        if ($request->filled('class')) {
            $classId = $request->class;
            $query->whereHas('session.batch', fn($b) => $b->where('class_id', $classId));
        }

        // Subject filter (via session.subject_id)
        if ($request->filled('subject')) {
            $query->whereHas('session', fn($s) => $s->where('subject_id', $request->subject));
        }

        // Batch filter (via session.batch_id)
        if ($request->filled('batch')) {
            $query->whereHas('session', fn($s) => $s->where('batch_id', $request->batch));
        }

        // Session filter (direct)
        if ($request->filled('session')) {
            $query->where('classes_session_id', $request->csession);
        }

        // Due date range
        if ($request->filled('date_from')) {
            $query->whereDate('due_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('due_date', '<=', $request->date_to);
        }

        // Ordering & paginate
        $homeworks = $query->orderByDesc('id')->paginate(config('app.paginate'))->through(function ($hw) {
            $hw->due_date_formatted = Carbon::parse($hw->due_date)
                ->format('d M Y, h:i a');

            $hw->minutesDiff = $hw->created_at->diffInMinutes(now());
            $hw->can_edit =  $hw->minutesDiff <= 30;
            $hw->edit_block_reason = $hw->can_edit
                ? null
                : 'Editing is allowed only within 30 minutes of creation.';
            return $hw;
        })->withQueryString();

        // Dropdowns derived from teacher's scope (user-specific)
        $boards = Board::whereHas('classes.batches', fn($q) => $q->where('teacher_id', $teacher->id))
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $classes = Clazz::whereHas('batches', fn($q) => $q->where('teacher_id', $teacher->id))
            ->select('id', 'name', 'board_id')
            ->orderBy('name')
            ->get();

        $subjects = Subject::whereHas('classSessions', fn($q) => $q->where('teacher_id', $teacher->id))
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $batches = Batch::where('teacher_id', $teacher->id)
            ->select('id', 'batch_code', 'class_id')
            ->orderBy('batch_code')
            ->get();

        $sessions = ClassSession::where('teacher_id', $teacher->id)
            ->select('id', 'topic', 'batch_id', 'class_date')
            ->orderBy('class_date', 'desc')
            ->get();

        return Inertia::render('Teacher/Homeworks/index', [
            'homeworks' => $homeworks,
            'filters' => $request->only('search', 'board', 'class', 'subject', 'batch', 'session', 'date_from', 'date_to'),
            'boards' => $boards,
            'classes' => $classes,
            'subjects' => $subjects,
            'batches' => $batches,
            'csessions' => $sessions,
            'teacher' => $teacher->load('user:id,name'),
        ]);
    }

    /**
     * Show the form for creating a new homework.
     */
    public function create()
    {
        $authUser = Auth::guard('teacher')->user();
        $teacherId = $authUser?->teacher->id;
        $now = now();

        $sessions = ClassSession::with(['batch', 'subject', 'teacher'])
            ->where('teacher_id', $teacherId)
            ->whereBetween('class_date', [
                $now->copy()->subDays(7),
                $now,
            ])
            ->whereDoesntHave('homeworks')

            ->whereDoesntHave('batch.sessions', function ($q) use ($now) {
                $q->where('class_date', '>', $now)
                    ->where('class_date', '<=', $now->copy()->addMinutes(120));
            })

            ->orderBy('batch_id')
            ->orderByDesc('class_date')
            ->get([
                'id',
                'topic',
                'class_date',
                'batch_id',
                'subject_id',
            ])
            ->unique('batch_id')
            ->values()

            ->each(function ($session) {
                $session->class_date_formatted =
                    $session->class_date->format('d M Y, h:i a');
            });
        return Inertia::render('Teacher/Homeworks/create', [
            'sessions' => $sessions,
            'blocked' => false,
        ]);
    }

    /**
     * Store a newly created homework in storage.
     */
    public function store(Request $request)
    {
        $authUser = Auth::guard('teacher')->user();
        $teacherId = $authUser?->teacher->id;

        $validated = $request->validate([
            'classes_session_id' => 'required|exists:classes_sessions,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date|after_or_equal:today',
            'attachment' => 'nullable|file|max:5120',
        ]);

        /** -----------------------------
         * 1️⃣ Load selected session
         * ----------------------------*/
        $session = ClassSession::where('id', $validated['classes_session_id'])
            ->where('teacher_id', $teacherId)
            ->firstOrFail();

        /** -----------------------------
         * 2️⃣ Ensure class is completed
         * ----------------------------*/
        if ($session->class_date->isFuture()) {
            throw ValidationException::withMessages([
                'classes_session_id' =>
                'Homework can be added only after class completion.',
            ]);
            // abort(403, 'Homework can be added only after class completion.');
        }

        /** -----------------------------
         * 3️⃣ Only one homework per session
         * ----------------------------*/
        if ($session->homeworks()->exists()) {
            throw ValidationException::withMessages([
                'classes_session_id' =>
                'Homework already exists for this class session.',
            ]);
            // abort(403, 'Homework already exists for this class session.');
        }

        /** -----------------------------
         * 4️⃣ Check next class AFTER this session
         *     (in upcoming 2-hour rule — PER SESSION)
         * ----------------------------*/
        $now = now();
        $nextClass = ClassSession::where('teacher_id', $teacherId)
            ->where('batch_id', $session->batch_id)
            ->where('class_date', '>', $now)
            ->orderBy('class_date')
            ->first();

        if ($nextClass) {
            $hoursDiff = $now->diffInMinutes(
                $nextClass->class_date,
                false
            );
            if ($hoursDiff <= 120) {
                throw ValidationException::withMessages([
                    'classes_session_id' =>
                    'You cannot add homework because another class for this batch is scheduled within 2 hours.',
                ]);
                // abort(
                //     403,
                //     'You cannot add homework because another class for this batch is scheduled within 2 hours.'
                // );
            }
        }

        /** -----------------------------
         * 5️⃣ Save homework
         * ----------------------------*/
        $validated['teacher_id'] = $teacherId;

        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')
                ->store('homeworks', 'public');
        }

        $homework = Homework::create($validated);

        $activeStudents = $session->batch?->students()
            ->wherePivot('status', 'active')
            ->where(function ($query) {
                $query->whereNull('batch_students.ended_at')
                    ->orWhere('batch_students.ended_at', '>', now());
            })
            ->with('user:id,name,email')
            ->get() ?? collect();

        foreach ($activeStudents as $student) {
            if (! $student->user) {
                continue;
            }

            app(NotificationService::class)->send(
                $student->user,
                title: 'New Homework Posted',
                message: "New homework posted by {$authUser?->name} for '{$session->topic}'.",
                type: NotificationType::HOMEWORK,
                sendEmail: false,
                payload: [
                    'batch_name' => $session->batch?->batch_code,
                    'topic' => $session->topic,
                    'due_date' => $validated['due_date'] ?? null,
                    'action_text' => 'Open Homework',
                    'action_url' => '/home-work',
                    'priority' => 'high',
                ],
                modelType: Homework::class,
                modelId: $homework->id
            );
        }

        return redirect()
            ->route('teacher.homeworks.index')
            ->with('success', 'Homework assigned successfully');
    }
    /**
     * Show the form for editing the specified homework.
     */
    public function edit(Homework $homework)
    {
        $this->authorizeHomework($homework);

        $minutesDiff = $homework->created_at->diffInMinutes(now());
        $canEdit = $minutesDiff <= 30;
        $homework->due_date_local = $homework->getRawOriginal('due_date');
         $homework->load([
        'session:id,topic,class_date',
    ]);

    // Session raw class_date
    if ($homework->session) {
        $homework->session->class_date_local =
            $homework->session->getRawOriginal('class_date');
    }

        return Inertia::render('Teacher/Homeworks/edit', [
            'homework' => $homework->load([
                'session:id,topic,class_date',
            ]),
            'canEdit' => $canEdit,
            'edit_block_reason' => $canEdit
                ? null
                : 'Editing is allowed only within 30 minutes of creation.',
        ]);
    }

    /**
     * Update the specified homework in storage.
     */
    public function update(Request $request, Homework $homework)
    {
        $this->authorizeHomework($homework);

         // ⛔ HARD STOP if edit window expired
    if ($homework->created_at->diffInMinutes(now()) > 30) {
        throw ValidationException::withMessages([
            '_error' => 'Editing is allowed only within 30 minutes of creation.',
        ]);
    }
      $validated = $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'due_date' => 'nullable|date|after_or_equal:today',
        'attachment' => 'nullable|file|max:5120',
    ]);
        // $validated = $request->validate([
        //     'classes_session_id' => 'required|exists:classes_sessions,id',
        //     'title' => 'required|string|max:255',
        //     'description' => 'nullable|string',
        //     'due_date' => 'nullable|date|after_or_equal:today',
        //     'attachment' => 'nullable|file|max:5120',
        // ]);

        if ($request->hasFile('attachment')) {
        if ($homework->attachment) {
            Storage::disk('public')->delete($homework->attachment);
        }

        $validated['attachment'] = $request->file('attachment')
            ->store('homeworks', 'public');
    }

        $homework->update($validated);

         return redirect()
        ->route('teacher.homeworks.index')->with('success', 'Homework updated successfully');
    }

    /**
     * Remove the specified homework from storage.
     */
    public function destroy(Homework $homework)
    {
        $this->authorizeHomework($homework);

        if ($homework->attachment) {
            Storage::disk('public')->delete($homework->attachment);
        }

        $homework->delete();

        return back()->with('success', 'Homework deleted successfully');
    }

    /**
     * Ensure the authenticated teacher owns the homework.
     */
    protected function authorizeHomework(Homework $homework)
    {
        $teacherId = Auth::guard('teacher')->user()?->teacher?->id;
        if (! $teacherId || $homework->teacher_id !== $teacherId) {
            abort(403, 'Unauthorized action.');
        }
    }
}
