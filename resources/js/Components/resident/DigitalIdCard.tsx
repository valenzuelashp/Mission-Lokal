import { BadgeCheck } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

type Props = {
    fullName: string;
    accountId: string;
    digitalIdCode: string | null;
    memberSince: string;
    isVerified: boolean;
};

export default function DigitalIdCard({ fullName, accountId, digitalIdCode, memberSince, isVerified }: Props) {
    const theme = useResidentTheme();
    const qrValue = digitalIdCode 
        ? `https://mission-lokal.test/verify-id/${digitalIdCode}` 
        : `MISSION-LOKAL-${accountId}`;
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}&color=00000`;

    return (
        <Card className={`overflow-hidden border ${theme.cardBorder} ${theme.primaryBg} text-white shadow-lg rounded-2xl`}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Official Municipal Digital ID</p>
                        <p className="mt-2 break-words text-lg font-black tracking-tight">{fullName}</p>
                        <p className="truncate font-mono text-xs font-bold opacity-90 mt-0.5">{accountId}</p>
                    </div>

                    <div className="shrink-0 bg-white p-2.5 rounded-2xl border border-white/25 shadow-md">
                        {digitalIdCode ? (
                            <img 
                                src={qrCodeUrl} 
                                alt="Digital ID QR Code" 
                                className="h-20 w-20 rounded object-contain"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center bg-slate-100 text-[10px] text-slate-500 text-center p-1 font-bold">
                                Pending ID
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-white/15 pt-4 text-xs font-medium">
                    <div className="flex justify-between gap-2">
                        <span className="shrink-0 opacity-80">Secure Digital Hash Code</span>
                        <span className="truncate font-mono font-bold text-white">{digitalIdCode ?? 'Pending Verification'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-80">Member Since</span>
                        <span className="font-bold text-white">{memberSince}</span>
                    </div>
                </div>

                {isVerified && (
                    <Badge className={`mt-5 gap-1.5 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border font-black uppercase tracking-wider text-[10px] px-3 py-1 shadow-2xs`}>
                        <BadgeCheck className="h-4 w-4" />
                        Verified Municipal Resident
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
}