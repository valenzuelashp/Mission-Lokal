import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, User } from 'lucide-react';
import ResidentActivityTable from '@/Components/admin/ResidentActivityTable';
import ResidentDocumentsList from '@/Components/admin/ResidentDocumentsList';
import ResidentMiniMap from '@/Components/admin/ResidentMiniMap';
import ResidentProfileHeader from '@/Components/admin/ResidentProfileHeader';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import { demoResidents, findResident } from '@/Lib/adminDemo';
import type { AdminResidentShowPageProps } from '@/Types';

type Props = Partial<AdminResidentShowPageProps> & {
    residentId?: string;
};

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-b py-3 last:border-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
        </div>
    );
}

export default function Show({ resident, residentId }: Props) {
    const data = resident ?? findResident(residentId ?? '') ?? findResident(demoResidents[0].id)!;

    const birthdayDisplay =
        data.age_years != null && data.birthday !== '—'
            ? `${data.birthday} (${data.age_years} years old)`
            : data.birthday;

    const fullAddress = data.zip_code ? `${data.address}, Zip: ${data.zip_code}` : data.address;

    return (
        <AdminLayout title="Mission-Lokal Admin">
            <Head title={data.full_name} />

            <Button variant="ghost" className="mb-4 -ml-2 lg:hidden" asChild>
                <Link href="/admin/residents">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to residents
                </Link>
            </Button>

            <ResidentProfileHeader resident={data} />

            <div className="mb-6 grid gap-6 lg:grid-cols-2">
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Personal details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <DetailRow label="Date of birth" value={birthdayDisplay} />
                        <DetailRow label="National ID number" value={data.national_id_masked ?? '—'} />
                        <DetailRow label="Citizenship status" value={data.citizenship_status} />
                        <DetailRow label="Gender" value={data.gender} />
                        <DetailRow label="Civic XP" value={`${data.civic_xp} points · ${data.badge_count} badges`} />
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            Contact info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0 text-sm">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Primary address
                            </p>
                            <p className="mt-1 font-medium">{fullAddress}</p>
                        </div>
                        <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Map location
                            </p>
                            <ResidentMiniMap lat={data.map_lat} lng={data.map_lng} />
                        </div>
                        <DetailRow label="Phone number" value={data.mobile ?? '—'} />
                        <DetailRow label="Email address" value={data.email ?? '—'} />
                        {data.emergency_contact && (
                            <DetailRow
                                label="Emergency contact"
                                value={`${data.emergency_contact.name} (${data.emergency_contact.relationship}) · ${data.emergency_contact.phone}`}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ResidentActivityTable activities={data.activities} />
                <ResidentDocumentsList documents={data.documents} />
            </div>
        </AdminLayout>
    );
}
