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
        <Card className="mb-8 shadow-2xs border-blue-200/80 bg-gradient-to-r from-blue-50/60 via-white to-white rounded-3xl overflow-hidden">
            <CardContent className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-5 sm:gap-6">
                    <div className="relative shrink-0">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 shadow-sm border border-blue-200 sm:h-24 sm:w-24 font-black">
                            <User className="h-10 w-10 sm:h-12 sm:w-12" />
                        </div>
                        {isVerified && (
                            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white ring-4 ring-white shadow-md">
                                <BadgeCheck className="h-5 w-5" />
                            </span>
                        )}
                    </div>
                    <div className="min-w-0 space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 sm:text-3xl tracking-tight">{resident.full_name}</h2>
                        <p className="text-xs font-semibold text-slate-500">
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
                                "mt-3 font-extrabold text-xs uppercase tracking-wider px-3.5 py-1.5 shadow-2xs",
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

                <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
                    <Button onClick={onEdit} className="w-full bg-blue-600 hover:bg-blue-700 text-white sm:w-auto shadow-sm font-bold cursor-pointer rounded-2xl h-11 px-5 text-xs" size="sm">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Information
                    </Button>
                    <Button onClick={onFlag} disabled={isFlagging} size="sm" variant="destructive" className="w-full sm:w-auto shadow-sm font-bold cursor-pointer rounded-2xl h-11 px-5 text-xs bg-rose-600 hover:bg-rose-700">
                        <Flag className="mr-2 h-4 w-4" />
                        {resident.is_active === false ? 'Unflag Account' : 'Flag Account'}
                    </Button>
                    <Button onClick={onMessage} size="sm" variant="outline" className="w-full border-blue-600 text-blue-700 hover:bg-blue-50 sm:w-auto shadow-2xs font-bold cursor-pointer rounded-2xl h-11 px-5 text-xs bg-white">
                        <Mail className="mr-2 h-4 w-4" />
                        Message Resident
                    </Button>
                    {(resident.verification_status === 'pending' ||
                        resident.verification_status === 'in_progress') && (
                        <Button size="sm" variant="outline" className="w-full sm:w-auto shadow-2xs font-bold cursor-pointer rounded-2xl h-11 px-5 text-xs bg-white border-slate-200" asChild>
                            <Link href="/admin/verifications">Review Verification</Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}