<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GenericNotificationMail extends Mailable
{
    use SerializesModels;

    public string $title;
    public string $bodyMessage;
    public string $viewName;
    public array $payload;

    public function __construct(string $title, string $bodyMessage, string $viewName = 'emails.generic-notification', array $payload = [])
    {
        $this->title = $title;
        $this->bodyMessage = $bodyMessage;
        $this->viewName = $viewName;
        $this->payload = $payload;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: $this->viewName,
        );
    }
}
