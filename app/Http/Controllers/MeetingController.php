<?php 

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\User;
use App\Services\ZoomService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
class MeetingController extends Controller
{
    public function index()
    {
        $meetings = Meeting::with(['hosts', 'participants'])
            ->orderByDesc('start_time')
            ->paginate(config('app.paginate'));
      return Inertia::render('Meetings/Index', [
    'meetings' => $meetings,
]);
    }

    public function create()
    {
        return Inertia::render('Meetings/Edit', [
            'meeting' => null,
            'users'   => User::select('id', 'name', 'email')->get(),
        ]);
    }

    public function store(Request $request, ZoomService $zoom)
    {
        $data = $request->validate([
            'topic'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time'  => 'required|date',
            'duration'    => 'required|integer|min:1',
            'host_id'     => 'required|exists:users,id',
            'participant_ids' => 'array',
            'participant_ids.*' => 'exists:users,id',
            'co_host_ids' => 'array',
            'co_host_ids.*' => 'exists:users,id',
        ]);
 try {
            DB::beginTransaction();
          $host = User::withTrashed()->findOrFail($data['host_id']);
          // 1) Create meeting record in our DB
          $meeting = Meeting::create([
                'created_by'      => $request->user()->id,
                'topic'           => $data['topic'],
                'description'     => $data['description'] ?? null,
                'start_time'      => $data['start_time'],
                'duration'        => $data['duration'],
                'zoom_host_email' => $host->email,
                'status'          => 'scheduled',
            ]);
            
            // 2) Build user ↔ role pivot array
            $coHostIds = collect($data['co_host_ids'] ?? [])
            ->unique()
            ->reject(fn ($id) => (int) $id === (int) $host->id);
            $participantIds = collect($data['participant_ids'] ?? [])
            ->unique()
            ->reject(fn ($id) => (int) $id === (int) $host->id)
            ->reject(fn ($id) => $coHostIds->contains($id)); 
            
            
            $sync = [
                $host->id => ['role' => 'teacher'],
            ];
            
            foreach ($coHostIds as $id) {
                $sync[$id] = ['role' => 'admin'];
            }
            
            foreach ($participantIds as $id) {
                $sync[$id] = ['role' => 'student'];
            }
            
            $meeting->users()->sync($sync);
            // 3) Create meeting on Zoom
            $coHostEmails = User::whereIn('id', $coHostIds)->pluck('email')->toArray();
            $participantEmails = User::whereIn('id', $participantIds)->pluck('email')->toArray();   
            $zoomMeeting = $zoom->createZoomMeeting($meeting, $host->email, $coHostEmails, $participantEmails);
        
        // 🟢 NEW — Log exact Zoom response
        // AuditLog::create([
        //     'user_id'    => $request->user()->id,
        //     'action'     => 'zoom_meeting_created',
        //     'model_type' => Meeting::class,
        //     'model_id'   => $meeting->id,
        //     'changes'    => [
        //         'request_sent_to_zoom' => [
        //             'meeting'       => $meeting,
        //             'topic'        => $meeting->topic,
        //             'description'  => $meeting->description,
        //             'duration'     => $meeting->duration,
        //             'start_time'   => $meeting->start_time,
        //             'host_email'   => $host->email,
        //         ],
        //         'zoom_response' => $zoomMeeting,   // <- FULL original Zoom response saved AS-IS
        //     ],
        //     'audience_sync' => [
        //         'teacher'      => $host->id,
        //         'co_hosts'     => $coHostIds->values(),
        //         'participants' => $participantIds->values(),
        //     ],
        // ]);

        // 4) Save Zoom data
        $meeting->update([
                'zoom_meeting_id' => $zoomMeeting['id']        ?? null,
                'zoom_uuid'       => $zoomMeeting['uuid']      ?? null,
            'start_url'       => $zoomMeeting['start_url'] ?? null,
            'join_url'        => $zoomMeeting['join_url']  ?? null,
        ]);
        // }
         DB::commit();
                return redirect()
                   ->route('meetings.index')
                   ->with('success', 'Meeting created successfully.');
  } catch (\Throwable $e) {
   DB::rollBack();
     report($e);

            return back()
                ->withErrors([
                    'zoom' => 'Unable to create Zoom meeting. Please try again.',
                ])
                ->withInput();
  }
        // $host = User::findOrFail($data['host_id']);

        // $meeting = Meeting::create([
        //     'created_by'      => $request->user()->id,
        //     'topic'           => $data['topic'],
        //     'description'     => $data['description'] ?? null,
        //     'start_time'      => $data['start_time'],
        //     'duration'        => $data['duration'],
        //     'zoom_host_email' => $host->email,
        // ]);

        // // Create on Zoom
        // $zoomMeeting = $zoom->createZoomMeeting($meeting, $host->email);

        // $meeting->update([
        //     'zoom_meeting_id' => $zoomMeeting['id'],
        //     'zoom_uuid'       => $zoomMeeting['uuid'] ?? null,
        //     'start_url'       => $zoomMeeting['start_url'] ?? null,
        //     'join_url'        => $zoomMeeting['join_url'] ?? null,
        // ]);

        // // Sync participants/host
        // $meeting->users()->sync([
        //     $host->id => ['role' => 'host'],
        //     // participants
        // ] + collect($data['participant_ids'] ?? [])->mapWithKeys(fn ($id) => [
        //     $id => ['role' => 'student'],
        // ])->toArray());

        // return redirect()->route('meetings.index')
        //     ->with('success', 'Meeting created successfully.');
    }

