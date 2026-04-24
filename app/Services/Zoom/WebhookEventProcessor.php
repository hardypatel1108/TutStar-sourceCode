<?php

namespace App\Services\Zoom;

use App\Enums\ClassSessionStatus;
use App\Models\ClassSession;
use App\Models\Event;
use App\Models\Meeting;
use App\Models\MeetingOccurrence;
use Carbon\Carbon;

class WebhookEventProcessor
{
    private function normalizeZoomDateTime(string $dateTime, ?string $sourceTimezone = null): Carbon
    {
        return Carbon::parse($dateTime, $sourceTimezone)->setTimezone(config('app.timezone'));
    }

    public function process(?string $event, array $payload): void
    {
        if (!$event) {
            return;
        }

        match ($event) {
            'meeting.created' => $this->handleMeetingCreated($payload),
            'meeting.updated' => $this->handleMeetingUpdated($payload),
            'meeting.started' => $this->handleMeetingStarted($payload),
            'meeting.ended' => $this->handleMeetingEnded($payload),
            'meeting.deleted' => $this->handleMeetingDeleted($payload),
            'recording.completed' => $this->handleRecordingCompleted($payload),
            default => null,
        };
    }

    private function handleMeetingCreated(array $payload): void
    {
        $object = $payload['object'] ?? [];
        $meeting = $this->upsertMeetingFromObject($object);

        if (!$meeting) {
            return;
        }

        $this->syncOccurrencesToSessions($meeting, $object);
        $this->syncEventFromMeeting($meeting, $object);
    }

    private function handleMeetingUpdated(array $payload): void
    {
        $object = $payload['object'] ?? [];
        $meeting = $this->upsertMeetingFromObject($object);

        if (!$meeting) {
            return;
        }

        $this->syncOccurrencesToSessions($meeting, $object);
        $this->syncEventFromMeeting($meeting, $object);
    }

    private function handleMeetingStarted(array $payload): void
    {
        $session = $this->resolveSession($payload);
        if (!$session) {
            $this->updateEventStatusByPayload($payload, 'started');
            return;
        }

        $session->meeting?->update(['status' => 'started']);
        $this->updateEventStatusByMeetingId($session->meeting?->zoom_meeting_id, 'started');
    }

    private function handleMeetingEnded(array $payload): void
    {
        $session = $this->resolveSession($payload);
        if (!$session) {
            $this->updateEventStatusByPayload($payload, 'ended');
            return;
        }

        $session->update(['status' => ClassSessionStatus::COMPLETED]);
        $session->meeting?->update(['status' => 'ended']);
        $this->updateEventStatusByMeetingId($session->meeting?->zoom_meeting_id, 'ended');
    }

    private function handleRecordingCompleted(array $payload): void
    {
        $session = $this->resolveSession($payload);
        $object = $payload['object'] ?? [];

        if (!$session) {
            $this->updateEventRecordingByPayload($payload);
            return;
        }

        $recordingFiles = $object['recording_files'] ?? [];
        $recording = collect($recordingFiles)
            ->first(fn($file) => !empty($file['play_url']));

        if (!$recording) {
            return;
        }

        $session->update([
            'recording_link' => $recording['play_url'],
            'status' => ClassSessionStatus::COMPLETED,
        ]);

        $session->meeting?->update([
            'recording_status' => 'available',
            'recording_url' => $recording['play_url'],
            'status' => 'ended',
        ]);

        $this->updateEventRecordingByMeetingId($session->meeting?->zoom_meeting_id, $recording['play_url']);
    }

