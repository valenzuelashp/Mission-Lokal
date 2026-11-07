<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        @page { size: A4 landscape; margin: 9mm; }
        html, body { margin: 0; padding: 0; }
        body { color: #17211d; font-family: DejaVu Sans, sans-serif; text-align: center; }
        .sheet { border: 10px double #24765b; box-sizing: border-box; height: 183mm; margin: 12mm auto 0; padding: 0; width: 276mm; }
        .content { display: table; height: 100%; width: 100%; }
        .content-inner { display: table-cell; padding: 36mm 10mm 10mm; text-align: center; vertical-align: middle; }
        .eyebrow { color: #24765b; font-size: 14px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; }
        h1 { font-family: DejaVu Serif, serif; font-size: 34px; margin: 0 0 16px; }
        .intro-text { font-size: 13px; margin: 0 0 16px; }
        .name { border-bottom: 1px solid #9aa8a0; display: block; font-family: DejaVu Serif, serif; font-size: 28px; margin: 0 auto 20px; max-width: 220mm; padding: 0 12px 10px; }
        .reason-text { font-size: 13px; margin: 0 0 18px; }
        .award { color: #24765b; font-size: 22px; font-weight: bold; margin: 0 0 24px; }
        .meta-group { margin-top: 16px; }
        .meta { color: #52635a; font-size: 11px; margin: 4px 0; }
    </style>
</head>
<body>
    <section class="sheet">
        <div class="content"><div class="content-inner">
            <p class="eyebrow">{{ $barangayName }} | Mission-Lokal</p>
            <h1>Certificate of Civic Recognition</h1>
            <p class="intro-text">This certificate is presented to</p>
            <p class="name">{{ $residentName }}</p>
            <p class="reason-text">in recognition of sustained, verified participation in the community.</p>
            <p class="award">{{ $badgeName }}</p>
            <div class="meta-group">
                <p class="meta">Civic XP: {{ $civicXp }} | Issued {{ $issuedAt }}</p>
                <p class="meta">Recognition is based on verified platform activity and is not a government-issued credential.</p>
            </div>
        </div></div>
    </section>
</body>
</html>