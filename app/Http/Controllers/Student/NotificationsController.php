<?php

namespace App\Http\Controllers\Student;

use App\Enums\NotificationType;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationsController extends Controller
{
    /**
     * Display a listing of classes for the selected board.
     */
    public function index(Request $request)
    {
        $baseQuery = Notification::query()
            ->where('user_id', auth()->id())
            ->where('created_at', '>=', now()->subDays(7))
            ->when(! $request->filled('read'), function ($query) {
                $query->whereNull('read_at');
            })
            ->when($request->filled('read'), function ($query) use ($request) {
                if ($request->string('read')->toString() === 'read') {
                    $query->whereNotNull('read_at');
                }

                if ($request->string('read')->toString() === 'unread') {
                    $query->whereNull('read_at');
                }
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(function ($inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%");
                });
            });

        $transformNotification = function ($notification) {
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
                    'subject' => $payload['subject'] ?? null,
                    'teacher' => $payload['teacher'] ?? null,
                    'chapter' => $payload['chapter'] ?? null,
                    'next_date' => $payload['next_date'] ?? null,
                    'action_text' => $payload['action_text'] ?? null,
                    'action_url' => $payload['action_url'] ?? null,
                    'priority' => $payload['priority'] ?? null,
                ],
            ];
        };

        $classNotifications = (clone $baseQuery)
            ->where('type', NotificationType::clazz->value)
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'class_page')
            ->withQueryString();

        $homeworkNotifications = (clone $baseQuery)
            ->where('type', NotificationType::HOMEWORK->value)
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'homework_page')
            ->withQueryString();

        $this->markNotificationsViewed($classNotifications);
        $this->markNotificationsViewed($homeworkNotifications);
        $classNotifications = $classNotifications->through($transformNotification);
        $homeworkNotifications = $homeworkNotifications->through($transformNotification);

        $unreadCount = Notification::query()
            ->where('user_id', auth()->id())
            ->whereIn('type', [NotificationType::clazz, NotificationType::HOMEWORK])
            ->where('created_at', '>=', now()->subDays(7))
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Student/notifications', [
            'classNotifications' => $classNotifications,
            'homeworkNotifications' => $homeworkNotifications,
            'filters' => $request->only(['read', 'search']),
            'meta' => [
                'unread_count' => $unreadCount,
                'class_total' => $classNotifications->total(),
                'homework_total' => $homeworkNotifications->total(),
            ],
        ]);
    }

     public function otherNotifications(Request $request)
    {
        $notificationsQuery = Notification::query()
            ->where('user_id', auth()->id())
            ->whereNotIn('type', [NotificationType::clazz, NotificationType::HOMEWORK])
            ->where('created_at', '>=', now()->subDays(7))
            ->when(! $request->filled('read'), function ($query) {
                $query->whereNull('read_at');
            })
            ->when($request->filled('read'), function ($query) use ($request) {
                if ($request->string('read')->toString() === 'read') {
                    $query->whereNotNull('read_at');
                }

                if ($request->string('read')->toString() === 'unread') {
                    $query->whereNull('read_at');
                }
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(function ($inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%");
                });
            });

        $notifications = $notificationsQuery
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $this->markNotificationsViewed($notifications);

        $notifications = $notifications->through(function ($notification) {
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
                        'icon' => $payload['icon'] ?? null,
                        'amount' => $payload['amount'] ?? null,
                        'payment_id' => $payload['payment_id'] ?? null,
                        'due_date' => $payload['due_date'] ?? null,
                        'days_left' => $payload['days_left'] ?? null,
                        'batch_name' => $payload['batch_name'] ?? null,
                    ],
                ];
            });

        $allTypeCounts = Notification::query()
            ->where('user_id', auth()->id())
            ->whereNotIn('type', [NotificationType::clazz, NotificationType::HOMEWORK])
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('type, COUNT(*) as total')
            ->groupBy('type')
            ->get()
            ->map(function ($row) {
                $type = $row->type instanceof \BackedEnum ? $row->type->value : (string) $row->type;
                return ['type' => $type, 'total' => (int) $row->total];
            })
            ->values();

        $unreadCount = Notification::query()
            ->where('user_id', auth()->id())
            ->whereNotIn('type', [NotificationType::clazz, NotificationType::HOMEWORK])
            ->where('created_at', '>=', now()->subDays(7))
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Student/otherNotifications', [
             'notifications' => $notifications,
             'filters' => $request->only(['read', 'search']),
             'meta' => [
                 'unread_count' => $unreadCount,
                 'type_counts' => $allTypeCounts,
             ],
        ]);
    }

    public function markAllOtherRead(Request $request)
    {
        Notification::query()
            ->where('user_id', auth()->id())
            ->whereNotIn('type', [NotificationType::clazz, NotificationType::HOMEWORK])
            ->whereNull('read_at')
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return back();
    }
    public function markAllRead(Request $request)
    {
        Notification::where('user_id', auth()->id())
         ->whereIn('type', [
        NotificationType::clazz,
        NotificationType::HOMEWORK,
    ])
            ->whereNull('read_at')
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return back();
    }
    public function markRead(Notification $notification)
    {
        abort_if($notification->user_id !== auth()->id(), 403);

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
            'viewed_at' => $notification->viewed_at ?? now(),
        ]);

        return back();
    }

    private function markNotificationsViewed($paginator): void
    {
        if (! $paginator) {
            return;
        }

        $ids = $paginator->getCollection()
            ->whereNull('read_at')
            ->whereNull('viewed_at')
            ->pluck('id')
            ->values();

        if ($ids->isEmpty()) {
            return;
        }

        Notification::query()
            ->whereIn('id', $ids)
            ->whereNull('read_at')
            ->whereNull('viewed_at')
            ->update(['viewed_at' => now()]);
    }
}
