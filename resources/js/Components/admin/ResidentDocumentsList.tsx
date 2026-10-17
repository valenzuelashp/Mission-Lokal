import { Download, Eye, FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import type { AdminResidentDocument } from '@/Types';

type Props = {
    documents: AdminResidentDocument[];
    onUploadClick: () => void;
};

export default function ResidentDocumentsList({ documents, onUploadClick }: Props) {
    return (
        <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                    <FolderOpen className="h-4 w-4 text-blue-600" />
                    Verified Documents & Official Records
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                    {documents.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-6 text-center font-semibold">No official verification documents uploaded.</p>
                    ) : (
                        documents.map((doc) => (
                            <div
                                key={doc.id}
                                className={`flex items-center justify-between gap-3 rounded-2xl border p-4 bg-slate-50/50 shadow-2xs transition-all hover:bg-white ${
                                    doc.status === 'pending' ? 'opacity-60' : ''
                                }`}
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-extrabold text-slate-900">{doc.name}</p>
                                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                                        {doc.meta} · <span className="font-mono text-slate-600">{doc.size}</span>
                                    </p>
                                </div>
                                <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0 hover:bg-blue-50 text-blue-600 cursor-pointer rounded-xl" disabled={doc.status === 'pending'}>
                                    {doc.status === 'pending' ? (
                                        <Eye className="h-4 w-4" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
                <button
                    type="button"
                    onClick={onUploadClick}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 py-4 text-xs font-extrabold text-blue-700 transition-colors hover:bg-blue-50/50 cursor-pointer shadow-2xs"
                >
                    <Plus className="h-4 w-4" />
                    Upload new document record
                </button>
            </CardContent>
        </Card>
    );
}