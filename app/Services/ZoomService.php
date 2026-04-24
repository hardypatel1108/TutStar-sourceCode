<?php

namespace App\Services;

use App\Enums\ClassSessionStatus;
use App\Models\Meeting;
use Illuminate\Support\Facades\Http;
use App\Models\AuditLog;
use App\Models\ClassSession;
use Carbon\Carbon;

class ZoomService
{
    private function normalizeRecurringPayload(?array $recurrence): array
    {
        $repeatInterval = (int) ($recurrence['repeat_interval'] ?? 1);
        $weeklyDays = array_values(array_filter(
            array_map(fn($day) => (int) $day, (array) ($recurrence['weekly_days'] ?? [])),
            fn($day) => $day >= 1 && $day <= 7
        ));

        // App UI uses 1=Mon..7=Sun, Zoom expects 1=Sun..7=Sat.
        $zoomWeeklyDays = array_map(fn($day) => $day === 7 ? 1 : $day + 1, $weeklyDays);
        sort($zoomWeeklyDays);
        $zoomWeeklyDays = array_values(array_unique($zoomWeeklyDays));

        $endDateTimeUtc = Carbon::parse(
            (string) ($recurrence['end_date_time'] ?? now()->addWeek()),
            config('app.timezone')
        )->utc()->format('Y-m-d\TH:i:s\Z');

        return [
            'type' => 2,
            'repeat_interval' => max(1, $repeatInterval),
            'weekly_days' => implode(',', $zoomWeeklyDays),
            'end_date_time' => $endDateTimeUtc,
        ];
    }

    public function listUsers()
    {
        return $this->client()->get('/users')->json();
    }
    protected function token(): string
    {
        $response = Http::asForm()
            ->withBasicAuth(
                config('services.zoom.client_id'),
                config('services.zoom.client_secret')
            )
            ->post('https://zoom.us/oauth/token', [
                'grant_type' => 'account_credentials',
                'account_id' => config('services.zoom.account_id'),
            ]);

        if (!$response->successful()) {
            throw new \RuntimeException('Zoom auth failed: ' . $response->body());
        }

        return $response->json()['access_token'];
    }

    public function client()
    {
        return Http::withToken($this->token())->baseUrl(config('services.zoom.base_url'));
    }

    public function createMeeting(
        Meeting $meeting,
        array $hostEmails = [],
        array $participantEmails = []
    ) {
        $cleanHostEmails = array_values(array_unique(array_filter(
            $hostEmails,
            fn($email) => $email && $email !== $meeting->zoom_host_email
        )));

        $cleanParticipantEmails = array_values(array_unique(array_filter($participantEmails)));

        $payload = [
            'topic'      => $meeting->topic,
            'agenda'     => $meeting->description,
            'timezone' => $meeting->timezone ?: config('services.zoom.timezone', 'Asia/Kolkata'),
            'duration'   => $meeting->duration,
            'start_time'   => $meeting->start_time->toIso8601String(),
            'settings'   => [
                'join_before_host' => false,
                'mute_upon_entry'  => true,
                'waiting_room'     => true,
                'auto_recording'   => 'cloud',
                'meeting_invitees' => array_map(
                    fn($email) => ['email' => $email],
                    $cleanParticipantEmails
                ),
            ],
        ];

        if (!empty($cleanHostEmails)) {
            $payload['settings']['alternative_hosts'] = implode(';', $cleanHostEmails);
        }

        if ($meeting->meeting_type === 'single') {
            $payload['type'] = 2;
        }

        if ($meeting->meeting_type === 'recurring') {
            $payload['type'] = 8;
            $payload['recurrence'] = $this->normalizeRecurringPayload((array) $meeting->recurrence);
        }
        $response = $this->client()->post(
            "/users/{$meeting->zoom_host_email}/meetings",
            $payload
        );

        if (!$response->successful()) {
            throw new \Exception($response->body());
        }

        return $response->json();
    }


