<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Enums\NotificationType;
use App\Models\ClassSession;
use App\Models\Doubt;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DoubtController extends Controller
{
    /**
     * Display a listing of doubts submitted by the logged-in student.
     */

    public function index(Request $request)
    {
        $student = auth()->user()->student;
        $data = \App\Services\DoubtService::getStudentDoubtData($student->id);
        return inertia('Student/doubt', [
            'recentDoubts'    => $data['recentDoubts'],
            'allowedSessions' => $data['allowedSessions'],
        ]);
    }

    /**
     * Show the form for creating a new doubt.
     */
    public function create()
    {
        return Inertia::render('Student/Doubts/Create');
    }

    /**
     * Store a newly created doubt in storage.
     */
    public function store(Request $request)
    {
        $student = auth()->user()->student;

        // --- VALIDATION ---
        $validated = $request->validate([
            'class_session_id' => ['required', 'exists:classes_sessions,id'],
            'question'         => ['required', 'string', 'max:2000'],
            'file'             => ['nullable', 'file', 'max:5120'], // 5MB
        ]);

        // --- GET CLASS SESSION & TEACHER ---
        $session = ClassSession::findOrFail($validated['class_session_id']);
        $now = now();

        // Ensure student belongs to this batch currently (active allocation).
        $isInActiveBatch = $student->batches()
            ->where('batch_id', $session->batch_id)
            ->wherePivot('status', 'active')
            ->where(function ($query) {
                $query->whereNull('batch_students.ended_at')
                    ->orWhere('batch_students.ended_at', '>', now());
            })
            ->exists();

        if (! $isInActiveBatch) {
            return back()->withErrors([
                'question' => 'You are not active in this batch.',
            ]);
        }

        // Student can ask doubt only after this class starts/completes.
        if ($session->class_date && $session->class_date->isFuture()) {
            return back()->withErrors([
                'question' => 'You can ask doubt only after the class starts.',
            ]);
        }

        // Rule: doubt allowed only before 1 hour of the next class
        // for the same batch + subject.
        $nextClass = ClassSession::query()
            ->where('batch_id', $session->batch_id)
            ->where('subject_id', $session->subject_id)
            ->where('class_date', '>', $now)
            ->whereIn('status', ['scheduled', 'rescheduled', 'completed'])
            ->orderBy('class_date')
            ->first();

        if ($nextClass) {
            $deadline = $nextClass->class_date->copy()->subHour();
            if ($now->gte($deadline)) {
                return back()->withErrors([
                    'question' => 'Doubt window closed. You can submit only until 1 hour before the next class (' . $nextClass->class_date->format('d M Y, h:i a') . ').',
                ]);
            }
        }

        $teacherId = $session->teacher_id;  // <-- THIS IS THE TEACHER WE WANT
        // --- CHECK IF STUDENT ALREADY ASKED FOR THIS CLASS ---
        $exists = Doubt::where('student_id', $student->id)
            ->where('classes_session_id', $validated['class_session_id'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'question' => 'You have already submitted a doubt for this class.',
            ]);
        }

        // --- FILE UPLOAD ---
        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store("doubts/" . $student->id, 'public');
        }
        //    if ($request->hasFile('attachment')) {
        //     $validated['attachment'] = $request->file('attachment')->store('doubts', 'public');
        // }

        // --- STORE NEW DOUBT ---
        $doubt = Doubt::create([
            'classes_session_id' => $validated['class_session_id'],
            'student_id'         => $student->id,
            'teacher_id'         => $teacherId, // Teacher replies later
            'question'           => $validated['question'],
            'attachment'         => $filePath,
            'status'             => 'open',
        ]);

        $teacherUser = $session->teacher?->user;
        if ($teacherUser) {
            app(NotificationService::class)->send(
                $teacherUser,
                title: 'New Doubt Submitted',
                message: "{$student->user?->name} posted a new doubt for session '{$session->topic}'.",
                type: NotificationType::CUSTOM,
                sendEmail: false,
                payload: [
                    'student_name' => $student->user?->name,
                    'topic' => $session->topic,
                    'batch_id' => $session->batch_id,
                    'action_text' => 'Open Doubts',
                    'action_url' => '/teacher/doubts',
                    'priority' => 'high',
                ],
                modelType: Doubt::class,
                modelId: $doubt->id
            );
        }

        return back()->with('success', 'Your doubt has been submitted!');
    }
    // public function store(Request $request)
    // {
    //     $validated = $request->validate([
    //         'classes_session_id' => 'required|exists:class_sessions,id',
    //         'question' => 'required|string|max:1000',
    //         'attachment' => 'nullable|file|mimes:jpg,png,pdf,docx|max:2048',
    //     ]);

    //     $validated['student_id'] = Auth::id();
    //     $validated['status'] = 'pending';

        // if ($request->hasFile('attachment')) {
        //     $validated['attachment'] = $request->file('attachment')->store('doubts', 'public');
        // }

    //     Doubt::create($validated);

    //     return redirect()->route('student.doubts.index')->with('success', 'Your doubt has been submitted successfully.');
    // }

    /**
     * Show the form for editing the specified doubt.
     */
    public function edit(Doubt $doubt)
    {
        $this->authorize('update', $doubt);

        return Inertia::render('Student/Doubts/Edit', [
            'doubt' => $doubt->load(['teacher', 'session']),
        ]);
    }

    /**
     * Update the specified doubt in storage.
     */
    public function update(Request $request, Doubt $doubt)
    {
        $this->authorize('update', $doubt);

        $validated = $request->validate([
            'question' => 'required|string|max:1000',
            'attachment' => 'nullable|file|mimes:jpg,png,pdf,docx|max:2048',
        ]);

        if ($request->hasFile('attachment')) {

            // 🔥 Delete old attachment if exists
            if ($doubt->attachment && Storage::disk('public')->exists($doubt->attachment)) {
                Storage::disk('public')->delete($doubt->attachment);
            }

            // ✅ Store new file (relative path only)
            $validated['attachment'] = $request
                ->file('attachment')
                ->store('doubts/' . $doubt->student_id, 'public');
        }


        $doubt->update($validated);

        return back()->with('success', 'Doubt updated successfully.');
    }

    /**
     * Remove the specified doubt from storage.
     */
    public function destroy(Doubt $doubt)
    {
        $this->authorize('delete', $doubt);

        $doubt->delete();

        return back()->with('success', 'Doubt deleted successfully.');
    }
}