    private function handleMeetingDeleted(array $payload): void
    {
        $object = $payload['object'] ?? [];
        $zoomMeetingId = (string) ($object['id'] ?? '');
        if ($zoomMeetingId === '') {
            return;
        }

        $meeting = Meeting::query()->where('zoom_meeting_id', $zoomMeetingId)->first();
        $operation = strtolower((string) ($payload['operation'] ?? 'all'));
        $occurrenceId = (string) ($object['occurrence_id'] ?? '');

        // Meeting missing locally: still mark related events as cancelled.
        if (!$meeting) {
            Event::query()
                ->where('zoom_meeting_id', $zoomMeetingId)
                ->update([
                    'zoom_status' => 'cancelled',
                    'active' => false,
                ]);
            return;
        }

        // Full recurring/single meeting delete from Zoom.
        if ($operation === 'all' || $occurrenceId === '') {
            ClassSession::query()
                ->where(function ($q) use ($meeting, $zoomMeetingId) {
                    $q->where('meeting_id', $meeting->id)
                        ->orWhere('zoom_meeting_id', $zoomMeetingId);
                })
                ->delete();
            MeetingOccurrence::query()->where('meeting_id', $meeting->id)->delete();

            Event::query()
                ->where(function ($q) use ($meeting, $zoomMeetingId) {
                    $q->where('meeting_id', $meeting->id)
                        ->orWhere('zoom_meeting_id', $zoomMeetingId);
                })
                ->update([
                    'zoom_status' => 'cancelled',
                    'active' => false,
                ]);

            $meeting->update(['status' => 'cancelled']);
            $meeting->delete();
            return;
        }

        // Single occurrence delete.
        $deletedAny = false;
        if ($occurrenceId !== '') {
            $deletedAny = ClassSession::query()
                ->where('meeting_id', $meeting->id)
                ->where('occurrence_id', $occurrenceId)
                ->delete() > 0;

            MeetingOccurrence::query()
                ->where('meeting_id', $meeting->id)
                ->where('occurrence_id', $occurrenceId)
                ->delete();
        }

        // Fallback when Zoom does not send occurrence_id but includes start_time.
        if (!$deletedAny && !empty($object['start_time'])) {
            $start = $this->normalizeZoomDateTime($object['start_time'], $object['timezone'] ?? $meeting->timezone);
            $from = $start->copy()->subMinute();
            $to = $start->copy()->addMinute();

            ClassSession::query()
                ->where('meeting_id', $meeting->id)
                ->whereBetween('class_date', [$from, $to])
                ->delete();

            MeetingOccurrence::query()
                ->where('meeting_id', $meeting->id)
                ->whereBetween('start_time', [$from, $to])
                ->delete();
        }
    }

    private function upsertMeetingFromObject(array $object): ?Meeting
    {
        $zoomMeetingId = $object['id'] ?? null;
        if (!$zoomMeetingId) {
            return null;
        }

        $sourceTimezone = $object['timezone'] ?? config('services.zoom.timezone', 'Asia/Kolkata');
        $startTime = !empty($object['start_time'])
            ? $this->normalizeZoomDateTime($object['start_time'], $sourceTimezone)
            : null;

        $meeting = Meeting::query()->firstOrNew(['zoom_meeting_id' => (string) $zoomMeetingId]);
        if (!$meeting->exists) {
            $meeting->created_by = $meeting->created_by ?? 1;
            $meeting->status = $meeting->status ?? 'scheduled';
            $meeting->recording_status = $meeting->recording_status ?? 'none';
            $meeting->meeting_type = (($object['type'] ?? 2) == 8) ? 'recurring' : 'single';
            $meeting->start_time = $startTime ?? now();
            $meeting->duration = (int) ($object['duration'] ?? 30);
            $meeting->topic = $object['topic'] ?? 'Zoom Meeting';
        }

        $meeting->zoom_uuid = $object['uuid'] ?? $meeting->zoom_uuid;
        $meeting->topic = $object['topic'] ?? $meeting->topic;
        $meeting->description = $object['agenda'] ?? $meeting->description;
        $meeting->duration = (int) ($object['duration'] ?? $meeting->duration ?? 30);
        $meeting->start_time = $startTime ?? $meeting->start_time ?? now();
        $meeting->timezone = $object['timezone'] ?? $meeting->timezone ?? config('services.zoom.timezone', 'Asia/Kolkata');
        $meeting->join_url = $object['join_url'] ?? $meeting->join_url;
        $meeting->start_url = $object['start_url'] ?? $meeting->start_url;
        $meeting->meeting_type = (($object['type'] ?? 2) == 8) ? 'recurring' : 'single';
        $meeting->recurrence = $object['recurrence'] ?? $meeting->recurrence;
        $meeting->save();

        return $meeting;
    }

