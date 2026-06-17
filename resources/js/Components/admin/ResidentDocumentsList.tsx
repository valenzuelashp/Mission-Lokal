import { Download, Eye, FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import type { AdminResidentDocument } from '@/Types';

type Props = {
    documents: AdminResidentDocument[];
};

export default function ResidentDocumentsList({ documents }: Props) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    Documents
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents on file.</p>
                ) : (
                    documents.map((doc) => (
                        <div
                            key={doc.id}
                            className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                                doc.status === 'pending' ? 'opacity-60' : ''
                            }`}
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {doc.meta} · {doc.size}
                                </p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" disabled={doc.status === 'pending'}>
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
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                >
                    <Plus className="h-4 w-4" />
                    Upload new document
                </button>
            </CardContent>
        </Card>
    );
}
