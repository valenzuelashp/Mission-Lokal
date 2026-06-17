import { BadgeCheck, QrCode } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';

type Props = {
    fullName: string;
    accountId: string;
    digitalIdCode: string | null;
    memberSince: string;
};

export default function DigitalIdCard({ fullName, accountId, digitalIdCode, memberSince }: Props) {
    return (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-primary">Barangay digital ID</p>
                        <p className="mt-2 break-words text-lg font-bold">{fullName}</p>
                        <p className="truncate font-mono text-sm text-muted-foreground">{accountId}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <QrCode className="h-6 w-6" />
                    </div>
                </div>
                <div className="mt-4 space-y-2 border-t border-primary/10 pt-4 text-sm">
                    <div className="flex justify-between gap-2">
                        <span className="shrink-0 text-muted-foreground">Digital ID</span>
                        <span className="truncate font-mono font-medium">{digitalIdCode ?? 'Pending'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Member since</span>
                        <span className="font-medium">{memberSince}</span>
                    </div>
                </div>
                {digitalIdCode && (
                    <Badge className="mt-4 gap-1 bg-emerald-600 hover:bg-emerald-600">
                        <BadgeCheck className="h-3 w-3" />
                        Verified resident
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
}
