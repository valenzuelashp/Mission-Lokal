import { Head, Link } from '@inertiajs/react';
import { Award, FileText, Lock, Pencil, Shield, AlertCircle } from 'lucide-react';
import DigitalIdCard from '@/Components/resident/DigitalIdCard';
import ResidentLogoutButton from '@/Components/resident/ResidentLogoutButton';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import StatCard from '@/Components/shared/StatCard';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { useAuth } from '@/Hooks/usePageProps';
import ResidentLayout from '@/Layouts/ResidentLayout';

const verificationBadge = {
    approved: { label: 'Verified', variant: 'success' as const },
    pending: { label: 'Pending', variant: 'warning' as const },
    in_progress: { label: 'Under review', variant: 'warning' as const },
    rejected: { label: 'Rejected', variant: 'danger' as const },
};

// FIX: Cast incoming profile data structure straight to an open object schema to clear strict TS index errors
export default function Profile({ profile }: { profile: any }) {
    const { user } = useAuth();

    if (!user) return null;

    const activeProfile = profile ?? {
        full_name: user.account_id ?? 'Verified Resident',
        address: 'No address registered',
        birthday: '—',
        digital_id_code: 'ML-PENDING',
        member_since: 'July 2026',
        report_count: 0,
        edit_status: 'approved',
        badges: []
    };

    const status = verificationBadge[user.verification_status] || { label: 'Unverified', variant: 'outline' as const };
    const isPendingEdit = activeProfile.edit_status === 'pending_approval';

    const rightAside = (
        <>
            <DigitalIdCard
                fullName={activeProfile.full_name}
                accountId={user.account_id}
                digitalIdCode={activeProfile.digital_id_code}
                memberSince={activeProfile.member_since}
            />
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Quick actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button variant="outline" className="justify-start" disabled={isPendingEdit} asChild={!isPendingEdit}>
                        {isPendingEdit ? (
                            <>
                                <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                                Edit Locked (Pending)
                            </>
                        ) : (
                            <Link href="/profile/edit">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit profile
                            </Link>
                        )}
                    </Button>
                    <Button variant="outline" className="justify-start" asChild>
                        <Link href="/profile/security">
                            <Lock className="mr-2 h-4 w-4" />
                            Security settings
                        </Link>
                    </Button>
                    <ResidentLogoutButton variant="outline" className="w-full" />
                </CardContent>
            </Card>
        </>
    );

    return (
        <ResidentLayout wide>
            <Head title="Profile" />

            {isPendingEdit && (
                <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm animate-pulse">
                    <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                    <p className="font-medium">
                        You have profile modifications currently awaiting administrative verification. Your account editing dashboard will lock until this review finishes.
                    </p>
                </div>
            )}

            <ResidentSocialShell right={rightAside}>
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <h1 className="text-xl font-bold">My profile</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Account details, digital ID, and civic participation.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Civic XP" value={user.civic_xp} icon={Award} hint="Earn more by reporting" />
                    <StatCard label="Reports" value={activeProfile.report_count} icon={FileText} hint="Your submissions" />
                    <StatCard label="Status" value={status.label} icon={Shield} hint={user.verification_status} />
                </div>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Resident info</CardTitle>
                        <Badge variant={status.variant}>{status.label}</Badge>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Full name
                                </dt>
                                <dd className="mt-1 font-medium">{activeProfile.full_name}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Birthday
                                </dt>
                                <dd className="mt-1 font-medium">{activeProfile.birthday}</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Address
                                </dt>
                                <dd className="mt-1 font-medium">{activeProfile.address}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Email
                                </dt>
                                <dd className="mt-1 font-medium">{profile?.email ?? user.email}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Mobile
                                </dt>
                                <dd className="mt-1 font-medium">{profile?.mobile ?? (user.mobile ?? '—')}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Badges earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activeProfile.badges.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Report concerns to earn badges.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {activeProfile.badges.map((badge: any) => (
                                    <Badge key={badge.id} variant="outline" className="gap-1 py-1.5">
                                        <Award className="h-3 w-3" />
                                        {badge.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </ResidentSocialShell>
        </ResidentLayout>
    );
}