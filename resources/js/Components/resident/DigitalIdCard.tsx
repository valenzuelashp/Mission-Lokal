import { BadgeCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

type Props = {
    fullName: string;
    verificationToken: string | null;
    memberSince: string;
    isVerified: boolean;
};

export default function DigitalIdCard({ fullName, verificationToken, memberSince, isVerified }: Props) {
    const theme = useResidentTheme();
    const qrValue = verificationToken
        ? new URL(`/verify-id/${encodeURIComponent(verificationToken)}`, window.location.origin).toString()
        : '';

    return (
        <Card className={`digital-id-card overflow-hidden border ${theme.cardBorder} bg-white/90 text-slate-950 shadow-xl rounded-3xl`}>
            <CardContent className="p-7 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">Official Municipal Digital ID</p>
                        <p className="mt-2 break-words text-xl font-black tracking-tight text-slate-950">{fullName}</p>
                    </div>

                    <div className="shrink-0 bg-white p-3 rounded-2xl border border-white/25 shadow-md">
                        {verificationToken && isVerified ? (
                            <QRCodeSVG
                                value={qrValue}
                                size={104}
                                level="M"
                                title="Scan to verify this municipal resident ID"
                                className="h-20 w-20 rounded object-contain"
                            />
                        ) : (
                            <div className={`flex h-20 w-20 items-center justify-center ${theme.accentSurface} ${theme.textMuted} text-[10px] text-center p-1 font-bold rounded`}>
                                Pending ID
                            </div>
                        )}
                    </div>
                </div>

                <div className={`space-y-2.5 border-t ${theme.dividerColor} pt-5 text-xs font-medium`}>
                    <div className="flex justify-between gap-2">
                        <span className="text-slate-700">Digital ID verification</span>
                        <span className="font-black text-slate-950">{isVerified ? 'Ready to scan' : 'Pending verification'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-700">Member Since</span>
                        <span className="font-black text-slate-950">{memberSince}</span>
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