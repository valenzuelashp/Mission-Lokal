<?php

namespace Tests\Feature;

use Barryvdh\DomPDF\Facade\Pdf;
use Tests\TestCase;

class QuarterlyReportPdfTest extends TestCase
{
    public function test_quarterly_report_template_renders_to_pdf(): void
    {
        $pdf = Pdf::loadView('pdf.dilg-quarterly', [
            'barangay' => [
                'name' => 'Barangay San Isidro Norte Extension',
                'code' => 'SAMPLE-01',
                'city' => 'Sample City',
                'province' => 'Sample Province',
                'address' => 'Barangay Hall, Long Sample Street, Sample City, Sample Province',
                'contact_phone' => '0000000000',
                'contact_email' => 'office@example.test',
            ],
            'period' => ['quarter' => 1, 'year' => 2026, 'start' => 'January 1, 2026', 'end' => 'March 31, 2026'],
            'generated_at' => 'April 1, 2026 9:00 AM',
            'summary' => [
                'concerns_received' => 128,
                'concerns_resolved' => 64,
                'concerns_in_progress' => 28,
                'concerns_pending' => 12,
                'concerns_rejected' => 24,
                'missions_assigned' => 48,
                'missions_verified' => 41,
                'average_resolution_hours' => 36.5,
                'blotters_received' => 17,
            ],
            'categories' => [],
            'pdf_categories' => array_map(fn ($category, $index) => (object) [
                'category' => $category,
                'total' => 30 - $index,
            ], [
                'Public Safety and Order Long Category Name',
                'Infrastructure and Utilities Long Category Name',
                'Sanitation and Environment Long Category Name',
                'Katarungang Pambarangay Long Category Name',
                'Community Services Long Category Name',
                'Other categories',
            ], range(0, 5)),
            'severities' => array_map(fn ($severity, $index) => (object) [
                'severity' => $severity,
                'total' => 20 - $index,
            ], ['low', 'medium', 'high', 'critical', 'unclassified'], range(0, 4)),
            'blotter_statuses' => array_map(fn ($status, $index) => (object) [
                'status' => $status,
                'total' => 10 - $index,
            ], ['pending_approval', 'filed', 'mediated', 'resolved', 'archived', 'rejected'], range(0, 5)),
        ]);

        self::assertStringStartsWith('%PDF-', $pdf->output());
        self::assertSame(1, $pdf->getDomPDF()->getCanvas()->get_page_count());
    }

    public function test_civic_certificate_template_fits_one_landscape_page(): void
    {
        $pdf = Pdf::loadView('pdf.civic-certificate', [
            'residentName' => 'Maria Elizabeth Santos-Ramirez de la Cruz',
            'barangayName' => 'Barangay San Isidro Norte Extension',
            'badgeName' => 'Civic Leader',
            'civicXp' => 100,
            'issuedAt' => 'November 7, 2026',
        ])->setPaper('a4', 'landscape');

        self::assertStringStartsWith('%PDF-', $pdf->output());
        self::assertSame(1, $pdf->getDomPDF()->getCanvas()->get_page_count());
    }
}