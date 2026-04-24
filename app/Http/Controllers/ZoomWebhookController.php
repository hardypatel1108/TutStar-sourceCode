<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessZoomWebhookEvent;
use App\Models\AuditLog;
use App\Models\ZoomWebhookEvent;
use Illuminate\Http\Request;

class ZoomWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $headers = $request->headers->all();
        $rawBody = $request->getContent();
        $data = $request->all();

        $event = $data['event'] ?? null;
        $payload = $data['payload'] ?? [];

        $auditLog = $this->logWebhook($event, $headers, $rawBody, $data);

        if ($event === 'endpoint.url_validation') {
            return $this->handleUrlValidation($payload, $auditLog);
        }

        if (!$this->isSignatureValid($request, $rawBody)) {
            $auditLog->update([
                'changes' => array_merge((array) $auditLog->changes, [
                    'signature_valid' => false,
                ]),
            ]);

            return response()->json(['message' => 'Invalid webhook signature'], 401);
        }

        $dedupeKey = hash('sha256', $rawBody);

        $webhookEvent = ZoomWebhookEvent::query()->firstOrCreate(
            ['dedupe_key' => $dedupeKey],
            [
                'event_name' => $event,
                'status' => 'pending',
                'received_at' => now(),
                'headers' => $headers,
                'raw_body' => $rawBody,
                'payload' => $data,
            ],
        );

        $auditLog->update([
            'model_type' => ZoomWebhookEvent::class,
            'model_id' => $webhookEvent->id,
            'changes' => array_merge((array) $auditLog->changes, [
                'signature_valid' => true,
                'dedupe_key' => $dedupeKey,
                'webhook_event_status' => $webhookEvent->status,
                'duplicate' => !$webhookEvent->wasRecentlyCreated,
            ]),
        ]);

        if (!$webhookEvent->wasRecentlyCreated) {
            return response()->json(['status' => 'duplicate_ignored']);
        }

        ProcessZoomWebhookEvent::dispatch($webhookEvent->id);

        return response()->json(['status' => 'accepted']);
    }

    protected function logWebhook($event, $headers, $rawBody, $data): AuditLog
    {
        return AuditLog::create([
            'user_id' => null,
            'action' => $event ?? 'zoom_webhook_received',
            'model_type' => null,
            'model_id' => null,
            'changes' => [
                'headers' => $headers,
                'raw_body' => $rawBody,
                'parsed_body' => $data,
            ],
        ]);
    }

    protected function handleUrlValidation(array $payload, AuditLog $auditLog)
    {
        $plainToken = $payload['plainToken'] ?? null;
        $secretToken = config('services.zoom.webhook_secret');

        $encryptedToken = $plainToken && $secretToken
            ? hash_hmac('sha256', $plainToken, $secretToken)
            : null;

        $auditLog->update([
            'changes' => array_merge((array) $auditLog->changes, [
                'url_validation_response' => [
                    'plainToken' => $plainToken,
                    'encryptedToken' => $encryptedToken,
                ],
            ]),
        ]);

        return response()->json([
            'plainToken' => $plainToken,
            'encryptedToken' => $encryptedToken,
        ]);
    }

    protected function isSignatureValid(Request $request, string $rawBody): bool
    {
        $secret = config('services.zoom.webhook_secret');

        // Backward compatibility: if no secret configured, skip verification.
        if (!$secret) {
            return true;
        }

        $signature = $request->header('x-zm-signature');
        $timestamp = $request->header('x-zm-request-timestamp');

        if (!$signature || !$timestamp) {
            return false;
        }

        // Reject old replay attempts (> 5 minutes).
        if (abs(time() - (int) $timestamp) > 300) {
            return false;
        }

        $message = sprintf('v0:%s:%s', $timestamp, $rawBody);
        $expected = 'v0=' . hash_hmac('sha256', $message, $secret);

        return hash_equals($expected, $signature);
    }
}
