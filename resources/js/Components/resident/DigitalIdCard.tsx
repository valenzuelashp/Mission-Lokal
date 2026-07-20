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
        <Card className="overflow-hidden border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl">
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Barangay digital ID</p>
                        <p className="mt-1.5 break-words text-base font-black text-neutral-950 tracking-tight leading-tight">{fullName}</p>
                        <p className="mt-0.5 truncate font-mono text-xs font-semibold text-neutral-400">{accountId}</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 border border-neutral-200/40 shadow-inner">
                        <QrCode className="h-5 w-5" />
                    </div>
                </div>
                
                <div className="mt-4 space-y-2.5 border-t border-neutral-100/80 pt-3.5 text-xs font-medium text-neutral-600">
                    <div className="flex justify-between gap-2">
                        <span className="shrink-0 text-neutral-400 font-semibold">Digital ID</span>
                        <span className="truncate font-mono font-bold text-neutral-800">{digitalIdCode ?? 'Pending'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-400 font-semibold">Member since</span>
                        <span className="font-bold text-neutral-800">{memberSince}</span>
                    </div>
                </div>
                
                {digitalIdCode && (
                    <Badge className="mt-4 gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-none">
                        <BadgeCheck className="h-3 w-3 text-neutral-400" />
                        Verified resident
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
}