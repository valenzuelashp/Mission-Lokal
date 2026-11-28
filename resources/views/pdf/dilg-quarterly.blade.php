<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        @page { size: A4 portrait; margin: 6mm 8mm; }
        body { color: #17211d; font-family: DejaVu Sans, sans-serif; font-size: 9.5px; line-height: 1.25; }
        .letterhead { margin-bottom: 6px; text-align: center; }
        .republic { font-size: 9.5px; }
        .jurisdiction { color: #394b42; font-size: 9.5px; }
        .barangay { font-size: 12.5px; font-weight: bold; text-transform: uppercase; }
        .office-title { color: #52635a; font-size: 8.5px; font-weight: bold; letter-spacing: 1px; margin-top: 3px; }
        .rule { border-top: 2px solid #245e47; height: 0; margin: 6px 0; }
        h1 { color: #145c45; font-size: 18px; margin: 0 0 4px; text-align: center; }
        h2 { border-bottom: 1px solid #cbd5d0; color: #204637; font-size: 11px; margin: 6px 0 3px; padding-bottom: 2px; }
        p { line-height: 1.25; margin: 2px 0; }
        table { border-collapse: collapse; margin-top: 4px; width: 100%; }
        th, td { border-bottom: 1px solid #dfe6e2; padding: 4px 6px; text-align: left; }
        th { background: #f0f5f2; color: #244b3b; font-size: 9.5px; }
        .right { text-align: right; }
        .meta { color: #50635a; font-size: 9px; }
        .office { background: #f5f8f6; border: 1px solid #dfe6e2; margin-top: 5px; padding: 4px 8px; }
        .summary { table-layout: fixed; }
        .summary td { border: 1px solid #dfe6e2; padding: 5px; width: 25%; font-size: 9.5px; }
        .summary strong { color: #145c45; display: block; font-size: 14px; margin-top: 2px; }
        .columns { table-layout: fixed; }
        .columns > tbody > tr > td { border: 0; padding: 0 10.8px 0 0; vertical-align: top; width: 50%; }
        .columns > tbody > tr > td:last-child { padding: 0 0 0 10.8px; }
        .average { background: #edf5f0; border-left: 3px solid #24765b; margin-top: 5px; padding: 4px 8px; }
        .signatures { margin-top: 5px; }
        .signatures td { border: 0; height: 12mm; padding: 3mm 16px 0 0; vertical-align: bottom; width: 50%; }
        .line { border-top: 1px solid #59665f; min-height: 6mm; padding-top: 4px; }
    </style>
</head>
<body>
    <header class="letterhead">
        <p class="republic">Republic of the Philippines</p>
        @if ($barangay['province'])<p class="jurisdiction">Province of {{ $barangay['province'] }}</p>@endif
        @if ($barangay['city'])<p class="jurisdiction">City / Municipality of {{ $barangay['city'] }}</p>@endif
        <p class="barangay">{{ $barangay['name'] }}</p>
        <p class="office-title">OFFICE OF THE PUNONG BARANGAY</p>
        <div class="rule"></div>
    </header>
    <h1>Barangay Quarterly Incident and Service Accomplishment Report</h1>
    <p class="meta">Mission-Lokal aggregate operational report | Q{{ $period['quarter'] }} {{ $period['year'] }} | {{ $period['start'] }} to {{ $period['end'] }}</p>
    <div class="office">
        <p><strong>Barangay:</strong> {{ $barangay['name'] }} ({{ $barangay['code'] }})</p>
        <p><strong>Office address:</strong> {{ $barangay['address'] ?: 'Not provided' }}</p>
        <p><strong>Contact:</strong> {{ $barangay['contact_phone'] ?: 'Not provided' }} | {{ $barangay['contact_email'] ?: 'Not provided' }} | <strong>Generated:</strong> {{ $generated_at }}</p>
    </div>

    <h2>Quarterly operational summary</h2>
    <p class="meta">Concern and blotter status counts are current values for cases received this quarter.</p>
    <table class="summary"><tbody>
        <tr>
            <td>Concerns received<strong>{{ $summary['concerns_received'] }}</strong></td>
            <td>Resolved / closed<strong>{{ $summary['concerns_resolved'] }}</strong></td>
            <td>Under review / active<strong>{{ $summary['concerns_in_progress'] }}</strong></td>
            <td>Pending review<strong>{{ $summary['concerns_pending'] }}</strong></td>
        </tr>
        <tr>
            <td>Rejected / spam<strong>{{ $summary['concerns_rejected'] }}</strong></td>
            <td>Missions assigned<strong>{{ $summary['missions_assigned'] }}</strong></td>
            <td>Missions verified<strong>{{ $summary['missions_verified'] }}</strong></td>
            <td>Blotters received<strong>{{ $summary['blotters_received'] }}</strong></td>
        </tr>
    </tbody></table>
    <p class="average"><strong>Average mission-to-verification time:</strong> {{ $summary['average_resolution_hours'] === null ? 'No verified missions' : $summary['average_resolution_hours'].' hours' }}</p>

    <table class="columns"><tbody><tr>
        <td>
            <h2>Concerns by category</h2>
            <table><thead><tr><th>Category</th><th class="right">Reports</th></tr></thead><tbody>
                @forelse ($pdf_categories as $row)
                    <tr><td>{{ $row->category }}</td><td class="right">{{ $row->total }}</td></tr>
                @empty
                    <tr><td colspan="2">No concerns recorded.</td></tr>
                @endforelse
            </tbody></table>
        </td>
        <td>
            <h2>Concerns by severity</h2>
            <table><thead><tr><th>Severity</th><th class="right">Reports</th></tr></thead><tbody>
                @forelse ($severities as $row)
                    <tr><td>{{ ucfirst($row->severity) }}</td><td class="right">{{ $row->total }}</td></tr>
                @empty
                    <tr><td colspan="2">No severity records.</td></tr>
                @endforelse
            </tbody></table>
        </td>
    </tr></tbody></table>

    <h2>Blotter cases by current status</h2>
    <table><thead><tr><th>Status</th><th class="right">Cases</th></tr></thead><tbody>
        @forelse ($blotter_statuses as $row)
            <tr><td>{{ ucwords(str_replace('_', ' ', $row->status)) }}</td><td class="right">{{ $row->total }}</td></tr>
        @empty
            <tr><td colspan="2">No blotter cases filed.</td></tr>
        @endforelse
    </tbody></table>

    <table class="signatures"><tr>
        <td><div class="line">Prepared by / Designation</div></td>
        <td><div class="line">Punong Barangay / Authorized Signatory</div></td>
    </tr></table>
</body>
</html>