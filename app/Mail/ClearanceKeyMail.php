<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClearanceKeyMail extends Mailable
{
    use Queueable, SerializesModels;

    public $key;

    public function __construct($key)
    {
        $this->key = $key;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Mission-Lokal: Super Admin Clearance Key',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.auth.clearance_key',
            with: [
                'key' => $this->key,
            ],
        );
    }
}