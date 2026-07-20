import { Download, Eye, FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import type { AdminResidentDocument } from '@/Types';

type Props = {
    documents: AdminResidentDocument[];
};

export default function ResidentDocumentsList({ documents }: Props) {
    return (
        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3.5 bg-white/40 border-b border-neutral-100 px-5 py-4">
                <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-800">
                    <FolderOpen className="h-4 w-4 text-neutral-400 stroke-[2.5]" />
                    Document Repository
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
                {documents.length === 0 ? (
                    <p className="py-2 text-xs font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50/20 p-3 rounded-xl border border-dashed border-neutral-200">No core documents uploaded onto file.</p>
                ) : (
                    documents.map((doc) => (
                        <div
                            key={doc.id}
                            className={`flex items-center justify-between gap-4 rounded-xl border border-neutral-200/80 bg-white/90 p-3.5 shadow-2xs transition-all ${
                                doc.status === 'pending' ? 'opacity-55' : ''
                            }`}
                        >
                            <div className="min-w-0 space-y-0.5">
                                <p className="truncate text-xs font-black tracking-tight text-neutral-900">{doc.name}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                                    {doc.meta} <span className="text-neutral-300 font-light">•</span> <span className="tabular-nums font-medium font-sans text-xs normal-case text-neutral-400/80">{doc.size}</span>
                                </p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg border border-neutral-200 bg-neutral-50/50 text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900 shrink-0 shadow-3xs transition-all active:scale-95" disabled={doc.status === 'pending'}>
                                {doc.status === 'pending' ? (
                                    <Eye className="h-3.5 w-3.5 stroke-[2.5]" />
                                ) : (
                                    <Download className="h-3.5 w-3.5 stroke-[2.5]" />
                                )}
                            </Button>
                        </div>
                    ))
                )}
                <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-white/30 py-3.5 text-xs font-black uppercase tracking-widest text-neutral-500 shadow-3xs transition-all hover:bg-white hover:border-neutral-900 hover:text-neutral-900 active:scale-[0.99]"
                >
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                    Upload document node
                </button>
            </CardContent>
        </Card>
    );
}