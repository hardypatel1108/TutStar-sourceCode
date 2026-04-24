<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ZoomStatus;
use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Event;
use App\Models\Meeting;
use App\Services\ZoomService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EventController extends Controller
{
    private function normalizeZoomOccurrenceStart(string $startTime): Carbon
    {
        return Carbon::parse($startTime)->setTimezone(config('app.timezone'));
    }

    public function index(Request $request)
    {
        $events = Event::query()
            ->with([
                'batches:id,batch_code,class_id,subject_id,teacher_id,time_slot,students_limit',
                'batches.clazz:id,name',
                'batches.subject:id,name',
                'batches.teacher:id,user_id',
                'batches.teacher.user:id,name',
                'meeting' => fn($q) => $q
                    ->withCount('occurrences')
                    ->with([
                        'occurrences' => fn($occQuery) => $occQuery
                            ->select('id', 'meeting_id', 'occurrence_id', 'start_time', 'duration')
                            ->orderBy('start_time'),
                    ]),
            ])
            ->when($request->status !== null && $request->status !== '', function ($q) use ($request) {
                $q->where('active', (bool) $request->status);
            })
            ->when($request->zoom_status, function ($q) use ($request) {
                $q->where('zoom_status', $request->zoom_status);
            })
            ->when($request->meeting_type, function ($q) use ($request) {
                $q->where('meeting_type', $request->meeting_type);
            })
            ->when($request->batch_id, function ($q) use ($request) {
                $batchId = (int) $request->batch_id;
                $q->whereHas('batches', fn($bq) => $bq->where('batches.id', $batchId));
            })
            ->when($request->search, function ($q) use ($request) {
                $search = "%{$request->search}%";
                $q->where(function ($sub) use ($search) {
                    $sub->where('title', 'like', $search)
                        ->orWhere('description', 'like', $search);
                });
            })
            ->when($request->starts_from, fn($q) => $q->whereDate('starts_at', '>=', $request->starts_from))
            ->when($request->starts_to, fn($q) => $q->whereDate('starts_at', '<=', $request->starts_to))
            ->when($request->ends_from, fn($q) => $q->whereDate('ends_at', '>=', $request->ends_from))
            ->when($request->ends_to, fn($q) => $q->whereDate('ends_at', '<=', $request->ends_to))
            ->when($request->range_start && $request->range_end, function ($q) use ($request) {
                $q->whereBetween('starts_at', [$request->range_start, $request->range_end]);
            })
            ->when($request->with_trashed, fn($q) => $q->withTrashed())
            ->when($request->sort_by, function ($q) use ($request) {
                $q->orderBy($request->sort_by, $request->sort_dir ?? 'desc');
            }, fn($q) => $q->orderByDesc('starts_at'))
            ->paginate(config('app.paginate'))
            ->through(function ($event) {
                $event->starts_at_formatted = Carbon::parse($event->starts_at)->format('d M Y, h:i a');
                $event->ends_at_formatted = Carbon::parse($event->ends_at)->format('d M Y, h:i a');
                $event->batches_count = $event->batches->count();
                $event->batch_codes = $event->batches->pluck('batch_code')->values();
                $event->occurrences_count = (int) ($event->meeting?->occurrences_count ?? 0);
                $event->occurrence_items = collect($event->meeting?->occurrences ?? [])
                    ->map(fn($occ) => [
                        'id' => $occ->id,
                        'occurrence_id' => $occ->occurrence_id,
                        'start_time_formatted' => Carbon::parse($occ->start_time)->format('d M Y, h:i a'),
                        'duration' => (int) $occ->duration,
                    ])
                    ->values();
                return $event;
            })
            ->withQueryString();

        return Inertia::render('Admin/Events/index', [
            'events'  => $events,
            'filters' => $request->only([
                'status',
                'zoom_status',
                'meeting_type',
                'batch_id',
                'search',
                'starts_from',
                'starts_to',
                'ends_from',
                'ends_to',
                'range_start',
                'range_end',
                'with_trashed',
                'sort_by',
                'sort_dir',
            ]),
            'batchOptions' => Batch::query()
                ->select('id', 'batch_code')
                ->orderBy('batch_code')
                ->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Events/create', [
            'batchOptions' => $this->batchOptions(),
        ]);
    }

    public function store(Request $request, ZoomService $zoom)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'batch_ids' => 'required|array|min:1',
            'batch_ids.*' => 'integer|exists:batches,id',
            'meeting_type' => 'required|in:single,recurring',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after_or_equal:starts_at',
            'active' => 'nullable|boolean',
            'recurrence.repeat_interval' => 'required_if:meeting_type,recurring|integer|min:1',
            'recurrence.weekly_days' => 'required_if:meeting_type,recurring|array|min:1',
            'recurrence.weekly_days.*' => 'integer|between:1,7',
            'recurrence.end_date_time' => 'required_if:meeting_type,recurring|date|after_or_equal:starts_at',
        ]);

        DB::beginTransaction();

        try {
            $zoomHostEmail = config('services.zoom.default_user');
            if (!$zoomHostEmail) {
                throw new \RuntimeException('ZOOM_DEFAULT_USER is not configured.');
            }

            $meeting = Meeting::create([
                'created_by' => auth()->id() ?? 1,
                'topic' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'zoom_host_email' => $zoomHostEmail,
                'start_time' => $validated['starts_at'],
                'duration' => max(1, Carbon::parse($validated['starts_at'])->diffInMinutes(Carbon::parse($validated['ends_at']))),
                'status' => 'scheduled',
                'meeting_type' => $validated['meeting_type'],
                'recurrence' => $validated['meeting_type'] === 'recurring' ? ($validated['recurrence'] ?? null) : null,
                'timezone' => config('services.zoom.timezone', 'Asia/Kolkata'),
                'recording_status' => 'none',
            ]);

            $zoomData = $zoom->createMeeting($meeting, [], []);

            $meeting->update([
                'zoom_meeting_id' => (string) ($zoomData['id'] ?? ''),
                'zoom_uuid' => $zoomData['uuid'] ?? null,
                'join_url' => $zoomData['join_url'] ?? null,
                'start_url' => $zoomData['start_url'] ?? null,
            ]);
            $occurrences = $zoomData['occurrences'] ?? [];
            if ($validated['meeting_type'] === 'recurring' && count($occurrences) === 0) {
                $zoomMeeting = $zoom->getZoomMeeting($meeting);
                $occurrences = $zoomMeeting['occurrences'] ?? [];
            }
            $this->syncMeetingOccurrences($meeting, $occurrences);

            $eventData = [
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'meeting_id' => $meeting->id,
                'meeting_type' => $validated['meeting_type'],
                'recurrence' => $validated['meeting_type'] === 'recurring' ? ($validated['recurrence'] ?? null) : null,
                'zoom_meeting_id' => (string) ($zoomData['id'] ?? ''),
                'zoom_join_url' => $zoomData['join_url'] ?? null,
                'zoom_start_url' => $zoomData['start_url'] ?? null,
                'zoom_status' => ZoomStatus::SCHEDULED,
                'starts_at' => $validated['starts_at'],
                'ends_at' => $validated['ends_at'],
                'active' => $request->boolean('active', true),
            ];

            if ($request->hasFile('event_image')) {
                $eventData['event_image'] = $request->file('event_image')->store('events', 'public');
            }

            $event = Event::create($eventData);
            $event->batches()->sync($validated['batch_ids']);

            DB::commit();

            return redirect()->route('admin.events.index')->with('success', 'Event created successfully');
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            return back()->withErrors(['zoom' => $e->getMessage() ?: 'Unable to create Zoom meeting for event.'])->withInput();
        }
    }

    public function edit(Event $event)
    {
        $event->starts_at_local = $event->getRawOriginal('starts_at');
        $event->ends_at_local = $event->getRawOriginal('ends_at');
        $event->load([
            'meeting.occurrences' => fn($q) => $q->orderBy('start_time'),
            'batches:id,batch_code,class_id,subject_id,teacher_id,time_slot,students_limit',
        ]);

        return Inertia::render('Admin/Events/edit', [
            'event' => $event,
            'batchOptions' => $this->batchOptions(),
            'selectedBatchIds' => $event->batches->pluck('id')->values(),
        ]);
    }

    public function update(Request $request, Event $event, ZoomService $zoom)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'batch_ids' => 'required|array|min:1',
            'batch_ids.*' => 'integer|exists:batches,id',
            'meeting_type' => 'required|in:single,recurring',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after_or_equal:starts_at',
            'active' => 'required|boolean',
            'recurrence.repeat_interval' => 'required_if:meeting_type,recurring|integer|min:1',
            'recurrence.weekly_days' => 'required_if:meeting_type,recurring|array|min:1',
            'recurrence.weekly_days.*' => 'integer|between:1,7',
            'recurrence.end_date_time' => 'required_if:meeting_type,recurring|date|after_or_equal:starts_at',
        ]);

        DB::beginTransaction();

        try {
            $zoomHostEmail = config('services.zoom.default_user');
            if (!$zoomHostEmail) {
                throw new \RuntimeException('ZOOM_DEFAULT_USER is not configured.');
            }

            $meeting = $event->meeting;

            if (!$meeting) {
                $meeting = Meeting::create([
                    'created_by' => auth()->id() ?? 1,
                    'topic' => $validated['title'],
                    'description' => $validated['description'] ?? null,
                    'zoom_host_email' => $zoomHostEmail,
                    'start_time' => $validated['starts_at'],
                    'duration' => max(1, Carbon::parse($validated['starts_at'])->diffInMinutes(Carbon::parse($validated['ends_at']))),
                    'status' => 'scheduled',
                    'meeting_type' => $validated['meeting_type'],
                    'recurrence' => $validated['meeting_type'] === 'recurring' ? ($validated['recurrence'] ?? null) : null,
                    'timezone' => config('services.zoom.timezone', 'Asia/Kolkata'),
                    'recording_status' => 'none',
                ]);

                $zoomData = $zoom->createMeeting($meeting, [], []);
                $meeting->update([
                    'zoom_meeting_id' => (string) ($zoomData['id'] ?? ''),
                    'zoom_uuid' => $zoomData['uuid'] ?? null,
                    'join_url' => $zoomData['join_url'] ?? null,
                    'start_url' => $zoomData['start_url'] ?? null,
                ]);
                $this->syncMeetingOccurrences($meeting, $zoomData['occurrences'] ?? []);
            } else {
                $meeting->topic = $validated['title'];
                $meeting->description = $validated['description'] ?? null;
                $meeting->start_time = $validated['starts_at'];
                $meeting->duration = max(1, Carbon::parse($validated['starts_at'])->diffInMinutes(Carbon::parse($validated['ends_at'])));
                $meeting->meeting_type = $validated['meeting_type'];
                $meeting->recurrence = $validated['meeting_type'] === 'recurring' ? ($validated['recurrence'] ?? null) : null;
                $meeting->timezone = config('services.zoom.timezone', 'Asia/Kolkata');
                $meeting->save();

                $zoom->updateZoomMeeting($meeting);
                $zoomMeeting = $zoom->getZoomMeeting($meeting);
                $this->syncMeetingOccurrences($meeting, $zoomMeeting['occurrences'] ?? []);
            }

            $updateData = [
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'meeting_id' => $meeting->id,
                'meeting_type' => $validated['meeting_type'],
                'recurrence' => $validated['meeting_type'] === 'recurring' ? ($validated['recurrence'] ?? null) : null,
                'zoom_meeting_id' => (string) ($meeting->zoom_meeting_id ?? $event->zoom_meeting_id),
                'zoom_join_url' => $meeting->join_url,
                'zoom_start_url' => $meeting->start_url,
                'starts_at' => $validated['starts_at'],
                'ends_at' => $validated['ends_at'],
                'active' => (bool) $validated['active'],
            ];

            if ($request->hasFile('event_image')) {
                if ($event->event_image) {
                    Storage::disk('public')->delete($event->event_image);
                }
                $updateData['event_image'] = $request->file('event_image')->store('events', 'public');
            }

            $event->update($updateData);
            $event->batches()->sync($validated['batch_ids']);

            DB::commit();

            return redirect()->route('admin.events.index')->with('success', 'Event updated successfully');
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            return back()->withErrors(['zoom' => $e->getMessage() ?: 'Unable to update Zoom meeting for event.'])->withInput();
        }
    }

    public function destroy(Event $event, ZoomService $zoom)
    {
        if ($event->meeting) {
            try {
                $zoom->deleteZoomMeeting($event->meeting);
            } catch (\Throwable $e) {
                report($e);
            }
        }

        $event->delete();
        return back()->with('success', 'Event deleted successfully');
    }

    private function syncMeetingOccurrences(Meeting $meeting, array $occurrences): void
    {
        if ($meeting->meeting_type !== 'recurring') {
            return;
        }

        if (!is_array($occurrences) || count($occurrences) === 0) {
            return;
        }

        $occurrenceIds = [];

        foreach ($occurrences as $occ) {
            $occurrenceId = (string) ($occ['occurrence_id'] ?? '');
            if ($occurrenceId === '') {
                continue;
            }

            $occurrenceIds[] = $occurrenceId;
            $occurrenceStart = $this->normalizeZoomOccurrenceStart($occ['start_time']);

            \App\Models\MeetingOccurrence::query()->withTrashed()->updateOrCreate(
                [
                    'meeting_id' => $meeting->id,
                    'occurrence_id' => $occurrenceId,
                ],
                [
                    'start_time' => $occurrenceStart,
                    'duration' => (int) ($occ['duration'] ?? $meeting->duration ?? 0),
                    'deleted_at' => null,
                ],
            );
        }

        if (count($occurrenceIds) > 0) {
            $meeting->occurrences()
                ->whereNotIn('occurrence_id', $occurrenceIds)
                ->where('start_time', '>', now())
                ->delete();
        }
    }

    private function batchOptions()
    {
        return Batch::query()
            ->with([
                'clazz:id,name',
                'subject:id,name',
                'teacher:id,user_id',
                'teacher.user:id,name',
            ])
            ->withCount([
                'students as current_students_count' => function ($query) {
                    $query->wherePivot('status', 'active')
                        ->where(function ($q) {
                            $q->whereNull('batch_students.ended_at')
                                ->orWhere('batch_students.ended_at', '>', now());
                        });
                },
            ])
            ->select('id', 'batch_code', 'class_id', 'subject_id', 'teacher_id', 'time_slot', 'students_limit')
            ->orderBy('batch_code')
            ->get()
            ->map(fn($batch) => [
                'id' => $batch->id,
                'batch_code' => $batch->batch_code,
                'class_name' => $batch->clazz?->name,
                'subject_name' => $batch->subject?->name,
                'teacher_name' => $batch->teacher?->user?->name,
                'time_slot' => $batch->time_slot,
                'students_limit' => (int) ($batch->students_limit ?? 0),
                'current_students_count' => (int) ($batch->current_students_count ?? 0),
            ])
            ->values();
    }
}
