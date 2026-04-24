<?php

namespace App\Jobs;

use App\Models\ZoomWebhookEvent;
use App\Services\Zoom\WebhookEventProcessor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ProcessZoomWebhookEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public int $eventId)
    {
    }

    public function handle(WebhookEventProcessor $processor): void
    {
        /** @var ZoomWebhookEvent|null $event */
        $event = DB::transaction(function () {
            $row = ZoomWebhookEvent::query()->lockForUpdate()->find($this->eventId);

            if (!$row || $row->status === 'processed') {
                return null;
            }

            $row->update([
                'status' => 'processing',
                'attempts' => $row->attempts + 1,
            ]);

            return $row->fresh();
        });

        if (!$event) {
            return;
        }

        try {
            $payload = is_array($event->payload) ? $event->payload : [];
            $processor->process($event->event_name, $payload['payload'] ?? []);

            $event->update([
                'status' => 'processed',
                'processed_at' => now(),
                'error_message' => null,
            ]);
        } catch (\Throwable $e) {
            $event->update([
                'status' => 'failed',
                'error_message' => mb_substr($e->getMessage(), 0, 65535),
            ]);

            throw $e;
        }
    }
}
