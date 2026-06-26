<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;

    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Mission-Lokal Password Reset Code',
        );
    }

    public function content(): Content
    {
        // We will pass the OTP code directly into a simple markdown template
        return new Content(
            markdown: 'emails.auth.otp',
            with: [
                'otp' => $this->otp,
            ],
        );
    }
}