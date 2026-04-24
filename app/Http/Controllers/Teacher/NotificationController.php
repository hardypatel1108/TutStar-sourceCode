<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $authUser = auth('teacher')->user();
        $teacher = $authUser?->teacher ?? Teacher::query()->where('user_id', $authUser?->id)->first();

        if (! $authUser || ! $teacher) {
            return Inertia::render('Teacher/Notifications/index', [
                'notifications' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 10,
                    'total' => 0,
                ],
                'filters' => $request->only(['type', 'read', 'search']),
                'meta' => [
                    'unread_count' => 0,
                    'type_counts' => [],
                    'trigger_map' => $this->triggerMap(),
                ],
            ]);
        }

        $query = Notification::query()
            ->where('user_id', $authUser->id)
            ->when($request->filled('type') && $request->type !== 'all', fn($q) => $q->where('type', $request->type))
            ->when($request->filled('read') && $request->read === 'read', fn($q) => $q->whereNotNull('read_at'))
            ->when($request->filled('read') && $request->read === 'unread', fn($q) => $q->whereNull('read_at'))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search')->toString();
                $q->where(function ($inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%");
                });
            });

        $notifications = $query
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($notification) {
                $type = $notification->type instanceof \BackedEnum
                    ? $notification->type->value
                    : (string) $notification->type;

                $payload = is_array($notification->payload) ? $notification->payload : [];

                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $type,
                    'is_read' => (bool) $notification->is_read,
                    'read_at' => optional($notification->read_at)?->toDateTimeString(),
                    'created_at' => optional($notification->created_at)?->toDateTimeString(),
                    'created_at_formatted' => optional($notification->created_at)?->format('d M Y, h:i A'),
                    'payload' => [
                        'action_text' => $payload['action_text'] ?? null,
                        'action_url' => $payload['action_url'] ?? null,
                        'priority' => $payload['priority'] ?? null,
                        'batch_name' => $payload['batch_name'] ?? null,
                        'topic' => $payload['topic'] ?? null,
                        'session_at' => $payload['session_at'] ?? null,
                        'student_name' => $payload['student_name'] ?? null,
                    ],
                ];
            });

        $typeCounts = Notification::query()
            ->where('user_id', $authUser->id)
            ->selectRaw('type, COUNT(*) as total')
            ->groupBy('type')
            ->get()
            ->map(function ($row) {
                $type = $row->type instanceof \BackedEnum ? $row->type->value : (string) $row->type;

                return ['type' => $type, 'total' => (int) $row->total];
            })
            ->values();

        $unreadCount = Notification::query()
            ->where('user_id', $authUser->id)
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Teacher/Notifications/index', [
            'notifications' => $notifications,
            'filters' => $request->only(['type', 'read', 'search']),
            'meta' => [
                'unread_count' => $unreadCount,
                'type_counts' => $typeCounts,
                'trigger_map' => $this->triggerMap(),
            ],
        ]);
    }

    public function markAllRead()
    {
        Notification::query()
            ->where('user_id', auth('teacher')->id())
            ->whereNull('read_at')
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return back();
    }

    public function markRead(Notification $notification)
    {
        abort_if($notification->user_id !== auth('teacher')->id(), 403);

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return back();
    }

    private function triggerMap(): array
    {
        return [
            [
                'action' => 'Batch assigned/teacher updated by admin',
                'notification' => 'You get class notification with batch details',
                'type' => 'class',
            ],
            [
                'action' => 'Class session created/updated/cancelled by admin',
                'notification' => 'You get session notification with schedule/topic change',
                'type' => 'event',
            ],
            [
                'action' => 'Student submits doubt for your session',
                'notification' => 'You get custom doubt alert with student and topic',
                'type' => 'custom',
            ],
            [
                'action' => 'System/profile/password/payment reminders',
                'notification' => 'You get system notifications',
                'type' => 'system/payment/cron',
            ],
        ];
    }
}

