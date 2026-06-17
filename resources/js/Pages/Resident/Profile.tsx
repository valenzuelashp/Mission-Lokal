import { Head, Link } from '@inertiajs/react';
import { Award, FileText, Lock, Pencil, Shield } from 'lucide-react';
import PageHeader from '@/Components/shared/PageHeader';
import StatCard from '@/Components/shared/StatCard';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { useAuth } from '@/Hooks/usePageProps';
import ResidentLayout from '@/Layouts/ResidentLayout';

export default function Profile() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <ResidentLayout>
            <Head title="Profile" />
            <PageHeader title="My profile" description="Account details and civic participation." />

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <StatCard label="Civic XP" value={user.civic_xp} icon={Award} hint="Earn more by reporting" />
                <StatCard label="Reports" value={3} icon={FileText} hint="Demo data" />
                <StatCard label="Status" value="Verified" icon={Shield} hint={user.verification_status} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Resident info</CardTitle>
                        <Badge variant="success">Approved</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Account ID</span>
                            <span className="font-medium">{user.account_id}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">{user.email ?? '—'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Mobile</span>
                            <span className="font-medium">{user.mobile ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Role</span>
                            <span className="font-medium capitalize">{user.role}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
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
                    </CardContent>
                </Card>
            </div>
        </ResidentLayout>
    );
}
