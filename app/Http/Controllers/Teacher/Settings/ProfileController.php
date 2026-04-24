<?php

namespace App\Http\Controllers\Teacher\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\TeacherSettings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $teacher = auth()->user()
            ->teacher()
            ->with([
                'teachingExperiences.clazz',
                'teachingExperiences.subject',
            ])
            ->first();

        return Inertia::render('Teacher/settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'teacherProfile' => $teacher,
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        // 🖼 Profile image update
        if ($request->hasFile('profile_image')) {
            if ($user->profile_image && \Storage::disk('public')->exists($user->profile_image)) {
                \Storage::disk('public')->delete($user->profile_image);
            }

            $path = $request->file('profile_image')
                ->store('teacher/profile-images', 'public');

            \Spatie\Image\Image::load(storage_path("app/public/{$path}"))
                ->crop(300, 300)
                ->optimize()
                ->save();

            $user->profile_image = $path;
        }

        // ✉️ Email & phone
        $user->email = $request->email;
        $user->phone = $request->phone;

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return to_route('teacher.profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
