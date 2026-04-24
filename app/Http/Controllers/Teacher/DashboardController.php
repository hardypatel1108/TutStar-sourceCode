<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\ClassSession;
use App\Models\Doubt;
use App\Models\Homework;
use App\Models\Teacher;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the teacher dashboard overview.
     */
    public function index(Request $request)
    {
        $authUser = auth('teacher')->user();
        $teacher = $authUser?->teacher ?? Teacher::query()->where('user_id', $authUser?->id)->first();

        $allowedPeriods = [7, 30, 90];
        $periodDays = (int) $request->input('period_days', 30);
        if (! in_array($periodDays, $allowedPeriods, true)) {
            $periodDays = 30;
        }

        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();
        $next7DaysEnd = now()->copy()->addDays(6)->endOfDay();
        $periodStart = now()->copy()->subDays($periodDays)->startOfDay();

        $teacherId = (int) ($teacher?->id ?? 0);

        $batchBaseQuery = Batch::query()->where('teacher_id', $teacherId);
        $sessionBaseQuery = ClassSession::query()->where('teacher_id', $teacherId);
        $homeworkBaseQuery = Homework::query()->where('teacher_id', $teacherId);
        $doubtBaseQuery = Doubt::query()->where('teacher_id', $teacherId);

        $kpis = [
            'total_batches' => (clone $batchBaseQuery)->count(),
            'active_batches' => (clone $batchBaseQuery)->where('status', 'active')->count(),
            'sessions_today' => (clone $sessionBaseQuery)->whereBetween('class_date', [$todayStart, $todayEnd])->count(),
            'upcoming_sessions_7_days' => (clone $sessionBaseQuery)
                ->whereIn('status', ['scheduled', 'rescheduled'])
                ->whereBetween('class_date', [$todayStart, $next7DaysEnd])
                ->count(),
            'completed_sessions_30_days' => (clone $sessionBaseQuery)
                ->where('status', 'completed')
                ->where('class_date', '>=', $periodStart)
                ->count(),
            'homeworks_30_days' => (clone $homeworkBaseQuery)
                ->where('created_at', '>=', $periodStart)
                ->count(),
            'open_doubts' => (clone $doubtBaseQuery)
                ->where('status', 'open')
                ->where('created_at', '>=', $periodStart)
                ->count(),
        ];

        $sessionStatusBreakdown = (clone $sessionBaseQuery)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(fn($row) => [
                'status' => $row->status instanceof \BackedEnum ? $row->status->value : (string) $row->status,
                'total' => (int) $row->total,
            ])
            ->values();

        $upcoming7DaySchedule = (clone $sessionBaseQuery)
            ->whereIn('status', ['scheduled', 'rescheduled'])
            ->whereBetween('class_date', [$todayStart, $next7DaysEnd])
            ->selectRaw('DATE(class_date) as day, COUNT(*) as total')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(function ($row) {
                $day = Carbon::parse($row->day);

                return [
                    'day' => $day->format('Y-m-d'),
                    'label' => $day->format('D'),
                    'total' => (int) $row->total,
                ];
            })
            ->values();

        $batchStrength = (clone $batchBaseQuery)
            ->with(['clazz:id,name', 'subject:id,name'])
            ->withCount([
                'students as current_students_count' => function ($studentQuery) {
                    $studentQuery->where('batch_students.status', 'active')
                        ->where(function ($pivotQuery) {
                            $pivotQuery->whereNull('batch_students.ended_at')
                                ->orWhere('batch_students.ended_at', '>', now());
                        });
                },
            ])
            ->orderByDesc('current_students_count')
            ->take(6)
            ->get()
            ->map(fn($batch) => [
                'id' => $batch->id,
                'batch_code' => $batch->batch_code,
                'class_name' => $batch->clazz?->name,
                'subject_name' => $batch->subject?->name,
                'students_limit' => (int) ($batch->students_limit ?? 0),
                'current_students_count' => (int) ($batch->current_students_count ?? 0),
            ])
            ->values();

        $recentSessions = (clone $sessionBaseQuery)
            ->with(['batch:id,batch_code', 'subject:id,name'])
            ->orderByDesc('class_date')
            ->take(6)
            ->get()
            ->map(function ($session) {
                $status = $session->status instanceof \BackedEnum ? $session->status->value : (string) $session->status;

                return [
                    'id' => $session->id,
                    'topic' => $session->topic,
                    'status' => $status,
                    'class_date_formatted' => $session->class_date?->format('d M Y, h:i a'),
                    'batch_code' => $session->batch?->batch_code,
                    'subject_name' => $session->subject?->name,
                ];
            })
            ->values();

        $recentDoubts = (clone $doubtBaseQuery)
            ->with(['student.user:id,name', 'session.subject:id,name'])
            ->where('status', 'open')
            ->where('created_at', '>=', $periodStart)
            ->latest()
            ->take(6)
            ->get()
            ->map(function ($doubt) {
                return [
                    'id' => $doubt->id,
                    'question' => $doubt->question,
                    'student_name' => $doubt->student?->user?->name,
                    'subject_name' => $doubt->session?->subject?->name,
                    'created_at_formatted' => $doubt->created_at?->format('d M Y, h:i a'),
                ];
            })
            ->values();

        $todaySessions = (clone $sessionBaseQuery)
            ->with(['batch:id,batch_code', 'subject:id,name', 'meeting:id,duration,start_url,recording_url'])
            ->whereBetween('class_date', [$todayStart, $todayEnd])
            ->orderBy('class_date')
            ->get()
            ->map(function ($session) {
                $duration = (int) ($session->meeting?->duration ?? 60);
                $start = $session->class_date ? Carbon::parse($session->class_date) : null;
                $end = $start ? (clone $start)->addMinutes(max($duration, 1)) : null;
                $now = now();
                $status = $session->status instanceof \BackedEnum ? $session->status->value : (string) $session->status;

                return [
                    'id' => $session->id,
                    'topic' => $session->topic,
                    'status' => $status,
                    'batch_code' => $session->batch?->batch_code,
                    'subject_name' => $session->subject?->name,
                    'class_date_formatted' => $start?->format('d M Y, h:i a'),
                    'is_live_window' => $start && $end ? $now->between($start, $end) : false,
                    'start_class_url' => $session->zoom_start_url ?? $session->meeting?->start_url,
                ];
            })
            ->values();

        $nextSession = (clone $sessionBaseQuery)
            ->with(['batch:id,batch_code', 'subject:id,name', 'meeting:id,duration,start_url'])
            ->whereIn('status', ['scheduled', 'rescheduled'])
            ->where('class_date', '>=', now())
            ->orderBy('class_date')
            ->first();

        $nextSessionPayload = null;
        if ($nextSession?->class_date) {
            $nextStart = Carbon::parse($nextSession->class_date);
            $diffMinutes = now()->diffInMinutes($nextStart, false);
            $nextSessionPayload = [
                'id' => $nextSession->id,
                'topic' => $nextSession->topic,
                'batch_code' => $nextSession->batch?->batch_code,
                'subject_name' => $nextSession->subject?->name,
                'class_date_formatted' => $nextStart->format('d M Y, h:i a'),
                'starts_in_text' => $diffMinutes <= 0 ? 'Started' : ($diffMinutes < 60 ? "{$diffMinutes} min" : (int) floor($diffMinutes / 60) . ' hr ' . ($diffMinutes % 60) . ' min'),
                'start_class_url' => $nextSession->zoom_start_url ?? $nextSession->meeting?->start_url,
            ];
        }

        $homeworkPendingItems = (clone $sessionBaseQuery)
            ->with(['batch:id,batch_code', 'subject:id,name'])
            ->where('status', 'completed')
            ->where('class_date', '>=', $periodStart)
            ->whereDoesntHave('homeworks')
            ->orderByDesc('class_date')
            ->take(5)
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'topic' => $s->topic,
                'batch_code' => $s->batch?->batch_code,
                'subject_name' => $s->subject?->name,
                'class_date_formatted' => $s->class_date?->format('d M Y, h:i a'),
            ])
            ->values();

        $slaHours = 8;
        $openDoubtSlaItems = (clone $doubtBaseQuery)
            ->with(['student.user:id,name', 'session.subject:id,name'])
            ->where('status', 'open')
            ->where('created_at', '<=', now()->subHours($slaHours))
            ->orderBy('created_at')
            ->take(5)
            ->get()
            ->map(function ($d) {
                $ageHours = (int) floor($d->created_at?->diffInHours(now()) ?? 0);
                return [
                    'id' => $d->id,
                    'question' => $d->question,
                    'student_name' => $d->student?->user?->name,
                    'subject_name' => $d->session?->subject?->name,
                    'age_hours' => $ageHours,
                    'created_at_formatted' => $d->created_at?->format('d M Y, h:i a'),
                ];
            })
            ->values();

        $recordingPendingItems = (clone $sessionBaseQuery)
            ->with(['batch:id,batch_code', 'subject:id,name', 'meeting:id,recording_url'])
            ->where('status', 'completed')
            ->where('class_date', '>=', $periodStart)
            ->where(function ($q) {
                $q->whereNull('recording_link')
                    ->orWhere('recording_link', '');
            })
            ->orderByDesc('class_date')
            ->take(5)
            ->get()
            ->filter(fn($s) => empty($s->recording_link) && empty($s->meeting?->recording_url))
            ->map(fn($s) => [
                'id' => $s->id,
                'topic' => $s->topic,
                'batch_code' => $s->batch?->batch_code,
                'subject_name' => $s->subject?->name,
                'class_date_formatted' => $s->class_date?->format('d M Y, h:i a'),
            ])
            ->values();

        return Inertia::render('Teacher/dashboard', [
            'teacher' => [
                'id' => $teacherId,
                'name' => $authUser?->name,
            ],
            'filters' => [
                'period_days' => $periodDays,
                'period_options' => $allowedPeriods,
            ],
            'kpis' => $kpis,
            'session_status_breakdown' => $sessionStatusBreakdown,
            'upcoming_7_day_schedule' => $upcoming7DaySchedule,
            'batch_strength' => $batchStrength,
            'recent_sessions' => $recentSessions,
            'recent_doubts' => $recentDoubts,
            'today_focus' => [
                'today_sessions' => $todaySessions,
                'next_session' => $nextSessionPayload,
            ],
            'action_queue' => [
                'homework_pending_count' => $homeworkPendingItems->count(),
                'open_doubt_sla_count' => $openDoubtSlaItems->count(),
                'recording_pending_count' => $recordingPendingItems->count(),
                'sla_hours' => $slaHours,
                'homework_pending_items' => $homeworkPendingItems,
                'open_doubt_sla_items' => $openDoubtSlaItems,
                'recording_pending_items' => $recordingPendingItems,
            ],
        ]);
    }
}
