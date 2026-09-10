<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PrivacyPolicyController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Legal/Privacy');
    }
}
