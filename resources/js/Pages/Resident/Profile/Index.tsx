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
        <div className="space-y-6">
            <DigitalIdCard
                fullName={activeProfile.full_name}
                accountId={user.account_id}
                digitalIdCode={activeProfile.digital_id_code}
                memberSince={activeProfile.member_since}
                isVerified={isVerifiedUser}
            />
            <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                <CardHeader className={`pb-4 border-b ${theme.dividerColor}`}>
                    <CardTitle className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-5">
                    <Button variant="outline" className={`justify-start font-bold text-xs shadow-2xs cursor-pointer ${theme.cardBorder} ${theme.cardBg} ${theme.textMain} ${theme.hoverBg} rounded-2xl h-11 px-4`} disabled={isPendingEdit} asChild={!isPendingEdit}>
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
                    <Button variant="outline" className={`justify-start font-bold text-xs shadow-2xs cursor-pointer ${theme.cardBorder} ${theme.cardBg} ${theme.textMain} ${theme.hoverBg} rounded-2xl h-11 px-4`} asChild>
                        <Link href="/profile/security">
                            <Lock className={`mr-2 h-4 w-4 ${theme.primaryText}`} />
                            Security Password Settings
                        </Link>
                    </Button>
                    <div className={`pt-3 border-t ${theme.dividerColor}`}>
                        <ResidentLogoutButton variant="outline" className="w-full text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-2xl h-11" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <ResidentLayout wide>
            <Head title="Resident Profile" />

            <div className="w-full space-y-6 pb-16">
                {isPendingEdit && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-xs font-bold text-amber-900 shadow-2xs animate-pulse">
                        <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                        <p className="leading-relaxed">
                            You have pending profile modifications currently awaiting administrative review. Account editing is temporarily locked.
                        </p>
                    </div>
                )}

                <ResidentSocialShell right={rightAside}>
                    <div className="space-y-6 w-full">
                        <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                            <CardContent className="p-6 sm:p-8">
                                <h1 className={`text-2xl sm:text-3xl font-black ${theme.textMain} tracking-tight`}>Resident Profile Dashboard</h1>
                                <p className={`mt-2 text-xs sm:text-sm font-medium ${theme.textMuted} leading-relaxed`}>
                                    Official municipal account details, cryptographic digital ID, and civic participation metrics.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid gap-5 sm:grid-cols-3">
                            <StatCard label="Civic XP Score" value={user.civic_xp ?? 50} icon={Award} hint="Earned from verified reports" />
                            <StatCard label="Total Reports" value={activeProfile.report_count ?? 0} icon={FileText} hint="Community submissions" />
                            <StatCard label="Verification Status" value={status.label} icon={Shield} hint={`State: ${statusKey}`} />
                        </div>

                        <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                            <CardHeader className={`flex flex-row items-center justify-between pb-4 border-b ${theme.dividerColor}`}>
                                <CardTitle className={`text-sm font-black uppercase tracking-wider ${theme.textMain}`}>Official Resident Details</CardTitle>
                                <Badge variant={status.variant} className="font-bold px-3 py-1 rounded-xl">{status.label}</Badge>
                            </CardHeader>
                            <CardContent className="p-6 sm:p-8">
                                <dl className="grid gap-6 sm:grid-cols-2 text-xs">
                                    <div>
                                        <dt className={`font-black uppercase tracking-wider ${theme.textMuted}`}>
                                            Full Registered Name
                                        </dt>
                                        <dd className={`mt-1 font-black ${theme.textMain} text-sm sm:text-base`}>{activeProfile.full_name}</dd>
                                    </div>
                                    <div>
                                        <dt className={`font-black uppercase tracking-wider ${theme.textMuted}`}>
                                            Date of Birth
                                        </dt>
                                        <dd className={`mt-1 font-black ${theme.textMain} text-sm sm:text-base`}>{activeProfile.birthday}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className={`font-black uppercase tracking-wider ${theme.textMuted}`}>
                                            Physical Address
                                        </dt>
                                        <dd className={`mt-1 font-black ${theme.textMain} text-sm sm:text-base`}>{activeProfile.address}</dd>
                                    </div>
                                    <div>
                                        <dt className={`font-black uppercase tracking-wider ${theme.textMuted}`}>
                                            Email Address
                                        </dt>
                                        <dd className={`mt-1 font-bold ${theme.textMain} font-mono text-xs sm:text-sm`}>{profile?.email ?? user.email}</dd>
                                    </div>
                                    <div>
                                        <dt className={`font-black uppercase tracking-wider ${theme.textMuted}`}>
                                            Mobile Number
                                        </dt>
                                        <dd className={`mt-1 font-bold ${theme.textMain} font-mono text-xs sm:text-sm`}>{profile?.mobile ?? (user.mobile ?? '—')}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                            <CardHeader className={`pb-4 border-b ${theme.dividerColor}`}>
                                <CardTitle className={`text-sm font-black uppercase tracking-wider ${theme.textMain}`}>Civic Badges & Achievements</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 sm:p-8">
                                {activeProfile.badges.length === 0 ? (
                                    <p className={`text-xs ${theme.textMuted} font-semibold`}>Submit valid community concerns to unlock achievement badges.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2.5">
                                        {activeProfile.badges.map((badge: any) => (
                                            <Badge key={badge.id} variant="outline" className={`gap-2 py-2 px-3.5 font-bold ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} rounded-xl shadow-2xs`}>
                                                <Award className={`h-4 w-4 ${theme.primaryText}`} />
                                                {badge.name}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </ResidentSocialShell>
            </div>
        </ResidentLayout>
    );
}