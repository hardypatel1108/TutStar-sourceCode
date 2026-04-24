<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ClassSession;
use App\Models\Batch;
use App\Models\Meeting;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use App\Models\MeetingOccurrence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Services\ZoomService;
use App\Services\ZoomService as ServicesZoomService;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;
use App\Services\NotificationService;
use App\Enums\NotificationType;

class ClassSessionController extends Controller
{
    /**
     * Display a listing of class sessions.
     */
    public function index(Request $request)
    {
        $view = $request->input('view', 'upcoming');

        $sessions = ClassSession::query()
            // Toggle view: all sessions vs upcoming sessions only
            ->when($view === 'upcoming', function ($q) {
                $q->whereIn('status', ['scheduled', 'rescheduled'])
                    ->whereBetween('class_date', [
                        now()->startOfDay(),
                        now()->copy()->addDay()->endOfDay(),
                    ]);
            })
            // Filter by status (scheduled, completed, cancelled, rescheduled)
            ->when($request->filled('status') && $request->status !== 'all', function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            // Filter by batch
            ->when($request->filled('batch') && $request->batch !== 'all', function ($q) use ($request) {
                $q->where('batch_id', $request->batch);
            })
            // Filter by subject
            ->when($request->filled('subject') && $request->subject !== 'all', function ($q) use ($request) {
                $q->where('subject_id', $request->subject);
            })
            // Filter by teacher
            ->when($request->filled('teacher') && $request->teacher !== 'all', function ($q) use ($request) {
                $q->where('teacher_id', $request->teacher);
            })
            // Filter by topic (search)
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where('topic', 'like', "%{$request->search}%");
            })
            // Filter by class_date range
            ->when($request->filled('start_date') && $request->filled('end_date'), function ($q) use ($request) {
                $q->whereBetween('class_date', [$request->start_date, $request->end_date]);
            })
            ->with([
                'batch' => function ($q) {
                    $q->select('id', 'class_id', 'students_limit', 'batch_code as name')
                        ->withCount([
                            'students as current_students_count' => function ($studentQuery) {
                                $studentQuery->where('batch_students.status', 'active')
                                    ->where(function ($pivotQuery) {
                                        $pivotQuery->whereNull('batch_students.ended_at')
                                            ->orWhere('batch_students.ended_at', '>', now());
                                    });
                            },
                        ]);
                },
                'batch.clazz:id,name',
                'subject:id,name',
                'teacher.user:id,name',
                'meeting:id,duration,description,start_url,recording_url,meeting_type',
            ])
            ->withCount('homeworks')
            ->when($view === 'upcoming', fn($q) => $q->orderBy('class_date'))
            ->when($view !== 'upcoming', fn($q) => $q->orderByDesc('class_date'))
            ->paginate(config('app.paginate'))
            ->through(function ($session) {
                $startTime = Carbon::parse($session->class_date);
                $durationMinutes = (int) ($session->meeting->duration ?? 0);
                $endTime = (clone $startTime)->addMinutes(max($durationMinutes, 0));
                $now = now();

                $session->class_date_formatted = $startTime
                    ->format('d M Y, h:i a'); // EXACT time, only formatted
                $session->class_time_range = $durationMinutes > 0
                    ? $startTime->format('h:i A') . ' - ' . $endTime->format('h:i A')
                    : $startTime->format('h:i A');
                $session->time_slot = $this->resolveSessionTimeSlot($startTime);
                $session->has_homework = (int) ($session->homeworks_count ?? 0) > 0;
                $session->is_started = $now->greaterThanOrEqualTo($startTime) && $now->lessThan($endTime);
                $session->is_ended = $now->greaterThanOrEqualTo($endTime);
                $session->start_class_url = $session->zoom_start_url ?? $session->meeting?->start_url;
                $session->recording_url = $session->recording_link ?? $session->meeting?->recording_url;
                $session->meeting_type = $session->meeting?->meeting_type;
                return $session;
            })
            ->withQueryString();
        // ---------------------------
        // Dropdown Data
        // ---------------------------
        /** ALL BATCHES */
        $batches = Batch::select('id', 'batch_code as name')->get();

        /** SUBJECTS filtered by selected batch */
        $subjects = Subject::query()
            ->select('subjects.id', 'subjects.name')
            ->when($request->filled('batch') && $request->batch !== 'all', function ($q) use ($request) {
                $q->whereHas('batches', function ($b) use ($request) {
                    $b->where('batches.id', $request->batch);
                });
            })
            ->get();

        /** TEACHERS filtered by selected batch */
        $teachers = Teacher::query()
            ->select('teachers.id', 'teachers.user_id')
            ->with('user:id,name')
            ->when($request->filled('batch') && $request->batch !== 'all', function ($q) use ($request) {
                $q->whereHas('batches', function ($b) use ($request) {
                    $b->where('batches.id', $request->batch);
                });
            })
            ->get();

