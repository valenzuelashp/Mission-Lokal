import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, User, X } from 'lucide-react';
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
        <div className="border-b py-3 last:border-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
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
        if (confirm('Are you sure you want to flag or change the status of this resident account?')) {
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
            ? `${data.birthday} (${data.age_years} years old)`
            : data.birthday;

    const fullAddress = data.zip_code ? `${data.address}, Zip: ${data.zip_code}` : data.address;

    return (
        <AdminLayout title="Mission-Lokal Admin">
            <Head title={data.full_name} />

            <div className="mb-3 sm:mb-4">
                <Button variant="ghost" className="-ml-2 h-auto px-2 text-sm" asChild>
                    <Link href="/admin/residents">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to residents
                    </Link>
                </Button>
            </div>

            {/* FLOATING MODAL OVERLAY WRAPPER */}
            {modalMode !== 'none' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-2xl border transition-all">
                        
                        {/* EDIT MODAL CONTENT */}
                        {modalMode === 'edit' && (
                            <>
                                <div className="flex items-center justify-between border-b pb-3 mb-4">
                                    <h3 className="text-base font-semibold text-blue-900">Edit Resident Information</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setModalMode('none')}><X className="h-4 w-4" /></Button>
                                </div>
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-medium">First Name</label>
                                            <Input value={editForm.data.first_name} onChange={e => editForm.setData('first_name', e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium">Middle Name</label>
                                            <Input value={editForm.data.middle_name} onChange={e => editForm.setData('middle_name', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium">Last Name</label>
                                            <Input value={editForm.data.last_name} onChange={e => editForm.setData('last_name', e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium">Email Address</label>
                                            <Input type="email" value={editForm.data.email} onChange={e => editForm.setData('email', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium">Mobile Number</label>
                                            <Input value={editForm.data.mobile} onChange={e => editForm.setData('mobile', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setModalMode('none')}>Cancel</Button>
                                        <Button type="submit" disabled={editForm.processing} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* MESSAGE MODAL CONTENT */}
                        {modalMode === 'message' && (
                            <>
                                <div className="flex items-center justify-between border-b pb-3 mb-4">
                                    <h3 className="text-base font-semibold text-blue-900">Send In-App Message to Resident</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setModalMode('none')}><X className="h-4 w-4" /></Button>
                                </div>
                                <form onSubmit={handleMessageSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Message Content</label>
                                        <textarea
                                            rows={4}
                                            className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-sm"
                                            placeholder="Type notice or message for this resident..."
                                            value={messageForm.data.message}
                                            onChange={e => messageForm.setData('message', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setModalMode('none')}>Cancel</Button>
                                        <Button type="submit" disabled={messageForm.processing} className="bg-emerald-600 hover:bg-emerald-700">Send Message</Button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* UPLOAD DOCUMENT MODAL CONTENT */}
                        {modalMode === 'upload' && (
                            <>
                                <div className="flex items-center justify-between border-b pb-3 mb-4">
                                    <h3 className="text-base font-semibold text-blue-900">Upload Resident Document</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setModalMode('none')}><X className="h-4 w-4" /></Button>
                                </div>
                                <form onSubmit={handleUploadSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Document Title / Name</label>
                                        <Input 
                                            placeholder="e.g., Barangay Clearance, ID Proof" 
                                            value={uploadForm.data.name} 
                                            onChange={e => uploadForm.setData('name', e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Select File (Max 5MB)</label>
                                        <input 
                                            type="file" 
                                            onChange={e => uploadForm.setData('file', e.target.files ? e.target.files[0] : null)}
                                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            required 
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setModalMode('none')}>Cancel</Button>
                                        <Button type="submit" disabled={uploadForm.processing} className="bg-blue-600 hover:bg-blue-700">Upload File</Button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* VIEW ALL ACTIVITIES MODAL CONTENT */}
                        {modalMode === 'view_all_activities' && (
                            <>
                                <div className="flex items-center justify-between border-b pb-3 mb-4">
                                    <h3 className="text-base font-semibold text-blue-900">Full Activity History</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setModalMode('none')}><X className="h-4 w-4" /></Button>
                                </div>
                                <div className="max-h-96 overflow-y-auto space-y-2">
                                    {data.activities && data.activities.length > 0 ? (
                                        data.activities.map((act) => (
                                            <div key={act.id} className="p-3 border rounded-md flex justify-between items-center text-sm">
                                                <div>
                                                    <p className="font-medium">{act.description}</p>
                                                    <p className="text-xs text-muted-foreground">{act.date} · Type: {act.type}</p>
                                                </div>
                                                <span className="text-xs font-semibold px-2 py-1 rounded bg-muted uppercase">{act.status}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No activities recorded.</p>
                                    )}
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="button" variant="outline" onClick={() => setModalMode('none')}>Close</Button>
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