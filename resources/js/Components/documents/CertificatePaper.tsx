type PaperSize = 'show' | 'short' | 'long' | 'a4';

const frames: Record<PaperSize, string> = {
    show: 'w-full',
    short: 'mx-auto w-full max-w-[8.5in] aspect-[8.5/11]',
    long: 'mx-auto w-full max-w-[8.5in] aspect-[8.5/13]',
    a4: 'mx-auto w-full max-w-[210mm] aspect-[210/297]',
};

const pageSizes: Record<Exclude<PaperSize, 'show'>, string> = {
    short: '8.5in 11in',
    long: '8.5in 13in',
    a4: 'A4',
};

type Props = {
    paperSize: PaperSize;
    title: string;
    barangayName: string | null;
    body: string;
    issuedOn: string;
    signatoryName: string | null;
    signatoryTitle: string;
    signatureUrl: string | null;
};

export default function CertificatePaper({
    paperSize,
    title,
    barangayName,
    body,
    issuedOn,
    signatoryName,
    signatoryTitle,
    signatureUrl,
}: Props) {
    const printable = paperSize !== 'show';

    return (
        <>
            {printable && (
                <style>{`
                    @media print {
                        @page { size: ${pageSizes[paperSize]}; margin: 0.6in; }
                        header, nav, aside, .no-print { display: none !important; }
                        main { padding: 0 !important; background: white !important; max-width: none !important; }
                        .certificate-sheet { width: 100% !important; max-width: none !important; aspect-ratio: auto !important; border: 0 !important; box-shadow: none !important; }
                    }
                `}</style>
            )}
            <article className={`certificate-sheet overflow-hidden border border-slate-300 bg-white p-8 text-slate-900 shadow-sm sm:p-10 ${frames[paperSize]}`}>
                <p className="text-center text-[10px] font-black uppercase tracking-[0.2em]">Republic of the Philippines</p>
                <p className="mt-1 text-center text-sm font-black">{barangayName ?? 'Barangay'}</p>
                <h2 className="mt-6 text-center text-base font-black uppercase tracking-wide">{title}</h2>
                <p className="mt-6 whitespace-pre-wrap text-sm leading-7">{body}</p>
                <p className="mt-4 text-sm">Date: {issuedOn}</p>
                <div className="mt-10 text-center">
                    {signatureUrl && (
                        <img src={signatureUrl} alt="Barangay signature" className="mx-auto mb-1 h-16 w-40 object-contain" />
                    )}
                    <p className="text-sm font-black">{signatoryName || '________________'}</p>
                    <p className="text-xs font-semibold">{signatoryTitle}</p>
                </div>
            </article>
        </>
    );
}

export function canPrintPaper(paperSize: string): boolean {
    return paperSize === 'short' || paperSize === 'long' || paperSize === 'a4';
}
