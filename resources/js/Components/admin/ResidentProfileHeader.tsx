import { Link } from '@inertiajs/react';
import { BadgeCheck, Flag, Mail, Pencil, User } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import type { AdminResidentDetail, VerificationStatus } from '@/Types';

const verifiedLabel: Record<VerificationStatus, string> = {
    approved: 'Verified resident',
    pending: 'Pending verification',
    in_progress: 'ID under review',
    rejected: 'Verification rejected',
};

type Props = {
    resident: AdminResidentDetail;
};

export default function ResidentProfileHeader({ resident }: Props) {
    const isVerified = resident.verification_status === 'approved';
    const memberId = resident.digital_id_code ?? resident.account_id;

    return (
        <Card className="mb-6 shadow-sm">
            <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-5">
                    <div className="relative shrink-0">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                            <User className="h-10 w-10" />
                        </div>
                        {isVerified && (
                            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white ring-2 ring-white">
                                <BadgeCheck className="h-4 w-4" />
                            </span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{resident.full_name}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Member since {resident.joined_at}
                            {memberId && (
                                <>
                                    {' '}
                                    · ID: <span className="font-mono">{memberId}</span>
                                </>
                            )}
                        </p>
                        <Badge
                            className={
                                isVerified
                                    ? 'mt-3 bg-emerald-600 uppercase tracking-wide hover:bg-emerald-600'
                                    : 'mt-3 uppercase tracking-wide'
                            }
                            variant={isVerified ? 'default' : resident.verification_status === 'rejected' ? 'danger' : 'warning'}
                        >
                            {verifiedLabel[resident.verification_status]}
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button className="bg-blue-700 hover:bg-blue-800" size="sm">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit information
                    </Button>
                    <Button size="sm" variant="destructive">
                        <Flag className="mr-2 h-4 w-4" />
                        Flag account
                    </Button>
                    <Button size="sm" variant="outline" className="border-blue-700 text-blue-700">
                        <Mail className="mr-2 h-4 w-4" />
                        Message resident
                    </Button>
                    {(resident.verification_status === 'pending' ||
                        resident.verification_status === 'in_progress') && (
                        <Button size="sm" variant="outline" asChild>
                            <Link href="/admin/verifications">Review verification</Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