    private function syncOccurrencesToSessions(Meeting $meeting, array $object): void
    {
        $occurrences = $object['occurrences'] ?? [];

        if (!is_array($occurrences) || count($occurrences) === 0) {
            return;
        }

        $templateSession = ClassSession::query()
            ->where('meeting_id', $meeting->id)
            ->orderBy('id')
            ->first();

        $occurrenceIds = [];

        foreach ($occurrences as $occ) {
            $occurrenceId = (string) ($occ['occurrence_id'] ?? '');
            if ($occurrenceId === '') {
                continue;
            }

            $occurrenceIds[] = $occurrenceId;
            $occurrenceStart = $this->normalizeZoomDateTime(
                $occ['start_time'],
                $object['timezone'] ?? $meeting->timezone
            );

            MeetingOccurrence::query()->withTrashed()->updateOrCreate(
                [
                    'meeting_id' => $meeting->id,
                    'occurrence_id' => $occurrenceId,
                ],
                [
                    'start_time' => $occurrenceStart,
                    'duration' => (int) ($occ['duration'] ?? $meeting->duration ?? 30),
                    'deleted_at' => null,
                ],
            );

            if (!$templateSession) {
                continue;
            }

            ClassSession::query()->withTrashed()->updateOrCreate(
                [
                    'meeting_id' => $meeting->id,
                    'occurrence_id' => $occurrenceId,
                ],
                [
                    'batch_id' => $templateSession->batch_id,
                    'subject_id' => $templateSession->subject_id,
                    'teacher_id' => $templateSession->teacher_id,
                    'topic' => $meeting->topic,
                    'class_date' => $occurrenceStart,
                    'status' => ClassSessionStatus::SCHEDULED,
                    'zoom_meeting_id' => (string) $meeting->zoom_meeting_id,
                    'zoom_join_url' => $meeting->join_url,
                    'zoom_start_url' => $meeting->start_url,
                    'deleted_at' => null,
                ],
            );
        }

        if ($templateSession && count($occurrenceIds) > 0) {
            ClassSession::query()
                ->where('meeting_id', $meeting->id)
                ->whereNotNull('occurrence_id')
                ->whereNotIn('occurrence_id', $occurrenceIds)
                ->where('class_date', '>', now())
                ->delete();
        }
    }

    private function resolveSession(array $payload): ?ClassSession
    {
        $object = $payload['object'] ?? [];
        $zoomMeetingId = $object['id'] ?? null;
        $occurrenceId = $object['occurrence_id'] ?? null;

        if ($occurrenceId) {
            $sessionQuery = ClassSession::query()->where('occurrence_id', (string) $occurrenceId);
            if ($zoomMeetingId) {
                $meeting = Meeting::query()->where('zoom_meeting_id', (string) $zoomMeetingId)->first();
                if ($meeting) {
                    $sessionQuery->where('meeting_id', $meeting->id);
                }
            }

            $session = $sessionQuery->first();
            if ($session) {
                return $session;
            }
        }

        if (!$zoomMeetingId) {
            return null;
        }

        $meeting = Meeting::query()->where('zoom_meeting_id', (string) $zoomMeetingId)->first();
        if (!$meeting) {
            return null;
        }

        return ClassSession::query()
            ->where('meeting_id', $meeting->id)
            ->orderByDesc('class_date')
            ->first();
    }

    private function syncEventFromMeeting(Meeting $meeting, array $object): void
    {
        $event = Event::query()
            ->where('meeting_id', $meeting->id)
            ->orWhere('zoom_meeting_id', (string) $meeting->zoom_meeting_id)
            ->first();

        if (!$event) {
            return;
        }

        $startTime = !empty($object['start_time'])
            ? $this->normalizeZoomDateTime($object['start_time'], $object['timezone'] ?? $meeting->timezone)
            : $meeting->start_time;
        $endTime = (clone $startTime)->addMinutes((int) ($object['duration'] ?? $meeting->duration ?? 0));

        $event->update([
            'meeting_id' => $meeting->id,
            'meeting_type' => $meeting->meeting_type,
            'recurrence' => $meeting->recurrence,
            'zoom_meeting_id' => (string) $meeting->zoom_meeting_id,
            'zoom_join_url' => $meeting->join_url,
            'zoom_start_url' => $meeting->start_url,
            'starts_at' => $startTime,
            'ends_at' => $endTime,
        ]);
    }

    private function updateEventStatusByPayload(array $payload, string $status): void
    {
        $object = $payload['object'] ?? [];
        $this->updateEventStatusByMeetingId((string) ($object['id'] ?? ''), $status);
    }

    private function updateEventStatusByMeetingId(?string $zoomMeetingId, string $status): void
    {
        if (!$zoomMeetingId) {
            return;
        }

        Event::query()
            ->where('zoom_meeting_id', $zoomMeetingId)
            ->update(['zoom_status' => $status]);
    }

    private function updateEventRecordingByPayload(array $payload): void
    {
        $object = $payload['object'] ?? [];
        $recordingFiles = $object['recording_files'] ?? [];
        $recording = collect($recordingFiles)->first(fn($file) => !empty($file['play_url']));
        if (!$recording) {
            return;
        }

        $this->updateEventRecordingByMeetingId((string) ($object['id'] ?? ''), $recording['play_url']);
    }

    private function updateEventRecordingByMeetingId(?string $zoomMeetingId, string $recordingUrl): void
    {
        if (!$zoomMeetingId) {
            return;
        }

        Event::query()
            ->where('zoom_meeting_id', $zoomMeetingId)
            ->update([
                'zoom_status' => 'ended',
                'zoom_recording_link' => $recordingUrl,
            ]);
    }
}
