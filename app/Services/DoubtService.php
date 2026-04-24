<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\ClassSession;
use App\Models\Doubt;

class DoubtService
{
    /**
     * Get doubts asked in past 2 days by student and sessions where student
     * is allowed to ask a new doubt.
     *
     * @param int $studentId
     * @return array ['recentDoubts' => Collection, 'allowedSessions' => Collection]
     */
    public static function getStudentDoubtData(int $studentId): array
    {
        $now = Carbon::now();

        // 1) Recent doubts (past 2 days)
        $recentDoubts = Doubt::with(['session.subject','teacher.user'])
            ->where('student_id', $studentId)
            ->where('created_at', '>=', $now->copy()->subDays(2))
            ->orderBy('created_at', 'desc')
            ->get();

        // 2) Sessions where student hasn't asked yet, but is allowed to ask now.
        // Rule: student can ask only until 1 hour before next class
        // for the same batch + subject.
        $candidateSessions = ClassSession::query()
            // only sessions that relate to batches where the student is currently active
            ->whereHas('batch.students', function ($q) use ($studentId) {
                $q->where('students.id', $studentId)
                    ->where('batch_students.status', 'active')
                    ->where(function ($pivotQuery) {
                        $pivotQuery->whereNull('batch_students.ended_at')
                            ->orWhere('batch_students.ended_at', '>', now());
                    });
            })

            // student hasn't already asked a doubt for that session
            ->whereDoesntHave('doubts', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            // only class sessions that already started/completed
            ->where('class_date', '<=', $now)
            ->whereIn('status', ['scheduled', 'rescheduled', 'completed'])

            ->with(['subject', 'batch', 'teacher.user', 'doubts' => function ($q) use ($studentId) {
                // include student-specific doubts (should be empty because of whereDoesntHave)
                $q->where('student_id', $studentId);
            }])

            ->orderBy('class_date', 'asc')
            ->get();

        $nextClassCache = [];

        $allowedSessions = $candidateSessions->filter(function ($session) use ($now, &$nextClassCache) {
            $cacheKey = $session->batch_id . ':' . $session->subject_id;

            if (! array_key_exists($cacheKey, $nextClassCache)) {
                $nextClassCache[$cacheKey] = ClassSession::query()
                    ->where('batch_id', $session->batch_id)
                    ->where('subject_id', $session->subject_id)
                    ->whereIn('status', ['scheduled', 'rescheduled', 'completed'])
                    ->where('class_date', '>', $now)
                    ->orderBy('class_date')
                    ->first();
            }

            $nextClass = $nextClassCache[$cacheKey];

            if (! $nextClass) {
                return true;
            }

            $deadline = $nextClass->class_date->copy()->subHour();

            return $now->lt($deadline);
        })->values();

        return [
            'recentDoubts'    => $recentDoubts,
            'allowedSessions' => $allowedSessions,
        ];
    }
}
