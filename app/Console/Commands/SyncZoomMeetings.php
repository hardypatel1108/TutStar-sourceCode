<?php

namespace App\Console\Commands;

use App\Services\Zoom\WebhookEventProcessor;
use App\Services\ZoomService;
use Illuminate\Console\Command;

class SyncZoomMeetings extends Command
{
    protected $signature = 'app:sync-zoom-meetings
        {--host= : Zoom host email/user id (defaults to services.zoom.default_user)}
        {--types=scheduled,live,upcoming : Comma-separated meeting list types}
        {--max-pages=20 : Safety cap for list pagination}';

    protected $description = 'Sync Zoom meetings to local DB (meetings + occurrences + linked sessions/events)';

    public function handle(ZoomService $zoomService, WebhookEventProcessor $processor): int
    {
        $host = (string) ($this->option('host') ?: config('services.zoom.default_user'));
        $types = collect(explode(',', (string) $this->option('types')))
            ->map(fn($t) => trim($t))
            ->filter()
            ->unique()
            ->values();
        $maxPages = max(1, (int) $this->option('max-pages'));

        if ($host === '') {
            $this->error('Missing host. Set --host or services.zoom.default_user.');
            return self::FAILURE;
        }

        $client = $zoomService->client();
        $meetingIds = collect();
        $listCalls = 0;

        foreach ($types as $type) {
            $pageToken = null;
            $page = 0;

            do {
                $page++;
                if ($page > $maxPages) {
                    $this->warn("Reached max page limit for type={$type}.");
                    break;
                }

                $params = ['type' => $type, 'page_size' => 300];
                if ($pageToken) {
                    $params['next_page_token'] = $pageToken;
                }

                $response = $client->get("/users/{$host}/meetings", $params);
                $listCalls++;

                if (!$response->successful()) {
                    $this->warn("Zoom list meetings failed for type={$type}: " . $response->body());
                    break;
                }

                $payload = $response->json();
                foreach (($payload['meetings'] ?? []) as $meeting) {
                    if (!empty($meeting['id'])) {
                        $meetingIds->push((string) $meeting['id']);
                    }
                }

                $pageToken = (string) ($payload['next_page_token'] ?? '');
                if ($pageToken === '') {
                    $pageToken = null;
                }
            } while ($pageToken);
        }

        $meetingIds = $meetingIds->unique()->values();
        if ($meetingIds->isEmpty()) {
            $this->info('No Zoom meetings found to sync.');
            return self::SUCCESS;
        }

        $synced = 0;
        $failed = 0;

        foreach ($meetingIds as $zoomMeetingId) {
            try {
                $detailRes = $client->get("/meetings/{$zoomMeetingId}");
                if (!$detailRes->successful()) {
                    $failed++;
                    $this->warn("Failed to fetch meeting {$zoomMeetingId}: " . $detailRes->body());
                    continue;
                }

                $object = $detailRes->json();
                $processor->process('meeting.updated', ['object' => $object]);
                $synced++;
            } catch (\Throwable $e) {
                $failed++;
                $this->warn("Sync failed for meeting {$zoomMeetingId}: " . $e->getMessage());
            }
        }

        $this->table(
            ['Host', 'Types', 'List Calls', 'Meetings Found', 'Synced', 'Failed'],
            [[
                $host,
                $types->implode(','),
                $listCalls,
                $meetingIds->count(),
                $synced,
                $failed,
            ]]
        );

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}

