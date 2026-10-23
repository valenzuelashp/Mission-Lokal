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
    city: string | null;
    contactPhone: string | null;
    logoUrl: string | null;
    body: string;
    issuedDay: string;
    issuedMonth: string;
    issuedYear: string;
    signatoryName: string | null;
    signatoryTitle: string;
    signatureUrl: string | null;
};

export default function CertificatePaper({
    paperSize,
    title,
    barangayName,
    city,
    contactPhone,
    logoUrl,
    body,
    issuedDay,
    issuedMonth,
    issuedYear,
    signatoryName,
    signatoryTitle,
    signatureUrl,
}: Props) {
    const printable = paperSize !== 'show';
    const seal = (side: string) => (
        logoUrl ? (
            <img src={logoUrl} alt={`${side} seal`} className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
        ) : (
            <span className="block h-16 w-16 sm:h-20 sm:w-20" />
        )
    );

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
            <article className={`certificate-sheet overflow-hidden border border-slate-300 bg-white p-8 font-serif text-[13px] leading-relaxed text-black shadow-sm sm:p-10 ${frames[paperSize]}`}>
                <div className="grid grid-cols-[4.5rem_1fr_4.5rem] items-center gap-3 sm:grid-cols-[5rem_1fr_5rem]">
                    <div className="justify-self-center">{seal('Left')}</div>
                    <div className="text-center">
                        <p>Republic of the Philippines</p>
                        {city && <p>{city}</p>}
                        <p className="text-[15px] font-bold uppercase">{barangayName ?? 'Barangay'}</p>
                        {contactPhone && <p>Mobile No. {contactPhone}</p>}
                    </div>
                    <div className="justify-self-center">{seal('Right')}</div>
                </div>
                <div className="mt-2 h-[2px] bg-red-700" />
                <div className="mt-0.5 h-[3px] bg-black" />
                <h2 className="mt-5 text-center text-[15px] font-bold uppercase tracking-wide">{title}</h2>
                <p className="mt-5 font-bold">TO WHOM IT MAY CONCERN:</p>
                <p className="mt-4 whitespace-pre-wrap text-justify leading-6">{body}</p>
                <p className="mt-4">
                    Given this <span className="underline">{issuedDay}</span> day of <span className="underline">{issuedMonth}</span>, {issuedYear}.
                </p>
                <div className="ml-auto mt-10 w-56 text-center">
                    <p>Approved By:</p>
                    {signatureUrl && (
                        <img src={signatureUrl} alt="Barangay signature" className="mx-auto my-1 h-14 w-36 object-contain" />
                    )}
                    <p className="font-bold uppercase">{signatoryName || '________________'}</p>
                    <p>{signatoryTitle}</p>
                </div>
            </article>
        </>
    );
}

export function canPrintPaper(paperSize: string): boolean {
    return paperSize === 'short' || paperSize === 'long' || paperSize === 'a4';
}