        return Inertia::render('Admin/ClassSessions/index', [
            'sessions' => $sessions,
            'filters' => array_merge(
                ['view' => $view],
                $request->only(['status', 'batch', 'subject', 'teacher', 'search', 'start_date', 'end_date'])
            ),
            'batches' => $batches,
            'subjects' => $subjects,
            'teachers' => $teachers,
        ]);
    }

    private function resolveSessionTimeSlot(Carbon $startTime): string
    {
        $minutes = ($startTime->hour * 60) + $startTime->minute;

        // Dedicated slot color requested for sessions between 4 PM and 6 PM.
        if ($minutes >= (16 * 60) && $minutes < (18 * 60)) {
            return 'slot_4_6_pm';
        }

        if ($minutes >= (5 * 60) && $minutes < (12 * 60)) {
            return 'morning';
        }

        if ($minutes >= (12 * 60) && $minutes < (16 * 60)) {
            return 'afternoon';
        }

        if ($minutes >= (18 * 60) && $minutes < (21 * 60)) {
            return 'evening';
        }

        return 'night';
    }

    private function ensureTimeSlotMismatchConfirmed(string $classDate, ?string $batchTimeSlot, bool $confirmed): void
    {
        if (!$batchTimeSlot) {
            return;
        }

        $range = $this->resolveBatchTimeSlotRange($batchTimeSlot);
        if (!$range) {
            return;
        }

        $selected = Carbon::parse($classDate);
        $selectedMinutes = ($selected->hour * 60) + $selected->minute;
        $inRange = $this->isMinutesWithinRange($selectedMinutes, $range['from'], $range['to']);

        if (!$inRange && !$confirmed) {
            throw ValidationException::withMessages([
                'confirm_mismatch' => 'Warning: selected class time slot is different from batch time slot. Please confirm to continue.',
            ]);
        }
    }

    private function resolveBatchTimeSlotRange(string $slot): ?array
    {
        $named = [
            'morning' => ['from' => '05:00', 'to' => '12:00'],
            'afternoon' => ['from' => '12:00', 'to' => '16:00'],
            'slot_4_6_pm' => ['from' => '16:00', 'to' => '18:00'],
            'evening' => ['from' => '18:00', 'to' => '21:00'],
            'night' => ['from' => '21:00', 'to' => '05:00'],
        ];

        if (isset($named[$slot])) {
            return $named[$slot];
        }

        if (preg_match('/^(\\d{2}:\\d{2})-(\\d{2}:\\d{2})$/', $slot, $matches) === 1) {
            return ['from' => $matches[1], 'to' => $matches[2]];
        }

        return null;
    }

    private function toMinutes(string $time): ?int
    {
        if (preg_match('/^(\\d{2}):(\\d{2})$/', $time, $matches) !== 1) {
            return null;
        }

        $hour = (int) $matches[1];
        $minute = (int) $matches[2];
        if ($hour < 0 || $hour > 23 || $minute < 0 || $minute > 59) {
            return null;
        }

        return ($hour * 60) + $minute;
    }

    private function isMinutesWithinRange(int $value, string $fromTime, string $toTime): bool
    {
        $from = $this->toMinutes($fromTime);
        $to = $this->toMinutes($toTime);
        if ($from === null || $to === null) {
            return true;
        }

        if ($from === $to) {
            return true;
        }

        if ($from < $to) {
            return $value >= $from && $value < $to;
        }

        // Overnight range (e.g., 21:00-05:00)
        return $value >= $from || $value < $to;
    }

    private function normalizeZoomOccurrenceStart(string $startTime): Carbon
    {
        return Carbon::parse($startTime)->setTimezone(config('app.timezone'));
    }

    private function syncMeetingOccurrence(Meeting $meeting, array $occ, Carbon $occurrenceStart): void
    {
        $occurrenceId = (string) ($occ['occurrence_id'] ?? '');
        if ($occurrenceId === '') {
            return;
        }

        MeetingOccurrence::query()->withTrashed()->updateOrCreate(
            [
                'meeting_id' => $meeting->id,
                'occurrence_id' => $occurrenceId,
            ],
            [
                'start_time' => $occurrenceStart,
                'duration' => (int) ($occ['duration'] ?? $meeting->duration ?? 0),
                'deleted_at' => null,
            ]
        );
    }

    /**
     * Show the form for creating a new session.
     */
    public function create()
    {
        $batches = Batch::select('id', 'batch_code as name')->get();

        return inertia('Admin/ClassSessions/create', [
            'batches'        => $batches,
        ]);
    }
    public function batchData($batchId)
    {
        $batch = Batch::with(['clazz:id,name,board_id', 'clazz.board:id,name', 'subject:id,name', 'teacher.user:id,name',  'students.user:id,name,email',])
            ->withCount([
                'students as current_students_count' => function ($studentQuery) {
                    $studentQuery->where('batch_students.status', 'active')
                        ->where(function ($pivotQuery) {
                            $pivotQuery->whereNull('batch_students.ended_at')
                                ->orWhere('batch_students.ended_at', '>', now());
                        });
                },
            ])
            ->findOrFail($batchId);
        return response()->json([
            'batch' => [
                'id' => $batch->id,
                'name' => $batch->batch_code,
                'time_slot' => $batch->time_slot,
                'students_limit' => $batch->students_limit,
                'current_students_count' => (int) ($batch->current_students_count ?? 0),
            ],
            'board' => [
                'id' => $batch->clazz?->board?->id,
                'name' => $batch->clazz?->board?->name,
            ],
            'class' => [
                'id' => $batch->clazz?->id,
                'name' => $batch->clazz?->name,
            ],
            'subject' => [
                'id' => $batch->subject?->id,
                'name' => $batch->subject?->name,
            ],
            'teacher' => [
                'id' => $batch->teacher?->id,
                'name' => $batch->teacher?->user?->name,
            ],
            'students' => $batch->students->map(function ($student) {
                return [
                    'id'         => $student->id,
                    'user_id'    => $student->user_id,
                    'name'       => optional($student->user)->name,
                    'email'      => optional($student->user)->email,
                    'student_uid' => $student->student_uid,
                ];
            })->values(),
        ]);
    }
    /**
     * Store a newly created session.
     */
    public function store(Request $request, ServicesZoomService $zoom)
    {
        $validated = $request->validate([
            'batch_id'   => 'required|exists:batches,id',
            'subject_id' => 'nullable|exists:subjects,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'topic'      => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration'   => 'required|integer|min:1',
            'meeting_type' => 'required|in:single,recurring',

            'class_date' => 'required|date',

            'recurrence.repeat_interval' => 'required_if:meeting_type,recurring|integer|min:1',
            'recurrence.weekly_days'     => 'required_if:meeting_type,recurring|array',
            'recurrence.end_date_time'   => 'required_if:meeting_type,recurring|date',

            'participant_ids'   => 'array',
            'participant_ids.*' => 'exists:students,id',
            'confirm_mismatch' => 'nullable|boolean',
        ]);

        $batch = Batch::query()
            ->select('id', 'time_slot', 'subject_id', 'teacher_id')
            ->whereKey($validated['batch_id'])
            ->firstOrFail();

        if (!$batch->subject_id || !$batch->teacher_id) {
            throw ValidationException::withMessages([
                'batch_id' => 'Selected batch is missing subject/teacher. Please update the batch first.',
            ]);
        }

        $validated['subject_id'] = (int) $batch->subject_id;
        $validated['teacher_id'] = (int) $batch->teacher_id;

        $batchTimeSlot = $batch->time_slot;
        $this->ensureTimeSlotMismatchConfirmed(
            $validated['class_date'],
            $batchTimeSlot,
            (bool) ($validated['confirm_mismatch'] ?? false)
        );

        DB::beginTransaction();

        try {
            $teacherUser = Teacher::findOrFail($validated['teacher_id'])->user;
            $zoomHostEmail = config('services.zoom.default_user');
            if (!$zoomHostEmail) {
                throw new \RuntimeException('ZOOM_DEFAULT_USER is not configured.');
            }
            // if ($validated['meeting_type'] === 'recurring' && empty($validated['class_date'])) {
            //     $validated['class_date'] = now()->addMinutes(10);
            // }
            /** 1️⃣ Create meeting (LOCAL) */
            $meeting = Meeting::create([
                'created_by'      => auth()->id(),
                'topic'           => $validated['topic'],
                'description'     => $validated['description'] ?? null,
                'duration'        => $validated['duration'],
                'meeting_type'    => $validated['meeting_type'],
                'start_time'      => $validated['class_date'],
                'recurrence'      => $validated['recurrence'] ?? null,
                'zoom_host_email' => $zoomHostEmail,
                'status'          => 'scheduled',
            ]);

            /** 2️⃣ Sync users (teacher + students) */
            $sync = [
                $teacherUser->id => ['role' => 'teacher'],
            ];

            $studentUserIds = Student::whereIn(
                'id',
                $validated['participant_ids'] ?? []
            )->pluck('user_id')->toArray();

            foreach ($studentUserIds as $uid) {
                $sync[$uid] = ['role' => 'student'];
            }

            $meeting->users()->sync($sync);



            /** Resolve emails */
            $hostEmails = [];

            // $participantEmails = Student::whereIn(
            //     'id',
            //     $validated['participant_ids'] ?? []
            // )->pluck('user.email')->toArray();
            $participantEmails = Student::with('user')
                ->whereIn('id', $validated['participant_ids'] ?? [])
                ->get()
                ->pluck('user.email')
                ->filter()
                ->toArray();

            /** Create Zoom meeting WITH INVITES */
            $zoomData = $zoom->createMeeting(
                $meeting,
                $hostEmails,
                $participantEmails
            );

            $auditLog = AuditLog::create([
                'user_id'    => null,
                'action'     => $event ?? 'zoom_create',
                'model_type' => null,
                'model_id'   => null,
                'changes'    => [
                    'zoomData'     => $zoomData,
                    'meeting'    => $meeting,
                    'hostEmails' => $hostEmails,
                    'participantEmails' => $participantEmails,
                ],
            ]);

            $meeting->update([
                'zoom_meeting_id' => $zoomData['id'],
                'zoom_uuid'       => $zoomData['uuid'],
                'join_url'        => $zoomData['join_url'],
                'start_url'       => $zoomData['start_url'],
            ]);

            /** 4️⃣ Create ClassSession(s) */
            $createdSessionsCount = 0;
            if ($meeting->meeting_type === 'single') {
                // ✅ SINGLE MEETING → ONE SESSION
                ClassSession::create([
                    'batch_id'   => $validated['batch_id'],
                    'subject_id' => $validated['subject_id'],
                    'teacher_id' => $validated['teacher_id'],
                    'topic'      => $validated['topic'],
                    'class_date' => $meeting->start_time,
                    'meeting_id' => $meeting->id,
                    'zoom_meeting_id' => $zoomData['id'],
                    'status'     => 'scheduled',
                ]);
                $createdSessionsCount++;
            } else {
                // ✅ RECURRING MEETING → MULTIPLE SESSIONS
                $occurrences = $zoomData['occurrences'] ?? [];
                if (empty($occurrences)) {
                    $zoomMeeting = $zoom->getZoomMeeting($meeting);
                    $occurrences = $zoomMeeting['occurrences'] ?? [];
                }

                if (!empty($occurrences)) {
                    foreach ($occurrences as $occ) {
                        $occurrenceStart = $this->normalizeZoomOccurrenceStart($occ['start_time']);
                        $this->syncMeetingOccurrence($meeting, $occ, $occurrenceStart);

                        ClassSession::create([
                            'batch_id'   => $validated['batch_id'],
                            'subject_id' => $validated['subject_id'],
                            'teacher_id' => $validated['teacher_id'],
                            'topic'      => $validated['topic'],
                            'class_date' => $occurrenceStart,
                            'meeting_id' => $meeting->id,
                            'zoom_meeting_id' => $zoomData['id'],
                            'occurrence_id' => (string) ($occ['occurrence_id'] ?? null),
                            'status'     => 'scheduled',
                        ]);
                        $createdSessionsCount++;
                    }
                } else {
                    // 🔁 Safety fallback
                    ClassSession::create([
                        'batch_id'   => $validated['batch_id'],
                        'subject_id' => $validated['subject_id'],
                        'teacher_id' => $validated['teacher_id'],
                        'topic'      => $validated['topic'],
                        'class_date' => $meeting->start_time,
                        'zoom_meeting_id' => $zoomData['id'],
                        'meeting_id' => $meeting->id,
                        'status'     => 'scheduled',
                    ]);
                    $createdSessionsCount++;
                }
            }

            if ($teacherUser) {
                $sessionAt = Carbon::parse($validated['class_date'])->format('d M Y, h:i A');
                $sessionLabel = $meeting->meeting_type === 'recurring'
                    ? "{$createdSessionsCount} recurring sessions"
                    : 'single session';

                app(NotificationService::class)->send(
                    $teacherUser,
                    title: 'Class Session Scheduled',
                    message: "Admin scheduled {$sessionLabel} for '{$validated['topic']}' starting {$sessionAt}.",
                    type: NotificationType::EVENT,
                    sendEmail: false,
                    payload: [
                        'topic' => $validated['topic'],
                        'session_at' => $sessionAt,
                        'action_text' => 'Open Upcoming Classes',
                        'action_url' => '/teacher/upcoming-classes',
                        'priority' => 'high',
                    ],
                    modelType: ClassSession::class,
                    modelId: null
                );
            }

            DB::commit();

            return redirect()
                ->route('admin.classSessions.index')
                ->with('success', 'Session created successfully', $auditLog);
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            return back()->withErrors(['zoom' => $e->getMessage() ?: 'Failed to create meeting']);
        }
    }


    /**
     * Show the form for editing a session.
     */
    public function edit(ClassSession $classSession)
    {
        $classSession->load([
            'batch:id,batch_code',
            'batch.students.user:id,name,email',
            'teacher.user:id,name,email',
            'subject.board:id,name',
            'subject.clazz:id,name',

            // ✅ CORRECT — these already return User
            'meeting.users:id,name,email',
        ]);
        //  $batch = Batch::with(['clazz:id,name,board_id', 'clazz.board:id,name', 'subject:id,name', 'teacher.user:id,name',  'students.user:id,name,email',])
        // ->findOrFail($batchId);
        $meeting = $classSession->meeting;

        $hosts = $meeting
            ? $meeting->users->where('pivot.role', 'teacher')
            : collect();

        $participants = $meeting
            ? $meeting->users->where('pivot.role', 'student')
            : collect();
        // echo "<pre>";
        // print_r($participants);
        // print_r([
        //     'session' => [
        //         'id'         => $classSession->id,
        //         'topic'      => $classSession->topic,
        //         'class_date' => $classSession->getRawOriginal('class_date'),
        //     ],
        //     'meeting' => [
        //         'id'           => $classSession->meeting->id,
        //         'meeting_type' => $classSession->meeting->meeting_type,
        //         'duration'     => $classSession->meeting->duration,
        //         'recurrence'   => $classSession->meeting->recurrence,
        //         'hosts' => $hosts->map(fn($u) => [
        //             'id'    => $u->id,
        //             'name'  => $u->name,
        //             'email' => $u->email,
        //         ])->values(),
        //         'participants' => $participants->map(fn($u) => [
        //             'id'    => $u->id,
        //             'name'  => $u->name,
        //             'email' => $u->email,
        //         ])->values(),
        //         // 'participants' => $classSession->meeting->participants->map(fn($u) => [
        //         //     'id'    => $u->id,
        //         //     'name'  => $u->name,
        //         //     'email' => $u->email,
        //         // ]),
        //     ],
        //     'students' => $classSession->batch->students->map(function ($student) {
        //         return [
        //             // 'id'         => $student->id,
        //             'id'    => $student->user_id,
        //             'name'       => optional($student->user)->name,
        //             'email'      => optional($student->user)->email,
        //             'student_uid' => $student->student_uid,
        //         ];
        //     })->values(),
        // ]);
        // dd();
        $occurrenceItems = ClassSession::query()
            ->where('meeting_id', $classSession->meeting->id)
            ->whereNotNull('occurrence_id')
            ->orderBy('class_date')
            ->get(['occurrence_id', 'class_date', 'topic'])
            ->map(function (ClassSession $item) use ($classSession) {
                return [
                    'occurrence_id' => (string) $item->occurrence_id,
                    'class_date' => $item->getRawOriginal('class_date'),
                    'topic' => (string) ($item->topic ?: $classSession->meeting->topic),
                ];
            })
            ->values();

        $batchInfo = Batch::query()
            ->select('id', 'batch_code', 'time_slot', 'students_limit')
            ->withCount([
                'students as current_students_count' => function ($studentQuery) {
                    $studentQuery->where('batch_students.status', 'active')
                        ->where(function ($pivotQuery) {
                            $pivotQuery->whereNull('batch_students.ended_at')
                                ->orWhere('batch_students.ended_at', '>', now());
                        });
                },
            ])
            ->find($classSession->batch_id);

        return Inertia::render('Admin/ClassSessions/edit', [
            'session' => [
                'id'         => $classSession->id,
                'topic'      => $classSession->topic,
                'class_date' => $classSession->getRawOriginal('class_date'),
                'occurrence_id' => $classSession->occurrence_id,
            ],
            'batch' => [
                'id' => $batchInfo?->id,
                'name' => $batchInfo?->batch_code,
                'time_slot' => $batchInfo?->time_slot,
                'students_limit' => $batchInfo?->students_limit,
                'current_students_count' => (int) ($batchInfo?->current_students_count ?? 0),
            ],
            'meeting' => [
                'id'           => $classSession->meeting->id,
                'meeting_type' => $classSession->meeting->meeting_type,
                'start_time'   => $classSession->meeting->getRawOriginal('start_time'),
                'duration'     => $classSession->meeting->duration,
                'recurrence'   => $classSession->meeting->recurrence,
                'hosts' => $hosts->map(fn($u) => [
                    'id'    => $u->id,
                    'name'  => $u->name,
                    'email' => $u->email,
                ])->values(),
                'participants' => $participants->map(fn($u) => [
                    'id'    => $u->id,
                    'name'  => $u->name,
                    'email' => $u->email,
                ])->values(),
                // 'participants' => $classSession->meeting->participants->map(fn($u) => [
                //     'id'    => $u->id,
                //     'name'  => $u->name,
                //     'email' => $u->email,
                // ]),
            ],
            // 'students' => Student::with('user:id,name,email')->get()->map(fn($s) => [
            //     'id'    => $s->id,
            //     'name'  => $s->user->name,
            //     'email' => $s->user->email,
            // ]),
            'students' => $classSession->batch->students->map(function ($student) {
                return [
                    // 'id'         => $student->id,
                    'id'    => $student->user_id,
                    'name'       => optional($student->user)->name,
                    'email'      => optional($student->user)->email,
                    'student_uid' => $student->student_uid,
                ];
            })->values(),
            'occurrences' => $occurrenceItems,
        ]);
    }
    public function update(Request $request, ClassSession $classSession, ZoomService $zoom)
    {
        $meeting = $classSession->meeting;
        $teacherUser = Teacher::query()->with('user:id,name,email')->find($classSession->teacher_id)?->user;
        $originalRecurrence = $meeting->recurrence;
        $originalStartTime = $meeting->start_time ? Carbon::parse($meeting->start_time) : null;
        $originalMeetingTopic = (string) $meeting->topic;
        $originalDuration = (int) ($meeting->duration ?? 0);

        $rules = [
            'topic'      => 'required|string|max:255',
            'duration'   => 'required|integer|min:1',
            'topic_scope' => 'nullable|in:series,occurrence,all_occurrences',
            'occurrence_topics' => 'nullable|array',
            'occurrence_topics.*' => 'nullable|string|max:255',

        ];
        $rules['class_date'] = 'required|date';

        // if ($meeting->meeting_type === 'single') {
        //     $rules['class_date'] = 'required|date';
        // }

        if ($meeting->meeting_type === 'recurring') {
            $rules['recurrence.repeat_interval'] = 'required|integer|min:1';
            $rules['recurrence.weekly_days']     = 'required|array|min:1';
            $rules['recurrence.end_date_time']   = 'required|date';
        }

        $validated = $request->validate($rules);
        $topicScope = (string) ($validated['topic_scope'] ?? 'series');

        if ($meeting->meeting_type === 'recurring' && $topicScope === 'occurrence' && !empty($classSession->occurrence_id)) {
            $classSession->update([
                'topic' => $validated['topic'],
            ]);

            return redirect()
                ->route('admin.classSessions.index')
                ->with('success', 'Occurrence topic updated successfully (Zoom series unchanged).');
        }

        $allOccurrenceTopics = null;
        if ($meeting->meeting_type === 'recurring' && $topicScope === 'all_occurrences') {
            $allOccurrenceTopics = collect((array) ($validated['occurrence_topics'] ?? []))
                ->map(fn($topic) => trim((string) $topic))
                ->values()
                ->all();
        }

        $batchTimeSlot = Batch::query()->whereKey($classSession->batch_id)->value('time_slot');
        $this->ensureTimeSlotMismatchConfirmed(
            $validated['class_date'],
            $batchTimeSlot,
            (bool) $request->boolean('confirm_mismatch')
        );

        // DB::beginTransaction();

        // try {
        /** 1️⃣ Update meeting locally */
        $meeting->topic    = $validated['topic'];
        $meeting->duration = $validated['duration'];

        if ($meeting->meeting_type === 'single') {
            $meeting->start_time = $validated['class_date'];

            $classSession->update([
                'topic'      => $validated['topic'],
                'class_date' => $validated['class_date'],
            ]);
        }

        if ($meeting->meeting_type === 'recurring') {
            $meeting->recurrence = $validated['recurrence'];
            // For recurring meetings, treat class_date as series anchor start.
            // The edit form now sends series start time (not clicked occurrence time).
            $meeting->start_time = $validated['class_date'];
        }

        $startTimeChanged = false;
        $recurrenceChanged = false;
        $durationChanged = (int) $validated['duration'] !== $originalDuration;
        if ($meeting->meeting_type === 'recurring') {
            $newStartTime = Carbon::parse($validated['class_date']);
            $startTimeChanged = !$originalStartTime || !$originalStartTime->equalTo($newStartTime);
            $recurrenceChanged = $this->recurrenceChanged($originalRecurrence, $meeting->recurrence);
        }

        /** 2) Update ZOOM */
        $zoomMissing = false;
        try {
            $zoom->updateZoomMeeting($meeting);
        } catch (\RuntimeException $e) {
            if ($this->isZoomMeetingMissingException($e)) {
                $zoomMissing = true;
            } else {
                throw $e;
            }
        }

        if ($zoomMissing && $meeting->meeting_type === 'recurring' && ($startTimeChanged || $recurrenceChanged || $durationChanged)) {
            return back()->withErrors([
                'zoom' => 'Zoom meeting was deleted. Schedule/duration changes require creating a new class session.',
            ]);
        }

        /** 3) Re-generate occurrences when recurring rule OR series start changed */
        if (!$zoomMissing && $meeting->meeting_type === 'recurring' && ($recurrenceChanged || $startTimeChanged)) {
            $zoomData = $zoom->client()
                ->get("/meetings/{$meeting->zoom_meeting_id}")
                ->json();

            $occurrenceIds = [];
            foreach ($zoomData['occurrences'] ?? [] as $occ) {
                $occurrenceId = (string) ($occ['occurrence_id'] ?? '');
                if ($occurrenceId === '') {
                    continue;
                }

                $occurrenceIds[] = $occurrenceId;
                $occurrenceStart = $this->normalizeZoomOccurrenceStart($occ['start_time']);
                $this->syncMeetingOccurrence($meeting, $occ, $occurrenceStart);

                ClassSession::query()->withTrashed()->updateOrCreate([
                    'meeting_id' => $meeting->id,
                    'occurrence_id' => $occurrenceId,
                ], [
                    'batch_id'   => $classSession->batch_id,
                    'subject_id' => $classSession->subject_id,
                    'teacher_id' => $classSession->teacher_id,
                    'topic'      => $meeting->topic,
                    'class_date' => $occurrenceStart,
                    'status'     => 'scheduled',
                    'zoom_meeting_id' => (string) $meeting->zoom_meeting_id,
                    'deleted_at' => null,
                ]);
            }

            if (!empty($occurrenceIds)) {
                ClassSession::query()->withTrashed()
                    ->where('meeting_id', $meeting->id)
                    ->whereIn('occurrence_id', $occurrenceIds)
                    ->restore();

                MeetingOccurrence::query()->withTrashed()
                    ->where('meeting_id', $meeting->id)
                    ->whereIn('occurrence_id', $occurrenceIds)
                    ->restore();

                ClassSession::query()
                    ->where('meeting_id', $meeting->id)
                    ->whereNotNull('occurrence_id')
                    ->whereNotIn('occurrence_id', $occurrenceIds)
                    ->where('class_date', '>', now())
                    ->delete();

                MeetingOccurrence::query()
                    ->where('meeting_id', $meeting->id)
                    ->whereNotIn('occurrence_id', $occurrenceIds)
                    ->where('start_time', '>', now())
                    ->delete();
            }
        }

        if ($meeting->meeting_type === 'recurring') {
            // Preserve custom per-occurrence topics by only updating rows that still
            // carry the previous series topic.
            ClassSession::query()
                ->where('meeting_id', $meeting->id)
                ->where(function ($query) use ($originalMeetingTopic) {
                    $query->whereNull('topic')
                        ->orWhere('topic', $originalMeetingTopic);
                })
                ->update(['topic' => $meeting->topic]);
        }

        if ($meeting->meeting_type === 'recurring' && $topicScope === 'all_occurrences' && is_array($allOccurrenceTopics)) {
            $occurrenceSessions = ClassSession::query()
                ->where('meeting_id', $meeting->id)
                ->whereNotNull('occurrence_id')
                ->orderBy('class_date')
                ->get(['id']);

            foreach ($occurrenceSessions as $index => $occurrenceSession) {
                $topic = trim((string) ($allOccurrenceTopics[$index] ?? $validated['topic']));
                ClassSession::query()
                    ->whereKey($occurrenceSession->id)
                    ->update(['topic' => $topic !== '' ? $topic : $validated['topic']]);
            }
        }

        $meeting->save();
        if ($teacherUser) {
            $sessionAt = Carbon::parse($validated['class_date'])->format('d M Y, h:i A');
            app(NotificationService::class)->send(
                $teacherUser,
                title: 'Class Session Updated',
                message: "Session '{$validated['topic']}' was updated. New start: {$sessionAt}.",
                type: NotificationType::EVENT,
                sendEmail: false,
                payload: [
                    'topic' => $validated['topic'],
                    'session_at' => $sessionAt,
                    'action_text' => 'Open Upcoming Classes',
                    'action_url' => '/teacher/upcoming-classes',
                    'priority' => 'medium',
                ],
                modelType: ClassSession::class,
                modelId: $classSession->id
            );
        }
        // DB::commit();

        return redirect()
            ->route('admin.classSessions.index')
            ->with(
                'success',
                $zoomMissing
                    ? 'Session updated locally. Zoom meeting no longer exists, so Zoom sync was skipped.'
                    : ($meeting->meeting_type === 'recurring' && $topicScope === 'all_occurrences'
                        ? 'Recurring series updated (Zoom/local) and occurrence topics saved.'
                        : 'Session updated successfully')
            );
        // } catch (\Throwable $e) {
        //     DB::rollBack();
        //     report($e);

        //     return back()->withErrors([
        //         'zoom' => 'Zoom update failed',
        //     ]);
        // }
    }

    private function recurrenceChanged($before, $after): bool
    {
        $normalize = function ($value) {
            $recurrence = is_array($value) ? $value : [];
            $days = array_values(array_map('strval', $recurrence['weekly_days'] ?? []));
            sort($days);

            return [
                'repeat_interval' => (string) ($recurrence['repeat_interval'] ?? ''),
                'weekly_days' => $days,
                'end_date_time' => (string) ($recurrence['end_date_time'] ?? ''),
            ];
        };

        return $normalize($before) !== $normalize($after);
    }

    private function isZoomMeetingMissingException(\Throwable $e): bool
    {
        $message = (string) $e->getMessage();

        if (str_contains($message, 'Meeting does not exist')) {
            return true;
        }

        return preg_match('/"code"\\s*:\\s*3001/', $message) === 1;
    }

    // public function update(Request $request, ClassSession $classSession, ZoomService $zoom)
    // {
    //     $meeting = $classSession->meeting;

    //     $rules = [
    //         'topic'            => 'required|string|max:255',
    //         'duration'         => 'required|integer|min:1',
    //         'participant_ids'  => 'array',
    //         'participant_ids.*' => 'exists:users,id',
    //     ];

    //     if ($meeting->meeting_type === 'single') {
    //         $rules['class_date'] = 'required|date';
    //     }

    //     if ($meeting->meeting_type === 'recurring') {
    //         $rules['recurrence.repeat_interval'] = 'required|integer|min:1';
    //         $rules['recurrence.weekly_days']     = 'required|array|min:1';
    //         $rules['recurrence.end_date_time']   = 'required|date';
    //     }

    //     $validated = $request->validate($rules);

    //     DB::beginTransaction();

    //     try {
    //         /** --------------------------------
    //          * 1️⃣ Update MEETING (local)
    //          * --------------------------------*/
    //         $meeting->topic    = $validated['topic'];
    //         $meeting->duration = $validated['duration'];

    //         if ($meeting->meeting_type === 'single') {
    //             $meeting->start_time = $validated['class_date'];

    //             $classSession->update([
    //                 'topic'      => $validated['topic'],
    //                 'class_date' => $validated['class_date'],
    //             ]);
    //         }

    //         if ($meeting->meeting_type === 'recurring') {
    //             $meeting->recurrence = $validated['recurrence'];

    //             // Update ONLY future sessions
    //             ClassSession::where('meeting_id', $meeting->id)
    //                 ->where('class_date', '>', now())
    //                 ->update(['topic' => $validated['topic']]);
    //         }

    //         /** --------------------------------
    //          * 2️⃣ Sync USERS
    //          * --------------------------------*/
    //         $teacherUserId = $meeting->users()
    //             ->wherePivot('role', 'teacher')
    //             ->firstOrFail()
    //             ->id;

    //         $sync = [
    //             $teacherUserId => ['role' => 'teacher'],
    //         ];

    //         $studentUserIds = Student::whereIn(
    //             'id',
    //             $validated['participant_ids'] ?? []
    //         )->pluck('user_id')->toArray();

    //         foreach ($studentUserIds as $uid) {
    //             $sync[$uid] = ['role' => 'student'];
    //         }

    //         $meeting->users()->sync($sync);

    //         /** --------------------------------
    //          * 3️⃣ Resolve EMAILS
    //          * --------------------------------*/
    //         $hostEmails = $meeting->users()
    //             ->wherePivot('role', 'teacher')
    //             ->pluck('email')
    //             ->toArray();

    //         $participantEmails = $meeting->users()
    //             ->wherePivot('role', 'student')
    //             ->pluck('email')
    //             ->toArray();

    //         /** --------------------------------
    //          * 4️⃣ UPDATE ZOOM
    //          * --------------------------------*/
    //         $zoom->updateZoomMeeting(
    //             $meeting,
    //             $hostEmails,
    //             $participantEmails
    //         );

    //         $meeting->save();

    //         DB::commit();

    //         return redirect()
    //             ->route('admin.classSessions.index')
    //             ->with('success', 'Session updated successfully');
    //     } catch (\Throwable $e) {
    //         DB::rollBack();
    //         report($e);

    //         return back()->withErrors([
    //             'zoom' => 'Zoom update failed. No changes were saved.',
    //         ]);
    //     }
    // }
    // public function update(Request $request, ClassSession $classSession, ZoomService $zoom)
    // {
    //     $meeting = $classSession->meeting;

    //     $rules = [
    //         'topic'      => 'required|string|max:255',
    //         'duration'   => 'required|integer|min:1',
    //         'participant_ids'   => 'array',
    //         'participant_ids.*' => 'exists:students,id',
    //     ];

    //     if ($meeting->meeting_type === 'single') {
    //         $rules['class_date'] = 'required|date';
    //     }

    //     if ($meeting->meeting_type === 'recurring') {
    //         $rules['recurrence.repeat_interval'] = 'required|integer|min:1';
    //         $rules['recurrence.weekly_days']     = 'required|array';
    //         $rules['recurrence.end_date_time']   = 'required|date';
    //     }

    //     $validated = $request->validate($rules);

    //     DB::beginTransaction();

    //     try {
    //         /**
    //          * -------------------------------------------------
    //          * 1️⃣ Update MEETING (local)
    //          * -------------------------------------------------
    //          */
    //         $meeting->topic    = $validated['topic'];
    //         $meeting->duration = $validated['duration'];

    //         if ($meeting->meeting_type === 'single') {
    //             $meeting->start_time = $validated['class_date'];

    //             $classSession->update([
    //                 'topic'      => $validated['topic'],
    //                 'class_date' => $validated['class_date'],
    //             ]);
    //         } else {
    //             $meeting->recurrence = $validated['recurrence'];

    //             // Zoom-style: update only future sessions
    //             ClassSession::where('meeting_id', $meeting->id)
    //                 ->where('class_date', '>', now())
    //                 ->update([
    //                     'topic' => $validated['topic'],
    //                 ]);
    //         }

    //         /**
    //          * -------------------------------------------------
    //          * 2️⃣ SYNC USERS (teacher + students)
    //          * -------------------------------------------------
    //          */
    //         $teacherUserId = $meeting->hosts()->firstOrFail()->id;

    //         $sync = [
    //             $teacherUserId => ['role' => 'teacher'],
    //         ];

    //         $studentUserIds = Student::whereIn(
    //             'id',
    //             $validated['participant_ids'] ?? []
    //         )->pluck('user_id')->toArray();

    //         foreach ($studentUserIds as $uid) {
    //             $sync[$uid] = ['role' => 'student'];
    //         }

    //         // 🔥 THIS IS CRITICAL — sync first
    //         $meeting->users()->sync($sync);

    //         /**
    //          * -------------------------------------------------
    //          * 3️⃣ RESOLVE EMAILS FROM SYNCED USERS
    //          * -------------------------------------------------
    //          */
    //         $hostEmails = $meeting->users()
    //             ->wherePivot('role', 'teacher')
    //             ->pluck('email')
    //             ->toArray();

    //         $participantEmails = $meeting->users()
    //             ->wherePivot('role', 'student')
    //             ->pluck('email')
    //             ->toArray();

    //         /**
    //          * -------------------------------------------------
    //          * 4️⃣ UPDATE ZOOM (WITH INVITES)
    //          * -------------------------------------------------
    //          */
    //         $zoom->updateZoomMeeting(
    //             $meeting,
    //             $hostEmails,
    //             $participantEmails
    //         );

    //         $meeting->save();

    //         DB::commit();

    //         return redirect()
    //             ->route('admin.classSessions.index')
    //             ->with('success', 'Session updated successfully');
    //     } catch (\Throwable $e) {
    //         DB::rollBack();
    //         report($e);

    //         return back()->withErrors([
    //             'zoom' => 'Update failed. Zoom meeting was not updated.',
    //         ]);
    //     }
    // }

    // public function storee(Request $request, ZoomService $zoom)
    // {
    //     $validated = $request->validate([
    //         'batch_id'       => 'required|exists:batches,id',
    //         'subject_id'     => 'required|exists:subjects,id',
    //         'teacher_id'     => 'required|exists:teachers,id',
    //         'topic'          => 'required|string|max:255',
    //         'class_date'     => 'required|date',
    //         'duration'       => 'required|integer|min:1',
    //         'status'         => 'required|in:scheduled,completed,cancelled,rescheduled',
    //         'participant_ids'   => 'array',
    //         'participant_ids.*' => 'exists:students,id',
    //     ]);

    //     // try {
    //     //     DB::beginTransaction();
    //     $hostUser = User::where('email', 'rohitchaudhary426@gmail.com')->firstOrFail();

    //     // OPTIONAL: if you also want to force the teacher_id of session to match that user:
    //     $staticTeacher = Teacher::where('user_id', $hostUser->id)->first();
    //     if ($staticTeacher) {
    //         $validated['teacher_id'] = $staticTeacher->id;
    //     }
    //     $teacher = User::findOrFail(
    //         Teacher::find($validated['teacher_id'])->user_id
    //     );
    //     // 1) Create class session
    //     $session = ClassSession::create([
    //         'batch_id'   => $validated['batch_id'],
    //         'subject_id' => $validated['subject_id'],
    //         'teacher_id' => $validated['teacher_id'],
    //         'topic'      => $validated['topic'],
    //         'class_date' => $validated['class_date'],
    //         'status'     => $validated['status'],
    //     ]);


    //     // // 2) Resolve teacher user (host)
    //     // $teacher = User::findOrFail(
    //     //     Teacher::find($validated['teacher_id'])->user_id
    //     // );

    //     // Get selected students and convert student → user IDs
    //     $participantUserIds = Student::whereIn('id', $validated['participant_ids'] ?? [])
    //         ->pluck('user_id')
    //         ->toArray();

    //     // 3) Create Meeting record
    //     $meeting = Meeting::create([
    //         'created_by'      => auth()->id(),
    //         'topic'           => $session->topic,
    //         'description'     => null,
    //         'start_time'      => $session->class_date,
    //         'duration'        => $validated['duration'],
    //         'zoom_host_email' => $teacher->email,
    //         'status'          => 'scheduled',
    //     ]);

    //     // 4) Assign pivot roles
    //     $sync = [
    //         $teacher->id => ['role' => 'teacher'],
    //     ];

    //     foreach ($participantUserIds as $id) {
    //         $sync[$id] = ['role' => 'student'];
    //     }

    //     $meeting->users()->sync($sync);

    //     // 5) Create Zoom meeting
    //     $participantEmails = User::whereIn('id', $participantUserIds)->pluck('email')->toArray();
    //     $zoomMeeting = $zoom->createZoomMeeting($meeting, $teacher->email, [], $participantEmails);

    //     // 6) Update Meeting with Zoom details
    //     $meeting->update([
    //         'zoom_meeting_id' => $zoomMeeting['id']        ?? null,
    //         'zoom_uuid'       => $zoomMeeting['uuid']      ?? null,
    //         'start_url'       => $zoomMeeting['start_url'] ?? null,
    //         'join_url'        => $zoomMeeting['join_url']  ?? null,
    //     ]);

    //     // 7) Link ClassSession → Meeting
    //     $session->update([
    //         'meeting_id'        => $meeting->id,
    //         'zoom_meeting_id'   => $zoomMeeting['id']        ?? null,
    //         'zoom_join_url'     => $zoomMeeting['join_url']  ?? null,
    //         'zoom_start_url'    => $zoomMeeting['start_url'] ?? null,
    //     ]);

    //     // DB::commit();

    //     return redirect()
    //         ->route('admin.classSessions.index')
    //         ->with('success', 'Class session created successfully!');

    //     // } catch (\Throwable $e) {
    //     //     DB::rollBack();
    //     //     report($e);

    //     //     return back()
    //     //         ->withErrors(['zoom' => 'Unable to create Zoom meeting. Try again.'])
    //     //         ->withInput();
    //     // }
    //     // ClassSession::create($validated);

    //     // return redirect()->route('admin.classSessions.index')
    //     //     ->with('success', 'Class session created successfully');
    // }
    // public function editt(ClassSession $classSession)
    // {
    //     $classSession->load([
    //         'batch:id,batch_code',
    //         'teacher.user:id,name,email',
    //         'subject',
    //         'subject.board:id,name',
    //         'subject.clazz:id,name',
    //         'meeting.users:id,name,email',
    //         'meeting.hosts:id,name,email',
    //         'meeting.participants:id,name,email',
    //     ]);
    //     $batches = Batch::select('id', 'batch_code as name')->get();

    //     $subjects = Subject::select('id', 'name')->get();

    //     $teachers = Teacher::with('user:id,name')
    //         ->get(['id', 'user_id'])
    //         ->map(fn($t) => [
    //             'id' => $t->id,
    //             'name' => $t->user->name,
    //         ]);

    //     $statusOptions = [
    //         ['id' => 'scheduled', 'name' => 'Scheduled'],
    //         ['id' => 'completed', 'name' => 'Completed'],
    //         ['id' => 'cancelled', 'name' => 'Cancelled'],
    //         ['id' => 'rescheduled', 'name' => 'Rescheduled'],
    //     ];
    //     /**
    //      * 🔥 DO NOT send Eloquent model directly
    //      * Build a controlled payload
    //      */
    //     $session = [
    //         'id' => $classSession->id,
    //         'batch_id' => $classSession->batch_id,
    //         'subject_id' => $classSession->subject_id,
    //         'teacher_id' => $classSession->teacher_id,
    //         'topic' => $classSession->topic,
    //         'status' => $classSession->status->value,

    //         // ✅ RAW DB VALUE (no timezone conversion)
    //         'class_date_local' => $classSession->getRawOriginal('class_date'),

    //         // Zoom fields stored on session
    //         'zoom_meeting_id' => $classSession->zoom_meeting_id,
    //         'zoom_join_url' => $classSession->zoom_join_url,
    //         'zoom_start_url' => $classSession->zoom_start_url,
    //         'recording_link' => $classSession->recording_link,

    //         'batch' => $classSession->batch ? [
    //             'id' => $classSession->batch->id,
    //             'name' => $classSession->batch->batch_code,
    //         ] : null,
    //         'subject' => $classSession->subject ? [
    //             'id' => $classSession->subject->id,
    //             'name' => $classSession->subject->name,
    //             'board' => $classSession->subject->board->name,
    //             'clazz' => $classSession->subject->clazz->name,
    //         ] : null,
    //         'teacher' => $classSession->teacher ? [
    //             'id' => $classSession->teacher->id,
    //             'name' => $classSession->teacher->user->name,
    //             'email' => $classSession->teacher->user->email,
    //         ] : null,
    //         // 🔗 Related meeting
    //         'meeting' => $classSession->meeting ? [
    //             'id' => $classSession->meeting->id,
    //             'zoom_meeting_id' => $classSession->meeting->zoom_meeting_id,
    //             'zoom_uuid' => $classSession->meeting->zoom_uuid,
    //             'duration' => $classSession->meeting->duration,

    //             'hosts' => $classSession->meeting->hosts->map(fn($u) => [
    //                 'id' => $u->id,
    //                 'name' => $u->name,
    //                 'email' => $u->email,
    //             ]),

    //             'participants' => $classSession->meeting->participants->map(fn($u) => [
    //                 'id' => $u->id,
    //                 'name' => $u->name,
    //                 'email' => $u->email,
    //             ]),
    //         ] : null,
    //     ];
    //     return Inertia::render('Admin/ClassSessions/edit', [
    //         'session'        => $session,
    //         'batches'        => $batches,
    //         'subjects'       => $subjects,
    //         'teachers'       => $teachers,
    //         'statusOptions'  => $statusOptions,
    //     ]);
    // }

    /**
     * Update the specified session.
     */
    // public function updatee(Request $request, ClassSession $classSession, ZoomService $zoom)
    // {
    //     $validated = $request->validate([
    //         'batch_id'       => 'required|exists:batches,id',
    //         'subject_id'     => 'required|exists:subjects,id',
    //         'teacher_id'     => 'required|exists:teachers,id',
    //         'topic'          => 'required|string|max:255',
    //         'class_date'     => 'required|date',
    //         'duration'       => 'required|integer|min:1',
    //         'status'         => 'required|in:scheduled,completed,cancelled,rescheduled',
    //     ]);

    //     DB::beginTransaction();

    //     try {
    //         /** -----------------------------
    //          * 1) Get linked Meeting
    //          * ----------------------------*/
    //         $meeting = Meeting::findOrFail($classSession->meeting_id);

    //         /** -----------------------------
    //          * 2) Resolve new host (teacher)
    //          * ----------------------------*/
    //         $teacherUser = User::findOrFail(
    //             Teacher::findOrFail($validated['teacher_id'])->user_id
    //         );

    //         /** -----------------------------
    //          * 3) Update Meeting model (local)
    //          * ----------------------------*/
    //         $meeting->fill([
    //             'topic'           => $validated['topic'],
    //             'start_time'      => $validated['class_date'],
    //             'duration'        => $validated['duration'],
    //             'zoom_host_email' => $teacherUser->email,
    //         ]);

    //         /** -----------------------------
    //          * 4) Update Zoom meeting (CRITICAL)
    //          * ----------------------------*/
    //         if ($meeting->zoom_meeting_id) {
    //             $zoom->updateZoomMeeting($meeting);
    //         }

    //         /** -----------------------------
    //          * 5) Save meeting changes locally
    //          * ----------------------------*/
    //         $meeting->save();

    //         /** -----------------------------
    //          * 6) Sync host role (pivot)
    //          * ----------------------------*/
    //         // Remove previous teacher roles
    //         $meeting->users()
    //             ->wherePivot('role', 'teacher')
    //             ->detach();

    //         // Attach new teacher as host
    //         $meeting->users()->syncWithoutDetaching([
    //             $teacherUser->id => ['role' => 'teacher'],
    //         ]);

    //         /** -----------------------------
    //          * 7) Update ClassSession
    //          * ----------------------------*/
    //         $classSession->update([
    //             'topic'        => $validated['topic'],
    //             'class_date'   => $validated['class_date'],
    //             'zoom_join_url' => $meeting->join_url,
    //             'zoom_start_url' => $meeting->start_url,
    //         ]);

    //         DB::commit();

    //         return redirect()
    //             ->route('admin.classSessions.index')
    //             ->with('success', 'Class session & Zoom meeting updated successfully.');
    //     } catch (\Throwable $e) {
    //         DB::rollBack();
    //         report($e);
    //         dd($e);
    //         return back()
    //             ->withErrors([
    //                 'zoom' => 'Unable to update Zoom meeting. No changes were saved.',
    //                 'e' => $e
    //             ])
    //             ->withInput();
    //     }
    // }
    // public function update(Request $request, ClassSession $classSession)
    // {
    //     $validated = $request->validate([
    //         'batch_id'       => 'required|exists:batches,id',
    //         'subject_id'     => 'required|exists:subjects,id',
    //         'teacher_id'     => 'required|exists:teachers,id',
    //         'topic'          => 'required|string|max:255',
    //         'class_date'     => 'required|date',
    //         'status'         => 'required|in:scheduled,completed,cancelled,rescheduled',
    //         'zoom_meeting_id' => 'nullable|string|max:255',
    //         'zoom_join_url'  => 'nullable|url',
    //         'zoom_start_url' => 'nullable|url',
    //         'recording_link' => 'nullable|url',
    //     ]);

    //     $classSession->update($validated);
    //     return redirect()->route('admin.classSessions.index')->with('success', 'Class session updated successfully');
    // }

    /**
     * Remove the specified session.
     */
    public function destroy(Request $request, ClassSession $classSession, ZoomService $zoom)
    {
        $teacherUser = Teacher::query()->with('user:id,name,email')->find($classSession->teacher_id)?->user;
        $topic = $classSession->topic;
        $sessionAt = $classSession->class_date ? Carbon::parse($classSession->class_date)->format('d M Y, h:i A') : null;

        DB::beginTransaction();

        try {
            $classSession->load('meeting');
            $meeting = $classSession->meeting;
            $deleteScope = strtolower((string) $request->input('delete_scope', 'occurrence'));

            if ($deleteScope === 'series') {
                if ($meeting) {
                    if ($meeting->zoom_meeting_id) {
                        try {
                            $zoom->deleteZoomMeeting($meeting);
                        } catch (\RuntimeException $e) {
                            // If Zoom meeting is already gone, still perform full local cleanup.
                            if (!$this->isZoomMeetingMissingException($e)) {
                                throw $e;
                            }
                        }
                    }

                    ClassSession::query()
                        ->where(function ($query) use ($meeting) {
                            $query->where('meeting_id', $meeting->id);
                            if (!empty($meeting->zoom_meeting_id)) {
                                $query->orWhere('zoom_meeting_id', (string) $meeting->zoom_meeting_id);
                            }
                        })
                        ->delete();

                    MeetingOccurrence::query()
                        ->where('meeting_id', $meeting->id)
                        ->delete();

                    $meeting->delete();
                } else {
                    // Fallback when relation is missing: clean by zoom_meeting_id group if possible.
                    if (!empty($classSession->zoom_meeting_id)) {
                        ClassSession::query()
                            ->where('zoom_meeting_id', (string) $classSession->zoom_meeting_id)
                            ->delete();
                    } else {
                        $classSession->delete();
                    }
                }

                DB::commit();
                return back()->with('success', 'Entire recurring meeting deleted successfully.');
            }

            if (!$meeting || !$meeting->zoom_meeting_id) {
                $classSession->delete();
                DB::commit();
                return back()->with('success', 'Class session deleted successfully');
            }

            $hasOccurrenceRows = MeetingOccurrence::query()
                ->where('meeting_id', $meeting->id)
                ->exists();
            $hasRecurringSessions = ClassSession::query()
                ->where('meeting_id', $meeting->id)
                ->whereNotNull('occurrence_id')
                ->exists();
            $hasRecurringSignal = $meeting->meeting_type === 'recurring'
                || !empty($classSession->occurrence_id)
                || $hasOccurrenceRows
                || $hasRecurringSessions;
            $occurrenceId = (string) ($classSession->occurrence_id ?? '');

            // Safety: if user asked to delete occurrence, never delete entire meeting.
            if ($deleteScope === 'occurrence' && $hasRecurringSignal) {
                // Some legacy rows may have null/empty occurrence_id.
                // In recurring mode we must avoid deleting the whole Zoom meeting unintentionally.
                if ($occurrenceId === '' && $classSession->class_date) {
                    $targetStart = Carbon::parse($classSession->class_date);
                    $matchedOccurrence = MeetingOccurrence::query()
                        ->where('meeting_id', $meeting->id)
                        ->whereBetween('start_time', [$targetStart->copy()->subMinute(), $targetStart->copy()->addMinute()])
                        ->first();

                    if ($matchedOccurrence) {
                        $occurrenceId = (string) $matchedOccurrence->occurrence_id;
                    }
                }

                if ($occurrenceId !== '') {
                    $zoom->deleteMeetingOccurrence($meeting, $occurrenceId);
                    MeetingOccurrence::query()
                        ->where('meeting_id', $meeting->id)
                        ->where('occurrence_id', $occurrenceId)
                        ->delete();
                    ClassSession::query()
                        ->where('meeting_id', $meeting->id)
                        ->where('occurrence_id', $occurrenceId)
                        ->delete();
                } else {
                    // Could not map to a Zoom occurrence; delete local row only, keep series intact.
                    $classSession->delete();
                }
            } else {
                $zoom->deleteZoomMeeting($meeting);
                ClassSession::query()
                    ->where(function ($query) use ($meeting) {
                        $query->where('meeting_id', $meeting->id)
                            ->orWhere('zoom_meeting_id', (string) $meeting->zoom_meeting_id);
                    })
                    ->delete();
                MeetingOccurrence::query()->where('meeting_id', $meeting->id)->delete();
                $meeting->delete();
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            return back()->withErrors(['zoom' => $e->getMessage() ?: 'Unable to delete from Zoom.']);
        }

        if ($teacherUser) {
            app(NotificationService::class)->send(
                $teacherUser,
                title: 'Class Session Cancelled',
                message: "Session '{$topic}'" . ($sessionAt ? " ({$sessionAt})" : '') . ' was cancelled by admin.',
                type: NotificationType::EVENT,
                sendEmail: false,
                payload: [
                    'topic' => $topic,
                    'session_at' => $sessionAt,
                    'action_text' => 'Open Upcoming Classes',
                    'action_url' => '/teacher/upcoming-classes',
                    'priority' => 'high',
                ],
                modelType: ClassSession::class,
                modelId: $classSession->id
            );
        }

        return back()->with('success', 'Class session deleted successfully');
    }
}



