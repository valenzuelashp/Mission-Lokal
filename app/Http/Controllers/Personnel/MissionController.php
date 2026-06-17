<?php

namespace App\Http\Controllers\Personnel;

use App\Http\Controllers\Controller;
use App\Support\DemoPersonnelMissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MissionController extends Controller
{
    public function index(Request $request): Response
    {
        $accountId = $request->user()->account_id;

        return Inertia::render('Personnel/Missions/Index', [
            'missions' => DemoPersonnelMissions::all($accountId),
            'counts' => DemoPersonnelMissions::counts($accountId),
        ]);
    }

    public function show(Request $request, string $mission): Response
    {
        $accountId = $request->user()->account_id;
        $data = DemoPersonnelMissions::find($accountId, $mission);

        abort_if($data === null, 404);

        return Inertia::render('Personnel/Missions/Show', [
            'mission' => $data,
        ]);
    }

    public function updateStatus(Request $request, string $mission): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:acknowledged,in_progress,completed'],
        ]);

        $accountId = $request->user()->account_id;

        if (! DemoPersonnelMissions::updateStatus($accountId, $mission, $request->string('status')->toString())) {
            abort(404);
        }

        return back()->with('success', 'Mission status updated.');
    }

    public function toggleChecklist(Request $request, string $mission): RedirectResponse
    {
        $request->validate([
            'item_id' => ['required', 'string'],
        ]);

        $accountId = $request->user()->account_id;

        if (! DemoPersonnelMissions::toggleChecklist($accountId, $mission, $request->string('item_id')->toString())) {
            abort(404);
        }

        return back();
    }

    public function proofForm(Request $request, string $mission): Response
    {
        $accountId = $request->user()->account_id;
        $data = DemoPersonnelMissions::find($accountId, $mission);

        abort_if($data === null, 404);

        return Inertia::render('Personnel/Missions/Proof', [
            'mission' => $data,
        ]);
    }

    public function storeProof(Request $request, string $mission): RedirectResponse
    {
        $request->validate([
            'notes' => ['required', 'string', 'max:2000'],
        ]);

        $accountId = $request->user()->account_id;

        if (! DemoPersonnelMissions::markProofSubmitted($accountId, $mission)) {
            abort(404);
        }

        return redirect()
            ->route('personnel.missions.show', $mission)
            ->with('success', 'Proof submitted. Awaiting admin verification.');
    }
}
