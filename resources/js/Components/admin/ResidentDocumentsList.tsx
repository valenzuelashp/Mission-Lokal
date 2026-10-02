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
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    Verified documents & records
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No official documents on file.</p>
                ) : (
                    documents.map((doc) => (
                        <div
                            key={doc.id}
                            className={`flex items-center justify-between gap-3 rounded-lg border p-3 bg-white shadow-sm transition-all ${
                                doc.status === 'pending' ? 'opacity-60' : ''
                            }`}
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-gray-900">{doc.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {doc.meta} · <span className="font-mono text-gray-600">{doc.size}</span>
                                </p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 hover:bg-blue-50 text-blue-600" disabled={doc.status === 'pending'}>
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
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50/50"
                >
                    <Plus className="h-4 w-4" />
                    Upload new document
                </button>
            </CardContent>
        </Card>
    );
}