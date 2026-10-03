import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, IdCard, ShieldAlert, User, X, FileText, Award, Hash } from 'lucide-react';
import { useState } from 'react';
import ResidentActivityTable from '@/Components/admin/ResidentActivityTable';
import ResidentDocumentsList from '@/Components/admin/ResidentDocumentsList';
import ResidentMiniMap from '@/Components/admin/ResidentMiniMap';
import ResidentProfileHeader from '@/Components/admin/ResidentProfileHeader';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';
import { demoResidents, findResident } from '@/Lib/adminDemo';
import type { AdminResidentShowPageProps } from '@/Types';

type Props = Partial<AdminResidentShowPageProps> & {
    residentId?: string;
};

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-b border-slate-100 py-3 last:border-0 flex justify-between items-center text-xs">
            <span className="font-black uppercase tracking-wider text-slate-400">{label}</span>
            <span className="font-bold text-slate-900">{value}</span>
        </div>
    );
}

export default function Show({ resident, residentId }: Props) {
    const data = resident ?? findResident(residentId ?? '') ?? findResident(demoResidents[0].id)!;

    const [modalMode, setModalMode] = useState<'none' | 'edit' | 'message' | 'upload' | 'view_all_activities'>('none');

    const editForm = useForm({
        first_name: data.first_name ?? '',
        middle_name: data.middle_name ?? '',
        last_name: data.last_name ?? '',
        email: data.email && data.email !== '—' ? data.email : '',
        mobile: data.mobile && data.mobile !== '—' ? data.mobile : '',
    });

    const messageForm = useForm({
        message: '',
    });

    const uploadForm = useForm<{ name: string; file: File | null }>({
        name: '',
        file: null,
    });

    const flagForm = useForm({});
    const handleFlag = () => {
        if (confirm('Are you sure you want to toggle the operational status of this resident account?')) {
            flagForm.post(`/admin/residents/${data.id}/flag`);
        }
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(`/admin/residents/${data.id}`, {
            onSuccess: () => setModalMode('none'),
        });
    };

    const handleMessageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        messageForm.post(`/admin/residents/${data.id}/message`, {
            onSuccess: () => {
                setModalMode('none');
                messageForm.reset();
            },
        });
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post(`/admin/residents/${data.id}/documents`, {
            onSuccess: () => {
                setModalMode('none');
                uploadForm.reset();
            },
        });
    };

    const birthdayDisplay =
        data.age_years != null && data.birthday !== '—'
            ? `${data.birthday} (${data.age_years} yrs)`
            : data.birthday;

    const fullAddress = data.zip_code ? `${data.address}, Zip: ${data.zip_code}` : data.address;
    const isMinor = (data.age_years != null && data.age_years < 18) || (data as any).parent_name;

    return (
        <AdminLayout title="Mission-Lokal Admin">
            <Head title={`Resident: ${data.full_name}`} />

            <div className="mb-4">
                <Button variant="ghost" className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer" asChild>
                    <Link href="/admin/residents">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Residents Directory
                    </Link>
                </Button>
            </div>

            {modalMode !== 'none' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
                        {modalMode === 'edit' && (
                            <>
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                                    <h3 className="text-base font-black text-slate-900">Edit Resident Profile Details</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setModalMode('none')}><X className="h-4 w-4" /></Button>
                                </div>
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1">First Name</label>
                                            <Input value={editForm.data.first_name} onChange={e => editForm.setData('first_name', e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1">Middle Name</label>
                                            <Input value={editForm.data.middle_name} onChange={e => editForm.setData('middle_name', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1">Last Name</label>
                                            <Input value={editForm.data.last_name} onChange={e => editForm.setData('last_name', e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1">Email Address</label>
                                            <Input type="email" value={editForm.data.email} onChange={e => editForm.setData('email', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1">Mobile Number</label>
                                            <Input value={editForm.data.mobile} onChange={e => editForm.setData('mobile', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                                        <Button type="button" variant="outline" onClick={() => setModalMode('none')} className="cursor-pointer text-xs font-bold">Cancel</Button>
                                        <Button type="submit" disabled={editForm.processing} className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer shadow-sm">Save Changes</Button>
                                    </div>
                                </form>
                            </>
                        )}

                        {modalMode === 'message' && (
                            <>
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                                    <h3 className="text-base font-black text-slate-900">Send Direct Command Message</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setModalMode('none')}><X className="h-4 w-4" /></Button>
                                </div>
                                <form onSubmit={handleMessageSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 block">Notice Content</label>
                                        <textarea
                                            rows={4}
                                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 shadow-2xs resize-none"
                                            placeholder="Type direct municipal directive for this resident..."
                                            value={messageForm.data.message}
                                            onChange={e => messageForm.setData('message', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                                        <Button type="button" variant="outline" onClick={() => setModalMode('none')} className="cursor-pointer text-xs font-bold">Cancel</Button>
                                        <Button type="submit" disabled={messageForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm">Send Notification</Button>
                                    </div>
                                </form>
                            </>
                        )}

                        {modalMode === 'upload' && (
                            <>
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                                    <h3 className="text-base font-black text-slate-900">Upload Resident Record File</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setModalMode('none')}><X className="h-4 w-4" /></Button>
                                </div>
                                <form onSubmit={handleUploadSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 block">Document Designation</label>
                                        <Input 
                                            placeholder="e.g., Verified Barangay Clearance, Indigency Certificate" 
                                            value={uploadForm.data.name} 
                                            onChange={e => uploadForm.setData('name', e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 block">Select File (Max 5MB)</label>
                                        <input 
                                            type="file" 
                                            onChange={e => uploadForm.setData('file', e.target.files ? e.target.files[0] : null)}
                                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                            required 
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                                        <Button type="button" variant="outline" onClick={() => setModalMode('none')} className="cursor-pointer text-xs font-bold">Cancel</Button>
                                        <Button type="submit" disabled={uploadForm.processing} className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer shadow-sm">Upload File</Button>
                                    </div>
                                </form>
                            </>
                        )}

                        {modalMode === 'view_all_activities' && (
                            <>
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                                    <h3 className="text-base font-black text-slate-900">Full Resident Activity Log</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setModalMode('none')}><X className="h-4 w-4" /></Button>
                                </div>
                                <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                                    {data.activities && data.activities.length > 0 ? (
                                        data.activities.map((act) => (
                                            <div key={act.id} className="p-3.5 border border-slate-200 rounded-xl flex justify-between items-center text-xs bg-slate-50/50">
                                                <div>
                                                    <p className="font-bold text-slate-900">{act.description}</p>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">{act.date} · Type: <span className="uppercase font-semibold">{act.type}</span></p>
                                                </div>
                                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-slate-200 uppercase tracking-wide text-slate-700">{act.status}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-muted-foreground text-center py-6">No historical activities logged.</p>
                                    )}
                                </div>
                                <div className="flex justify-end pt-3 border-t border-slate-100">
                                    <Button type="button" variant="outline" onClick={() => setModalMode('none')} className="cursor-pointer text-xs font-bold">Close Window</Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <ResidentProfileHeader 
                resident={data} 
                onEdit={() => setModalMode('edit')} 
                onFlag={handleFlag} 
                onMessage={() => setModalMode('message')} 
                isFlagging={flagForm.processing}
            />

            {/* Quick Metrics Summary Bar */}
            <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                        <Hash className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Account ID</p>
                        <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{data.account_id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Total Reports</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{data.reports_count ?? 0} Concern{data.reports_count === 1 ? '' : 's'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                        <Award className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Civic Score</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{data.civic_xp} XP · {data.badge_count} Badges</p>
                    </div>
                </div>
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-2">
                <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl">
                    <CardHeader className="pb-3 border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-700">
                            <User className="h-4 w-4 text-blue-600" />
                            Personal Identity Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <DetailRow label="Date of birth" value={birthdayDisplay} />
                        <DetailRow label="Citizenship status" value={data.citizenship_status} />
                        
                        {isMinor && (
                            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider mb-2">
                                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                                    Minor Account Guardian Details
                                </div>
                                <div className="space-y-1.5 text-xs">
                                    <div>
                                        <span className="text-slate-500 font-semibold">Guardian Name:</span>{' '}
                                        <span className="font-bold text-slate-900">{(data as any).parent_name ?? 'Not Provided'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-semibold">Guardian Contact:</span>{' '}
                                        <span className="font-bold text-slate-900">{(data as any).parent_contact ?? 'Not Provided'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl">
                    <CardHeader className="pb-3 border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-700">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            Contact & Location Telemetry
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-3 text-xs">
                        <div>
                            <p className="font-black uppercase tracking-wider text-slate-400 mb-1">
                                Primary Residence Address
                            </p>
                            <p className="font-bold text-slate-900">{fullAddress}</p>
                        </div>
                        <div>
                            <p className="mb-1 font-black uppercase tracking-wider text-slate-400">
                                Geographic Coordinates Pin
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

            <Card className="mb-6 shadow-xs border-slate-200/80 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-700">
                        <IdCard className="h-4 w-4 text-blue-600" />
                        Submitted Government Identification
                    </CardTitle>
                    <p className="text-xs font-bold text-blue-800 mt-0.5">
                        {data.government_id_label ?? 'OFFICIAL IDENTITY DOCUMENT'}
                    </p>
                </CardHeader>
                <CardContent className="p-4 bg-slate-50/50">
                    {data.government_id_url ? (
                        data.government_id_is_pdf ? (
                            <iframe
                                src={data.government_id_url}
                                title={data.government_id_label ?? 'Government ID'}
                                className="h-[420px] w-full rounded-xl border border-slate-200 bg-white shadow-2xs"
                            />
                        ) : (
                            <img
                                src={data.government_id_url}
                                alt={data.government_id_label ?? 'Government ID'}
                                className="max-h-[420px] w-full rounded-xl border border-slate-200 object-contain bg-white shadow-2xs"
                            />
                        )
                    ) : (
                        <p className="text-xs text-muted-foreground text-center py-8">No government ID document uploaded on file for this account.</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <ResidentActivityTable 
                    activities={data.activities || []} 
                    onViewAllClick={() => setModalMode('view_all_activities')} 
                />
                <ResidentDocumentsList 
                    documents={data.documents || []} 
                    onUploadClick={() => setModalMode('upload')} 
                />
            </div>
        </AdminLayout>
    );
}