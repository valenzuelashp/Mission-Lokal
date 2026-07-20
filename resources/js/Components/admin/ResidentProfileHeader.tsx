import { Link } from '@inertiajs/react';
import { BadgeCheck, Flag, Mail, Pencil, User } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import type { AdminResidentDetail, VerificationStatus } from '@/Types';

const verifiedLabel: Record<VerificationStatus, string> = {
    approved: 'Verified resident profile',
    pending: 'Pending validation protocol',
    in_progress: 'Identity verification phase',
    rejected: 'Verification interface blocked',
};

type Props = {
    resident: AdminResidentDetail;
};

export default function ResidentProfileHeader({ resident }: Props) {
    const isApproved = resident.verification_status === 'approved';
    const memberId = resident.digital_id_code ?? resident.account_id;

    return (
        <Card className="mb-6 border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="flex flex-col gap-5 p-5 sm:gap-6 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4 sm:gap-5">
                    <div className="relative shrink-0">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-neutral-800 shadow-2xs sm:h-20 sm:w-20">
                            <User className="h-7 w-7 sm:h-9 sm:w-9 stroke-[1.5]" />
                        </div>
                        {isApproved && (
                            <span className="absolute -bottom-1 -right-1 flex h-6 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-md ring-2 ring-white">
                                <BadgeCheck className="h-4 w-4 stroke-[2.5]" />
                            </span>
                        )}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                        <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 sm:text-2xl">{resident.full_name}</h2>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
                            Staged {resident.joined_at}
                            {memberId && (
                                <>
                                    {' '}· Code: <span className="font-mono tracking-normal lowercase font-bold text-neutral-800 normal-case bg-neutral-100 px-1 rounded border border-neutral-200/50">{memberId}</span>
                                </>
                            )}
                        </p>
                        <Badge
                            className={`rounded-xl border px-3 py-1 text-[10px] font-black uppercase tracking-widest mt-2.5 shadow-3xs transition-all ${
                                isApproved
                                    ? 'bg-neutral-900 text-white border-transparent'
                                    : resident.verification_status === 'rejected'
                                      ? 'bg-neutral-100 border-neutral-200 text-neutral-400 opacity-60'
                                      : 'bg-white border-neutral-200 text-neutral-500'
                            }`}
                        >
                            {verifiedLabel[resident.verification_status]}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                    <Button className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-black uppercase tracking-widest text-[10px] h-9 shadow-sm transition-all active:scale-[0.97] sm:w-auto px-4" size="sm">
                        <Pencil className="mr-2 h-3.5 w-3.5 stroke-[2.5]" />
                        Modify Registry
                    </Button>
                    <Button size="sm" variant="outline" className="w-full border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 font-black uppercase tracking-widest text-[10px] h-9 shadow-sm transition-all active:scale-[0.97] sm:w-auto px-4">
                        <Flag className="mr-2 h-3.5 w-3.5 text-neutral-400 stroke-[2.5]" />
                        Flag Account Node
                    </Button>
                    <Button size="sm" variant="outline" className="w-full border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-black uppercase tracking-widest text-[10px] h-9 shadow-sm transition-all active:scale-[0.97] sm:w-auto px-4">
                        <Mail className="mr-2 h-3.5 w-3.5 text-neutral-400 stroke-[2.5]" />
                        Transmit Message
                    </Button>
                    {(resident.verification_status === 'pending' ||
                        resident.verification_status === 'in_progress') && (
                        <Button size="sm" variant="outline" className="w-full border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-black uppercase tracking-widest text-[10px] h-9 shadow-sm sm:w-auto px-4" asChild>
                            <Link href="/admin/verifications">Audit Protocol</Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}