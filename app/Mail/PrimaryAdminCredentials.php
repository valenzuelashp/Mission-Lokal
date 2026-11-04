<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PrimaryAdminCredentials extends Mailable
{
    use Queueable, SerializesModels;

    public $adminData;

    public function __construct(array $adminData)
    {
        $this->adminData = $adminData;
    }

    public function build()
    {
        $adminType = $this->adminData['admin_type_label'] ?? 'Primary Administrator';

        return $this->subject('Mission-Lokal - '.$adminType.' Credentials')
                    ->view('emails.admin_credentials');
    }
}