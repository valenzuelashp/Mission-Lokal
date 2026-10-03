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
import { useResidentTheme } from '@/Layouts/ResidentLayout';

const verificationBadge: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'outline' }> = {
    approved: { label: 'Verified', variant: 'success' },
    pending: { label: 'Pending', variant: 'warning' },
    in_progress: { label: 'Under review', variant: 'warning' },
    rejected: { label: 'Rejected', variant: 'danger' },
};

export default function ProfileIndex({ profile }: { profile: any }) {
    const theme = useResidentTheme();
    const { user } = useAuth();

    if (!user) return null;

    const activeProfile = profile ?? {
        full_name: user.account_id ?? 'Verified Resident',
        address: 'No address registered',
        birthday: '—',
        verification_status: 'unverified',
        digital_id_code: 'ML-PENDING',
        member_since: 'July 2026',
        report_count: 0,
        edit_status: 'approved',
        badges: []
    };

    const statusKey = activeProfile.verification_status ?? 'unverified';
    const status = verificationBadge[statusKey] || { label: 'Unverified', variant: 'outline' as const };
    const isPendingEdit = activeProfile.edit_status === 'pending_approval';
    const isVerifiedUser = statusKey === 'approved';

    const rightAside = (
        <>
            <DigitalIdCard
                fullName={activeProfile.full_name}
                accountId={user.account_id}
                digitalIdCode={activeProfile.digital_id_code}
                memberSince={activeProfile.member_since}
                isVerified={isVerifiedUser}
            />
            <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                <CardHeader className={`pb-3 border-b ${theme.dividerColor}`}>
                    <CardTitle className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2.5 pt-4">
                    <Button variant="outline" className={`justify-start font-bold text-xs shadow-2xs cursor-pointer ${theme.cardBorder} ${theme.cardBg} ${theme.textMain} ${theme.hoverBg}`} disabled={isPendingEdit} asChild={!isPendingEdit}>
                        {isPendingEdit ? (
                            <>
                                <Pencil className={`mr-2 h-4 w-4 ${theme.textMuted}`} />
                                Edit Locked (Pending Admin Review)
                            </>
                        ) : (
                            <Link href="/profile/edit">
                                <Pencil className={`mr-2 h-4 w-4 ${theme.primaryText}`} />
                                Update Contact Details
                            </Link>
                        )}
                    </Button>
                    <Button variant="outline" className={`justify-start font-bold text-xs shadow-2xs cursor-pointer ${theme.cardBorder} ${theme.cardBg} ${theme.textMain} ${theme.hoverBg}`} asChild>
                        <Link href="/profile/security">
                            <Lock className={`mr-2 h-4 w-4 ${theme.primaryText}`} />
                            Security Password Settings
                        </Link>
                    </Button>
                    <div className={`pt-2 border-t ${theme.dividerColor}`}>
                        <ResidentLogoutButton variant="outline" className="w-full text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50" />
                    </div>
                </CardContent>
            </Card>
        </>
    );

    return (
        <ResidentLayout wide>
            <Head title="Resident Profile" />

            {isPendingEdit && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-xs font-bold text-amber-900 shadow-2xs animate-pulse">
                    <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                    <p className="leading-relaxed">
                        You have pending profile modifications currently awaiting administrative review. Account editing is temporarily locked.
                    </p>
                </div>
            )}

            <ResidentSocialShell right={rightAside}>
                <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                    <CardContent className="p-6">
                        <h1 className={`text-2xl font-black ${theme.textMain} tracking-tight`}>Resident Profile Dashboard</h1>
                        <p className={`mt-1 text-xs sm:text-sm font-medium ${theme.textMuted}`}>
                            Official municipal account details, cryptographic digital ID, and civic participation metrics.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Civic XP Score" value={user.civic_xp ?? 50} icon={Award} hint="Earned from verified reports" />
                    <StatCard label="Total Reports" value={activeProfile.report_count ?? 0} icon={FileText} hint="Community submissions" />
                    <StatCard label="Verification Status" value={status.label} icon={Shield} hint={`State: ${statusKey}`} />
                </div>

                <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                    <CardHeader className={`flex flex-row items-center justify-between pb-3 border-b ${theme.dividerColor}`}>
                        <CardTitle className={`text-sm font-black uppercase tracking-wider ${theme.textMain}`}>Official Resident Details</CardTitle>
                        <Badge variant={status.variant} className="font-bold">{status.label}</Badge>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <dl className="grid gap-4 sm:grid-cols-2 text-xs">
                            <div>
                                <dt className={`font-black uppercase tracking-wider ${theme.textMuted}`}>
                                    Full Registered Name
                                </dt>
                                <dd className={`mt-1 font-bold ${theme.textMain} text-sm`}>{activeProfile.full_name}</dd>
                            </div>
                            <div>
                                <dt className={`font-black uppercase tracking-wider ${theme.textMuted}`}>
                                    Date of Birth
                                </dt>
                                <dd className={`mt-1 font-bold ${theme.textMain} text-sm`}>{activeProfile.birthday}</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className={`font-black uppercase tracking-wider ${theme.textMuted}`}>
                                    Physical Address
                                </dt>
                                <dd className={`mt-1 font-bold ${theme.textMain} text-sm`}>{activeProfile.address}</dd>
                            </div>
                            <div>
                                <dt className={`font-black uppercase tracking-wider ${theme.textMuted}`}>
                                    Email Address
                                </dt>
                                <dd className={`mt-1 font-bold ${theme.textMain} font-mono text-xs`}>{profile?.email ?? user.email}</dd>
                            </div>
                            <div>
                                <dt className={`font-black uppercase tracking-wider ${theme.textMuted}`}>
                                    Mobile Number
                                </dt>
                                <dd className={`mt-1 font-bold ${theme.textMain} font-mono text-xs`}>{profile?.mobile ?? (user.mobile ?? '—')}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                    <CardHeader className={`pb-3 border-b ${theme.dividerColor}`}>
                        <CardTitle className={`text-sm font-black uppercase tracking-wider ${theme.textMain}`}>Civic Badges & Achievements</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {activeProfile.badges.length === 0 ? (
                            <p className={`text-xs ${theme.textMuted} font-medium`}>Submit valid community concerns to unlock achievement badges.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {activeProfile.badges.map((badge: any) => (
                                    <Badge key={badge.id} variant="outline" className={`gap-1.5 py-1.5 px-3 font-bold ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                                        <Award className={`h-3.5 w-3.5 ${theme.primaryText}`} />
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