    public function edit(Meeting $meeting)
    {
        $meeting->load('users');
        dd(['meeting' => [
        'id'              => $meeting->id,
        'topic'           => $meeting->topic,
        'description'     => $meeting->description,
        'start_time'      => $meeting->start_time->format('Y-m-d\TH:i'),
        'duration'        => $meeting->duration,
        'host_id'         => $meeting->host_id,
        'co_host_ids'     => $meeting->co_host_ids,
        'participant_ids' => $meeting->participant_ids,
    ],]);
        return Inertia::render('Meetings/Edit', [
            'meeting' => [
        'id'              => $meeting->id,
        'topic'           => $meeting->topic,
        'description'     => $meeting->description,
        'start_time'      => $meeting->start_time->format('Y-m-d\TH:i'),
        'duration'        => $meeting->duration,
        'host_id'         => $meeting->host_id,
        'co_host_ids'     => $meeting->co_host_ids,
        'participant_ids' => $meeting->participant_ids,
    ],
            'users'   => User::select('id', 'name', 'email')->get(),
        ]);
    }

    public function update(Request $request, Meeting $meeting, ZoomService $zoom)
    {
        $data = $request->validate([
            'topic'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time'  => 'required|date',
            'duration'    => 'required|integer|min:1',
            'host_id'     => 'required|exists:users,id',
            'participant_ids' => 'array',
            'participant_ids.*' => 'exists:users,id',
        ]);

        $host = User::findOrFail($data['host_id']);

        $meeting->fill([
            'topic'           => $data['topic'],
            'description'     => $data['description'] ?? null,
            'start_time'      => $data['start_time'],
            'duration'        => $data['duration'],
            'zoom_host_email' => $host->email,
        ]);

        // Update on Zoom first
        if ($meeting->zoom_meeting_id) {
            $zoom->updateZoomMeeting($meeting);
        }

        $meeting->save();

        $meeting->users()->sync([
            $host->id => ['role' => 'host'],
        ] + collect($data['participant_ids'] ?? [])->mapWithKeys(fn ($id) => [
            $id => ['role' => 'student'],
        ])->toArray());

        return redirect()->route('meetings.index')
            ->with('success', 'Meeting updated successfully.');
    }

    public function destroy(Meeting $meeting, ZoomService $zoom)
    {
        if ($meeting->zoom_meeting_id) {
            $zoom->deleteZoomMeeting($meeting);
        }

        $meeting->update(['status' => 'cancelled']);
        $meeting->delete();

        return redirect()->route('meetings.index')
            ->with('success', 'Meeting cancelled and deleted.');
    }

    // App-side join route that decides host vs user URL
    public function join(Meeting $meeting, Request $request)
    {
        $user = $request->user();

        $role = $meeting->users()
            ->where('user_id', $user->id)
            ->first()
            ?->pivot
            ?->role;

        if ($role === 'host') {
            return redirect()->away($meeting->start_url);
        }

        return redirect()->away($meeting->join_url);
    }
}
