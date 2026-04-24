<?php

namespace App\Console\Commands;

use App\Models\ClassSession;
use App\Models\MeetingOccurrence;
use Carbon\Carbon;
use Illuminate\Console\Command;

class BackfillRecurringOccurrenceIds extends Command
{
    protected $signature = 'app:backfill-recurring-occurrence-ids {--meeting_id=} {--window=180} {--dry-run}';

    protected $description = 'Backfill missing occurrence_id for recurring class sessions from meeting_occurrences';

    public function handle(): int
    {
        $meetingId = $this->option('meeting_id');
        $windowSeconds = max(30, (int) $this->option('window'));
        $dryRun = (bool) $this->option('dry-run');

        $sessions = ClassSession::query()
            ->whereNull('occurrence_id')
            ->whereHas('meeting', fn($q) => $q->where('meeting_type', 'recurring'))
            ->when($meetingId, fn($q) => $q->where('meeting_id', (int) $meetingId))
            ->orderBy('meeting_id')
            ->orderBy('class_date')
            ->get();

        if ($sessions->isEmpty()) {
            $this->info('No recurring class sessions with missing occurrence_id were found.');
            return self::SUCCESS;
        }

        $updated = 0;
        $skippedNoCandidate = 0;
        $skippedDuplicate = 0;
        $total = $sessions->count();

        foreach ($sessions as $session) {
            $target = Carbon::parse($session->class_date);

            $candidates = MeetingOccurrence::query()
                ->where('meeting_id', $session->meeting_id)
                ->whereBetween('start_time', [$target->copy()->subSeconds($windowSeconds), $target->copy()->addSeconds($windowSeconds)])
                ->get();

            if ($candidates->isEmpty()) {
                $skippedNoCandidate++;
                continue;
            }

            $match = $candidates->sortBy(function (MeetingOccurrence $occ) use ($target) {
                return abs(Carbon::parse($occ->start_time)->diffInSeconds($target, false));
            })->first();

            if (!$match) {
                $skippedNoCandidate++;
                continue;
            }

            $isDuplicate = ClassSession::query()
                ->where('meeting_id', $session->meeting_id)
                ->where('occurrence_id', $match->occurrence_id)
                ->where('id', '!=', $session->id)
                ->exists();

            if ($isDuplicate) {
                $skippedDuplicate++;
                continue;
            }

            if (!$dryRun) {
                $session->update([
                    'occurrence_id' => (string) $match->occurrence_id,
                    'zoom_meeting_id' => (string) ($session->zoom_meeting_id ?: $session->meeting?->zoom_meeting_id),
                ]);
            }

            $updated++;
        }

        $this->table(
            ['Total Missing', 'Updated', 'No Candidate', 'Duplicate Skipped', 'Dry Run', 'Window (sec)'],
            [[$total, $updated, $skippedNoCandidate, $skippedDuplicate, $dryRun ? 'yes' : 'no', $windowSeconds]]
        );

        return self::SUCCESS;
    }
}

