import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export async function downloadPdfAsPng(pdfUrl: string, fileName: string): Promise<void> {
    const response = await fetch(pdfUrl, {
        credentials: 'same-origin',
        headers: { Accept: 'application/pdf' },
    });

    if (!response.ok) {
        throw new Error(`PDF request failed with status ${response.status}`);
    }

    const pdf = await getDocument({ data: await response.arrayBuffer() }).promise;

    try {
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Canvas rendering is unavailable in this browser.');
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({ canvas, canvasContext: context, viewport }).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((result) => {
                if (result) resolve(result);
                else reject(new Error('PNG conversion failed.'));
            }, 'image/png');
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        canvas.width = 0;
        canvas.height = 0;
    } finally {
        await pdf.destroy();
    }
}