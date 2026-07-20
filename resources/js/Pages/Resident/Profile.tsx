import { Head, Link } from '@inertiajs/react';
import { Award, Lock, Pencil } from 'lucide-react';
import DigitalIdCard from '@/Components/resident/DigitalIdCard';
import ResidentLogoutButton from '@/Components/resident/ResidentLogoutButton';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
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
        <div className="space-y-4">
            <div className="border border-neutral-200/60 rounded-2xl overflow-hidden shadow-sm bg-white/40">
                <DigitalIdCard
                    fullName={profile.full_name}
                    accountId={user.account_id}
                    digitalIdCode={profile.digital_id_code}
                    memberSince={profile.member_since}
                />
            </div>
            
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-4">
                <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950">Quick actions</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col gap-2">
                    <Button variant="outline" className="justify-start h-9 text-xs font-bold rounded-xl border-neutral-200/80 hover:bg-neutral-50" asChild>
                        <Link href="/profile/edit">
                            <Pencil className="mr-2 h-3.5 w-3.5 text-neutral-500" />
                            Edit profile
                        </Link>
                    </Button>
                    <Button variant="outline" className="justify-start h-9 text-xs font-bold rounded-xl border-neutral-200/80 hover:bg-neutral-50" asChild>
                        <Link href="/profile/security">
                            <Lock className="mr-2 h-3.5 w-3.5 text-neutral-500" />
                            Security settings
                        </Link>
                    </Button>
                    <div className="pt-1 border-t border-neutral-100">
                        <ResidentLogoutButton />
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <ResidentLayout wide>
            <Head title="My Profile" />

            {/* Background Canvas Layer */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#fbfbfa]">
                <div className="absolute top-0 right-0 w-[50rem] h-[50rem] rounded-full bg-gradient-to-b from-neutral-200/30 to-transparent blur-[140px] opacity-60" />
            </div>

            <div className="relative z-10 space-y-4 w-full px-2 sm:px-4 md:px-6">
                {/* Header Information panel */}
                <Card className="overflow-hidden border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl">
                    <CardContent className="p-4 sm:p-5">
                        <h1 className="text-sm font-black tracking-wider text-neutral-950 uppercase">My Profile</h1>
                        <p className="mt-0.5 text-xs font-medium text-neutral-400">
                            Account configuration parameters, digital ID data, and active civic tracking.
                        </p>
                    </CardContent>
                </Card>

                <ResidentSocialShell right={rightAside}>
                    <div className="space-y-4">
                        {/* Compact Stats Row Blocks */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="border border-neutral-200/60 bg-white/80 backdrop-blur-md rounded-xl p-3 shadow-sm text-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">Civic XP</span>
                                <span className="text-xl font-black text-neutral-900 mt-1 block">{user.civic_xp}</span>
                            </div>
                            <div className="border border-neutral-200/60 bg-white/80 backdrop-blur-md rounded-xl p-3 shadow-sm text-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">Reports</span>
                                <span className="text-xl font-black text-neutral-900 mt-1 block">{profile.report_count}</span>
                            </div>
                            <div className="border border-neutral-200/60 bg-white/80 backdrop-blur-md rounded-xl p-3 shadow-sm text-center flex flex-col justify-center items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-0.5">Status</span>
                                <Badge variant={status.variant} className="rounded-md font-bold text-[9px] uppercase shadow-none px-1 py-0.5">{status.label}</Badge>
                            </div>
                        </div>

                        {/* Core Resident Information Register Box */}
                        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100/70 px-4 py-3">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950">Resident Records</CardTitle>
                                <Badge variant={status.variant} className="rounded-md font-bold text-[9px] uppercase px-1.5 py-0.5 shadow-none">{status.label}</Badge>
                            </CardHeader>
                            <CardContent className="p-4">
                                <dl className="grid gap-4 grid-cols-1 sm:grid-cols-2 text-xs">
                                    <div className="border-b border-neutral-50 pb-2 sm:border-0 sm:pb-0">
                                        <dt className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Full Name</dt>
                                        <dd className="mt-1 font-bold text-neutral-800">{profile.full_name}</dd>
                                    </div>
                                    <div className="border-b border-neutral-50 pb-2 sm:border-0 sm:pb-0">
                                        <dt className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Date of Birth</dt>
                                        <dd className="mt-1 font-bold text-neutral-800">{profile.birthday}</dd>
                                    </div>
                                    <div className="sm:col-span-2 border-b border-neutral-50 pb-2 sm:border-0 sm:pb-0">
                                        <dt className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Residential Address</dt>
                                        <dd className="mt-1 font-bold text-neutral-800 leading-relaxed">{profile.address}</dd>
                                    </div>
                                    <div className="border-b border-neutral-50 pb-2 sm:border-0 sm:pb-0 min-w-0">
                                        <dt className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Email Address</dt>
                                        <dd className="mt-1 font-bold text-neutral-800 truncate">{user.email ?? '—'}</dd>
                                    </div>
                                    <div className="min-w-0">
                                        <dt className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Contact Number</dt>
                                        <dd className="mt-1 font-bold text-neutral-800 truncate">{user.mobile ?? '—'}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        {/* Badges Inventory Block */}
                        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl">
                            <CardHeader className="border-b border-neutral-100/70 px-4 py-3">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950">Earned Accolades</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {profile.badges.length === 0 ? (
                                    <p className="text-xs font-medium text-neutral-400">Report active barangay concerns to unlock civic recognition badges.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {profile.badges.map((badge) => (
                                            <Badge key={badge.id} variant="outline" className="gap-1.5 py-1.5 px-2.5 rounded-xl border-neutral-200 text-neutral-800 font-bold text-[10px] shadow-none bg-white">
                                                <Award className="h-3 w-3 text-neutral-500" />
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