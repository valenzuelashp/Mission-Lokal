<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificationApproved extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $rawPassword;

    public function __construct(User $user, string $rawPassword)
    {
        $this->user = $user;
        $this->rawPassword = $rawPassword;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Mission-Lokal: ID Verification Approved',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification.approved',
        );
    }
}