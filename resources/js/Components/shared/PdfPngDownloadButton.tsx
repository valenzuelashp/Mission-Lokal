import { useState } from 'react';
import { Download, ImageDown, LoaderCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { downloadPdfAsPng } from '@/Lib/downloadPdfAsPng';

type Props = {
    pdfUrl: string;
    fileName: string;
    label?: string;
    className?: string;
};

export default function PdfPngDownloadButton({ pdfUrl, fileName, label = 'PNG', className }: Props) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await downloadPdfAsPng(pdfUrl, fileName);
        } catch (error) {
            console.error('PNG export failed.', error);
            window.alert('Could not create the PNG. Please try the PDF download instead.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Button type="button" variant="outline" disabled={isDownloading} onClick={handleDownload} className={className}>
            {isDownloading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImageDown className="h-4 w-4" />}
            <span>{isDownloading ? 'Preparing PNG…' : label}</span>
            {!isDownloading && <Download className="h-3.5 w-3.5 opacity-60" />}
        </Button>
    );
}