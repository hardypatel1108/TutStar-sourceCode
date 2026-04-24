<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications.
     */
    public function index(Request $request)
    {
        $notifications = Notification::query()
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->is_read !== null, fn($q) => $q->where('is_read', $request->is_read))
            ->when($request->search, fn($q) =>
                $q->where(function ($query) use ($request) {
                    $query->where('title', 'like', "%{$request->search}%")
                          ->orWhere('message', 'like', "%{$request->search}%");
                })
            )
            ->with('user:id,name,email')
            ->orderByDesc('id')
            ->paginate(config('app.paginate'))
            ->withQueryString();

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => $notifications,
            'filters' => $request->only('type', 'is_read', 'search'),
        ]);
    }

    /**
     * Show the form for creating a new notification.
     */
    public function create()
    {
        $users = User::select('id', 'name', 'email')->get();

        return Inertia::render('Admin/Notifications/Create', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created notification.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|string|max:50',
            'model_type' => 'nullable|string|max:255',
            'model_id' => 'nullable|integer',
            'payload' => 'nullable|array',
        ]);

        Notification::create($validated);

        return redirect()->route('admin.notifications.index')->with('success', 'Notification sent successfully');
    }

    /**
     * Show the form for editing a notification.
     */
    public function edit(Notification $notification)
    {
        $users = User::select('id', 'name', 'email')->get();

        return Inertia::render('Admin/Notifications/Edit', [
            'notification' => $notification,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified notification.
     */
    public function update(Request $request, Notification $notification)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|string|max:50',
            'model_type' => 'nullable|string|max:255',
            'model_id' => 'nullable|integer',
            'payload' => 'nullable|array',
            'is_read' => 'boolean',
        ]);

        $notification->update($validated);

        return back()->with('success', 'Notification updated successfully');
    }

    /**
     * Remove the specified notification.
     */
    public function destroy(Notification $notification)
    {
        $notification->delete();

        return back()->with('success', 'Notification deleted successfully');
    }
}
