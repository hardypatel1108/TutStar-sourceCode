<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TeacherRegisteredMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public string $password;
    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $password)
    {
        $this->user = $user;
         $this->password = $password;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Welcome to TutStar 🎉')
            ->view('emails.teacher_registered')
            ->with([
                'user'       => $this->user,
                'password' => $this->password,
            ]);
    }
}
