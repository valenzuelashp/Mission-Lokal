<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ViewOnlyAdminCredentials extends Mailable
{
    use Queueable, SerializesModels;

    public $adminData;

    public function __construct(array $adminData)
    {
        $this->adminData = $adminData;
    }

    public function build()
    {
        return $this->subject('Mission-Lokal - View-Only Official Credentials')
                    ->view('emails.view_only_credentials');
    }
}