import { Link } from '@inertiajs/react';
import { BadgeCheck, Flag, Mail, Pencil, User } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import type { AdminResidentDetail, VerificationStatus } from '@/Types';
import { cn } from '@/Lib/utils';

const verifiedLabel: Record<VerificationStatus, string> = {
    approved: 'Verified Resident Profile',
    pending: 'Pending Verification',
    in_progress: 'ID Under Review',
    rejected: 'Verification Rejected',
};

type Props = {
    resident: AdminResidentDetail;
    onEdit: () => void;
    onFlag: () => void;
    onMessage: () => void;
    isFlagging?: boolean;
};

export default function ResidentProfileHeader({ resident, onEdit, onFlag, onMessage, isFlagging }: Props) {
    const isVerified = resident.verification_status === 'approved';
    const memberId = resident.digital_id_code ?? resident.account_id;

    return (
        <Card className="mb-6 shadow-xs border-blue-200/80 bg-gradient-to-r from-blue-50/60 via-white to-white">
            <CardContent className="flex flex-col gap-5 p-5 sm:gap-6 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4 sm:gap-5">
                    <div className="relative shrink-0">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-sm border border-blue-200 sm:h-20 sm:w-20 font-black">
                            <User className="h-8 w-8 sm:h-10 sm:w-10" />
                        </div>
                        {isVerified && (
                            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white ring-2 ring-white shadow-xs">
                                <BadgeCheck className="h-4 w-4" />
                            </span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl font-black text-slate-900 sm:text-2xl tracking-tight">{resident.full_name}</h2>
                        <p className="mt-1 text-xs font-medium text-slate-600">
                            Registered Member · Joined {resident.joined_at}
                            {memberId && (
                                <>
                                    {' '}
                                    · ID: <span className="font-mono font-bold text-blue-800">{memberId}</span>
                                </>
                            )}
                        </p>
                        <Badge
                            className={cn(
                                "mt-3 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1",
                                isVerified
                                    ? 'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-600'
                                    : resident.verification_status === 'rejected'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-amber-500 text-white'
                            )}
                        >
                            {verifiedLabel[resident.verification_status]}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap">
                    <Button onClick={onEdit} className="w-full bg-blue-700 hover:bg-blue-800 sm:w-auto shadow-xs font-bold cursor-pointer" size="sm">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Information
                    </Button>
                    <Button onClick={onFlag} disabled={isFlagging} size="sm" variant="destructive" className="w-full sm:w-auto shadow-xs font-bold cursor-pointer">
                        <Flag className="mr-2 h-4 w-4" />
                        {resident.is_active === false ? 'Unflag Account' : 'Flag Account'}
                    </Button>
                    <Button onClick={onMessage} size="sm" variant="outline" className="w-full border-blue-600 text-blue-700 hover:bg-blue-50 sm:w-auto shadow-xs font-bold cursor-pointer">
                        <Mail className="mr-2 h-4 w-4" />
                        Message Resident
                    </Button>
                    {(resident.verification_status === 'pending' ||
                        resident.verification_status === 'in_progress') && (
                        <Button size="sm" variant="outline" className="w-full sm:w-auto shadow-xs font-bold cursor-pointer" asChild>
                            <Link href="/admin/verifications">Review Verification</Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}