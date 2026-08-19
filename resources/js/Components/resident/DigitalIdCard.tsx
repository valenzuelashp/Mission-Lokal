import { BadgeCheck } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';

type Props = {
    fullName: string;
    accountId: string;
    digitalIdCode: string | null;
    memberSince: string;
};

export default function DigitalIdCard({ fullName, accountId, digitalIdCode, memberSince }: Props) {
    // Generate secure verification URL payload for the QR code
    const qrValue = digitalIdCode 
        ? `https://mission-lokal.test/verify-id/${digitalIdCode}` 
        : `MISSION-LOKAL-${accountId}`;
    
    // API generating a clean 200x200 pixel matrix grid for crystal clear camera scanning
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}&color=0f766e`;

    return (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-md">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-primary">Barangay digital ID</p>
                        <p className="mt-2 break-words text-lg font-bold text-slate-900">{fullName}</p>
                        <p className="truncate font-mono text-sm text-muted-foreground">{accountId}</p>
                    </div>

                    {/* SCANNABLE QR CODE BOX */}
                    <div className="shrink-0 bg-white p-2 rounded-xl border border-primary/20 shadow-sm">
                        {digitalIdCode ? (
                            <img 
                                src={qrCodeUrl} 
                                alt="Digital ID QR Code" 
                                className="h-20 w-20 rounded object-contain"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center bg-slate-100 text-[10px] text-muted-foreground text-center p-1 font-medium">
                                Pending ID
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-primary/10 pt-4 text-sm">
                    <div className="flex justify-between gap-2">
                        <span className="shrink-0 text-muted-foreground">Digital ID</span>
                        <span className="truncate font-mono font-medium text-slate-800">{digitalIdCode ?? 'Pending'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Member since</span>
                        <span className="font-medium text-slate-800">{memberSince}</span>
                    </div>
                </div>

                {digitalIdCode && (
                    <Badge className="mt-4 gap-1 bg-emerald-600 hover:bg-emerald-600 text-white">
                        <BadgeCheck className="h-3 w-3" />
                        Verified resident
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
}