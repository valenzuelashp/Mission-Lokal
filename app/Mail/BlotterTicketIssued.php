<?php

namespace App\Mail;

use App\Models\Blotter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BlotterTicketIssued extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Blotter $blotter)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Mission-Lokal: E-Blotter Ticket Issued (' . $this->blotter->ticket_number . ')',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.blotters.ticket',
        );
    }
}