    public function updateZoomMeeting(Meeting $meeting): void
    {
        if (!$meeting->zoom_meeting_id) return;

        $payload = [
            'topic'    => $meeting->topic,
            'duration' => (int) $meeting->duration,
            'start_time' => $meeting->start_time->toIso8601String(),
        ];

        // ✅ RECURRING (RULE ONLY)
        if ($meeting->meeting_type === 'recurring') {
            $normalizedRecurrence = $this->normalizeRecurringPayload((array) $meeting->recurrence);

            $payload['recurrence'] = [
                'type'            => $normalizedRecurrence['type'],
                'repeat_interval' => $normalizedRecurrence['repeat_interval'],
                'weekly_days'     => $normalizedRecurrence['weekly_days'],
                'end_date_time'   => $normalizedRecurrence['end_date_time'],
            ];
        }

        $response = $this->client()->patch(
            "/meetings/{$meeting->zoom_meeting_id}",
            $payload
        );

        if (!$response->successful()) {
            throw new \RuntimeException((string) $response->body());
        }

        AuditLog::create([
            'action'     => 'zoom_meeting_update',
            'model_type' => Meeting::class,
            'model_id'   => $meeting->id,
            'changes'    => [
                'request_sent_to_zoom' => [
                    'payload'       => $payload,
                    'meeting'       => $meeting,
                ],
                'zoom_response' => $response->json(),
            ],
        ]);

    }

    public function deleteZoomMeeting(Meeting $meeting): void
    {
        if (!$meeting->zoom_meeting_id) {
            throw new \InvalidArgumentException('Missing Zoom Meeting ID.');
        }
        $response = $this->client()->delete("/meetings/{$meeting->zoom_meeting_id}");

        if (!$response->successful() && $response->status() !== 404) {
            throw new \RuntimeException('Zoom delete failed: ' . $response->body());
        }
    }

    public function deleteMeetingOccurrence(Meeting $meeting, string $occurrenceId): void
    {
        if (!$meeting->zoom_meeting_id) {
            throw new \InvalidArgumentException('Missing Zoom Meeting ID.');
        }

        // Zoom expects occurrence_id as query param for deleting a single occurrence.
        // Sending it in request body may be ignored and can delete the full meeting.
        $encodedOccurrenceId = urlencode($occurrenceId);
        $response = $this->client()->delete("/meetings/{$meeting->zoom_meeting_id}?occurrence_id={$encodedOccurrenceId}");

        if (!$response->successful() && $response->status() !== 404) {
            throw new \RuntimeException('Zoom occurrence delete failed: ' . $response->body());
        }
    }

    public function getZoomMeeting(Meeting $meeting): array
    {
        $zoomId = $meeting->zoom_meeting_id;
        $response = $this->client()->get("/meetings/{$zoomId}");

        if (!$response->successful()) {
            throw new \RuntimeException('Zoom get meeting failed: ' . $response->body());
        }

        return $response->json();
    }

    public function getRecordingsByMeetingUUID(string $uuid): array
    {
        // Zoom requires URL-encoded UUID
        $encodedUuid = urlencode($uuid);
        $response = $this->client()->get("/meetings/{$encodedUuid}/recordings");

        if (!$response->successful()) {
            throw new \RuntimeException('Zoom get recordings failed: ' . $response->body());
        }

        return $response->json();
    }

    private function resolveSession(array $payload): ?ClassSession
    {
        $meetingId = $payload['object']['id'] ?? null;
        $occurrenceId = $payload['object']['occurrence_id'] ?? null;

        if ($occurrenceId) {
            $meeting = $meetingId
                ? Meeting::query()->where('zoom_meeting_id', (string) $meetingId)->first()
                : null;

            if ($meeting) {
                $session = ClassSession::query()
                    ->where('meeting_id', $meeting->id)
                    ->where('occurrence_id', (string) $occurrenceId)
                    ->first();

                if ($session) {
                    return $session;
                }
            }

            return ClassSession::query()
                ->where('occurrence_id', (string) $occurrenceId)
                ->orderByDesc('id')
                ->first();
        }

        return ClassSession::whereHas('meeting', function ($q) use ($meetingId) {
            $q->where('zoom_meeting_id', $meetingId);
        })->first();
    }
    private function handleMeetingEnded(array $payload)
    {
        $session = $this->resolveSession($payload);

        if (!$session) return;

        $session->update([
            'status' => ClassSessionStatus::COMPLETED,
        ]);
    }
    private function handleRecordingCompleted(array $payload)
    {
        $session = $this->resolveSession($payload);

        if (!$session) return;

        $recording = $payload['object']['recording_files'][0] ?? null;

        if ($recording) {
            $session->update([
                'recording_link' => $recording['play_url'],
            ]);
        }
    }
    private function handleParticipantJoined(array $payload)
    {
        $session = $this->resolveSession($payload);

        if (!$session) return;

        // MeetingAttendee::create([
        //     'meeting_id' => $session->meeting->id,
        //     'student_id' => null, // map later if needed
        //     'zoom_user_name' => $payload['object']['participant']['user_name'],
        //     'joined_at' => now(),
        // ]);
    }
}
