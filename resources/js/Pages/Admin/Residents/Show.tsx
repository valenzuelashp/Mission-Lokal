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
        <div className="border-b border-neutral-100 py-3.5 last:border-0 flex justify-between items-center gap-4 text-xs font-bold">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{label}</span>
            <span className="text-neutral-800 font-black tracking-tight text-right leading-tight">{value}</span>
        </div>
    );
}

export default function Show({ resident, residentId }: Props) {
    const data = resident ?? findResident(residentId ?? '') ?? findResident(demoResidents[0].id)!;

    const birthdayDisplay =
        data.age_years != null && data.birthday !== '—'
            ? `${data.birthday} (${data.age_years} yrs)`
            : data.birthday;

    const fullAddress = data.zip_code ? `${data.address}, Zip: ${data.zip_code}` : data.address;

    return (
        <AdminLayout title="Mission-Lokal Admin: Resident File">
            <Head title={data.full_name} />

            <Button variant="ghost" className="mb-4 -ml-2 h-auto px-2 text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors hover:bg-transparent" asChild>
                <Link href="/admin/residents">
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" />
                    Back to core database
                </Link>
            </Button>

            <ResidentProfileHeader resident={data} />

            <div className="mb-6 grid gap-6 lg:grid-cols-2 items-start">
                <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-neutral-100 bg-white/40 px-5 py-4">
                        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-800">
                            <User className="h-4 w-4 text-neutral-400 stroke-[2.5]" />
                            Personal registry metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-1">
                        <DetailRow label="Date of birth" value={birthdayDisplay} />
                        <DetailRow label="National ID trace" value={data.national_id_masked ?? '—'} />
                        <DetailRow label="Citizenship tier" value={data.citizenship_status} />
                        <DetailRow label="Gender binary designation" value={data.gender} />
                        <DetailRow label="Civic footprint aggregate" value={`${data.civic_xp} XP · ${data.badge_count} badges logged`} />
                    </CardContent>
                </Card>

                <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-neutral-100 bg-white/40 px-5 py-4">
                        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-800">
                            <BookOpen className="h-4 w-4 text-neutral-400 stroke-[2.5]" />
                            Communication & address indices
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-5 text-xs font-bold text-neutral-800">
                        <div className="bg-neutral-50/40 border border-neutral-200/40 rounded-xl p-3.5 space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Primary residential coordinate</p>
                            <p className="font-black leading-relaxed text-neutral-900 pt-0.5">{fullAddress}</p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Geographic vector pin</p>
                            <ResidentMiniMap lat={data.map_lat} lng={data.map_lng} />
                        </div>
                        <div className="pt-2 border-t border-neutral-100">
                            <DetailRow label="Contact line" value={data.mobile ?? '—'} />
                            <DetailRow label="Email endpoint" value={data.email ?? '—'} />
                            {data.emergency_contact && (
                                <DetailRow
                                    label="Emergency proxy contact"
                                    value={`${data.emergency_contact.name} (${data.emergency_contact.relationship}) · ${data.emergency_contact.phone}`}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 items-start">
                <ResidentActivityTable activities={data.activities} />
                <ResidentDocumentsList documents={data.documents} />
            </div>
        </AdminLayout>
    );
}