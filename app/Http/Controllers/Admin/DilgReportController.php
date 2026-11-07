<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DilgReportController extends Controller
{
    public function index(Request $request): Response
    {
        $data = $this->reportData($request);

        return Inertia::render('Admin/DilgReports/Index', [
            ...$data,
            'years' => range(now()->year, max(2020, now()->year - 6)),
        ]);
    }

    public function pdf(Request $request)
    {
        $data = $this->reportData($request);
        $pdf = Pdf::loadView('pdf.dilg-quarterly', $data)->setPaper('a4', 'portrait');

        return $pdf->download('barangay-quarterly-report-Q'.$data['period']['quarter'].'-'.$data['period']['year'].'.pdf');
    }

    private function reportData(Request $request): array
    {
        $validated = $request->validate([
            'quarter' => ['nullable', 'integer', 'between:1,4'],
            'year' => ['nullable', 'integer', 'between:2020,'.now()->year],
        ]);

        $quarter = (int) ($validated['quarter'] ?? now()->quarter);
        $year = (int) ($validated['year'] ?? now()->year);
        $start = Carbon::create($year, (($quarter - 1) * 3) + 1, 1)->startOfDay();
        $end = $start->copy()->addMonths(3)->subSecond();
        $barangay = $request->user()->barangay;
        $barangayId = $request->user()->barangay_id;

        $concerns = DB::table('concerns')
            ->where('barangay_id', $barangayId)
            ->whereBetween('created_at', [$start, $end]);
        $totalConcerns = (clone $concerns)->count();
        $concernStatuses = (clone $concerns)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $categories = DB::table('concerns')
            ->leftJoin('concern_categories', 'concerns.category_id', '=', 'concern_categories.id')
            ->where('concerns.barangay_id', $barangayId)
            ->whereBetween('concerns.created_at', [$start, $end])
            ->selectRaw("COALESCE(concern_categories.name, 'Unclassified') as category, COUNT(*) as total")
            ->groupBy('category')
            ->orderBy('category')
            ->get();
        $pdfCategories = $categories->take(5)->values();
        $otherCategoryCount = (int) $categories->slice(5)->sum('total');
        if ($otherCategoryCount > 0) {
            $pdfCategories->push((object) ['category' => 'Other categories', 'total' => $otherCategoryCount]);
        }

        $severities = DB::table('concerns')
            ->where('barangay_id', $barangayId)
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw("COALESCE(severity, 'Unclassified') as severity, COUNT(*) as total")
            ->groupBy('severity')
            ->orderBy('severity')
            ->get();

        $verifiedMissions = DB::table('missions')
            ->where('barangay_id', $barangayId)
            ->whereNotNull('verified_at')
            ->whereBetween('verified_at', [$start, $end])
            ->get(['created_at', 'verified_at']);
        $resolutionHours = $verifiedMissions
            ->map(fn ($mission) => Carbon::parse($mission->created_at)->diffInSeconds(Carbon::parse($mission->verified_at)) / 3600);

        $blotterStatuses = DB::table('blotters')
            ->where('barangay_id', $barangayId)
            ->whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->orderBy('status')
            ->get();

        return [
            'barangay' => [
                'name' => $barangay?->name ?? 'Barangay',
                'code' => $barangay?->code ?? 'N/A',
                'city' => $barangay?->city ?? null,
                'province' => $barangay?->province ?? null,
                'address' => implode(', ', array_filter([
                    $barangay?->house_street,
                    $barangay?->city,
                    $barangay?->province,
                ])),
                'contact_email' => $barangay?->contact_email,
                'contact_phone' => $barangay?->contact_phone,
            ],
            'period' => [
                'quarter' => $quarter,
                'year' => $year,
                'start' => $start->format('F j, Y'),
                'end' => $end->format('F j, Y'),
            ],
            'generated_at' => now()->format('F j, Y g:i A'),
            'summary' => [
                'concerns_received' => $totalConcerns,
                'concerns_resolved' => (int) ($concernStatuses['resolved'] ?? 0) + (int) ($concernStatuses['closed'] ?? 0),
                'concerns_in_progress' => (int) ($concernStatuses['active'] ?? 0) + (int) ($concernStatuses['under_review'] ?? 0) + (int) ($concernStatuses['ai_processed'] ?? 0),
                'concerns_pending' => (int) ($concernStatuses['submitted'] ?? 0),
                'concerns_rejected' => (int) ($concernStatuses['rejected'] ?? 0) + (int) ($concernStatuses['spam'] ?? 0),
                'missions_assigned' => DB::table('missions')->where('barangay_id', $barangayId)->whereBetween('created_at', [$start, $end])->count(),
                'missions_verified' => $verifiedMissions->count(),
                'average_resolution_hours' => $resolutionHours->isEmpty() ? null : round($resolutionHours->avg(), 1),
                'blotters_received' => DB::table('blotters')->where('barangay_id', $barangayId)->whereBetween('created_at', [$start, $end])->count(),
            ],
            'categories' => $categories,
            'pdf_categories' => $pdfCategories,
            'severities' => $severities,
            'blotter_statuses' => $blotterStatuses,
        ];
    }
}