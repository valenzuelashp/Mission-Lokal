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
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}&color=000000`;

    return (
        <Card className={`overflow-hidden border ${theme.cardBorder} ${theme.primaryBg} text-white shadow-xl rounded-3xl`}>
            <CardContent className="p-7 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-85">Official Municipal Digital ID</p>
                        <p className="mt-2 break-words text-xl font-black tracking-tight">{fullName}</p>
                        <p className="truncate font-mono text-xs font-bold opacity-90 mt-1">{accountId}</p>
                    </div>

                    <div className="shrink-0 bg-white p-3 rounded-2xl border border-white/25 shadow-md">
                        {digitalIdCode ? (
                            <img 
                                src={qrCodeUrl} 
                                alt="Digital ID QR Code" 
                                className="h-20 w-20 rounded object-contain"
                            />
                        ) : (
                            <div className={`flex h-20 w-20 items-center justify-center ${theme.accentSurface} ${theme.textMuted} text-[10px] text-center p-1 font-bold rounded`}>
                                Pending ID
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2.5 border-t border-white/20 pt-5 text-xs font-medium">
                    <div className="flex justify-between gap-2">
                        <span className="shrink-0 opacity-85">Secure Digital Hash Code</span>
                        <span className="truncate font-mono font-black text-white">{digitalIdCode ?? 'Pending Verification'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-85">Member Since</span>
                        <span className="font-black text-white">{memberSince}</span>
                    </div>
                </div>

                {isVerified && (
                    <Badge className={`gap-2 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border font-black uppercase tracking-wider text-[10px] px-3.5 py-1.5 rounded-xl shadow-2xs`}>
                        <BadgeCheck className="h-4 w-4" />
                        Verified Municipal Resident
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
}