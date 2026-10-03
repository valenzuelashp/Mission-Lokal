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
        <Card className="shadow-xs border-slate-200/80 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700">
                    <FolderOpen className="h-4 w-4 text-blue-600" />
                    Verified Documents & Official Records
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
                {documents.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 text-center">No official verification documents uploaded.</p>
                ) : (
                    documents.map((doc) => (
                        <div
                            key={doc.id}
                            className={`flex items-center justify-between gap-3 rounded-xl border p-3 bg-slate-50/50 shadow-2xs transition-all hover:bg-white ${
                                doc.status === 'pending' ? 'opacity-60' : ''
                            }`}
                        >
                            <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-slate-900">{doc.name}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {doc.meta} · <span className="font-mono font-semibold text-slate-600">{doc.size}</span>
                                </p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 hover:bg-blue-50 text-blue-600 cursor-pointer" disabled={doc.status === 'pending'}>
                                {doc.status === 'pending' ? (
                                    <Eye className="h-4 w-4" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    ))
                )}
                <button
                    type="button"
                    onClick={onUploadClick}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 py-3 text-xs font-extrabold text-blue-700 transition-colors hover:bg-blue-50/50 cursor-pointer"
                >
                    <Plus className="h-4 w-4" />
                    Upload new document record
                </button>
            </CardContent>
        </Card>
    );
}