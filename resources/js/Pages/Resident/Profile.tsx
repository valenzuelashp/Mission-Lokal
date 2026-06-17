import { Head, Link } from '@inertiajs/react';
import { Award, FileText, Lock, Pencil, Shield } from 'lucide-react';
import DigitalIdCard from '@/Components/resident/DigitalIdCard';
import ResidentLogoutButton from '@/Components/resident/ResidentLogoutButton';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import StatCard from '@/Components/shared/StatCard';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { useAuth } from '@/Hooks/usePageProps';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { demoResidentProfile } from '@/Lib/residentDemo';
import type { ProfilePageProps } from '@/Types';

const verificationBadge = {
    approved: { label: 'Verified', variant: 'success' as const },
    pending: { label: 'Pending', variant: 'warning' as const },
    in_progress: { label: 'Under review', variant: 'warning' as const },
    rejected: { label: 'Rejected', variant: 'danger' as const },
};

export default function Profile(props: Partial<ProfilePageProps>) {
    const { user } = useAuth();
    const profile = props.profile ?? demoResidentProfile;

    if (!user) return null;

    const status = verificationBadge[user.verification_status];

    const rightAside = (
        <>
            <DigitalIdCard
                fullName={profile.full_name}
                accountId={user.account_id}
                digitalIdCode={profile.digital_id_code}
                memberSince={profile.member_since}
            />
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Quick actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button variant="outline" className="justify-start" asChild>
                        <Link href="/profile/edit">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit profile
                        </Link>
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
                    <StatCard label="Reports" value={profile.report_count} icon={FileText} hint="Your submissions" />
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
                                <dd className="mt-1 font-medium">{profile.full_name}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Birthday
                                </dt>
                                <dd className="mt-1 font-medium">{profile.birthday}</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Address
                                </dt>
                                <dd className="mt-1 font-medium">{profile.address}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Email
                                </dt>
                                <dd className="mt-1 font-medium">{user.email ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Mobile
                                </dt>
                                <dd className="mt-1 font-medium">{user.mobile ?? '—'}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Badges earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {profile.badges.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Report concerns to earn badges.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {profile.badges.map((badge) => (
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
