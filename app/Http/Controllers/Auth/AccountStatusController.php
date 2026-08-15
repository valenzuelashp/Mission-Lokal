<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PreloadedResident;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountStatusController extends Controller
{
    public function search(Request $request): Response
    {
        $query = trim($request->input('query'));
        $result = null;

        if ($query) {
            // Clean up query terms
            $terms = array_values(array_filter(explode(' ', preg_replace('/[^a-zA-Z0-9\s]/', '', $query))));

            $user = null;

            if (count($terms) >= 2) {
                // Precise exact matching for First and Last name using standard LIKE (MariaDB is case-insensitive by default)
                $firstName = $terms[0];
                $lastName = end($terms);

                $user = User::where('role', 'resident')
                    ->where('first_name', 'like', $firstName)
                    ->where('last_name', 'like', $lastName)
                    ->first();

                // Fallback check in preloaded_residents if not mapped to user yet
                if (!$user) {
                    $preloaded = PreloadedResident::where('first_name', 'like', $firstName)
                        ->where('last_name', 'like', $lastName)
                        ->first();

                    if ($preloaded) {
                        $user = User::where('account_id', $preloaded->account_id)->first();
                    }
                }
            }

            if ($user) {
                $status = $user->verification_status?->value ?? $user->verification_status ?? 'unverified';
                $result = [
                    'full_name' => trim("{$user->first_name} {$user->middle_name} {$user->last_name} {$user->name_extension}"),
                    'status' => $status,
                    'message' => $this->getStatusMessage($status),
                ];
            } else {
                $result = [
                    'not_found' => true,
                    'message' => 'No exact match found. Please enter your complete First Name and Last Name (e.g. Theo Amro Talag).',
                ];
            }
        }

        return Inertia::render('Auth/AccountStatus', [
            'searchResult' => $result,
            'query' => $query,
        ]);
    }

    private function getStatusMessage(string $status): string
    {
        return match ($status) {
            'unverified' => 'Your record exists in the barangay system, but you have not registered yet. Please click "Proceed to Registration Form" to submit your details and Government ID.',
            'pending' => 'Your registration has been submitted and is waiting in the admin verification queue for review.',
            'in_progress' => 'An administrator is currently reviewing and comparing your submitted details against barangay records.',
            'approved' => 'Your account has been approved! Please check your email inbox for your temporary login credentials.',
            'rejected' => 'Your application requires resubmission or correction of details. Please check your email for the reason specified by the admin.',
            default => 'Unknown status.',
        };
    }
}