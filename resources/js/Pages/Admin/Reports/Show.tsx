import { Head, Link, router } from '@inertiajs/react';
import { MapPin, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import MapView from '@/Components/maps/MapView';

export default function Show({ report }: any) {
    const updateStatus = (newStatus: string) => {
        router.put(`/admin/reports/${report.id}`, { status: newStatus });
    };

    return (
        <AdminLayout title={`Report ${report.id}`}>
            <Head title="Report Detail" />

            <div className="mb-5 flex items-center gap-4 border-b border-neutral-200/40 pb-4">
                <Link href="/admin/reports" className="text-neutral-400 hover:text-neutral-900 transition-colors">
                    <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
                </Link>
                <h2 className="text-xl font-black uppercase tracking-wider text-neutral-900 sm:text-2xl">Report context file</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md p-5 sm:p-6 shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3">
                            <h3 className="text-base font-black text-neutral-900 tracking-tight">{report.title}</h3>
                            <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-neutral-500 shadow-2xs">
                                {report.status}
                            </span>
                        </div>
                        <p className="whitespace-pre-wrap text-xs font-medium text-neutral-600 leading-relaxed bg-neutral-50/40 border border-neutral-200/40 p-3.5 rounded-xl">{report.description}</p>
                        
                        <div className="flex items-start gap-2 text-xs font-bold text-neutral-500 pt-2">
                            <MapPin className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{report.location}</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md p-5 shadow-sm">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Cartographic threshold coordinates</h4>
                        <MapView
                            center={[report.lat, report.lng]}
                            pins={[{ id: report.id, lat: report.lat, lng: report.lng, title: report.title }]}
                            className="h-64 w-full rounded-xl border border-neutral-200 shadow-inner"
                        />
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md p-5 shadow-sm space-y-4">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">Audit Ledger actions</h4>
                            <p className="text-xs font-semibold text-neutral-500 tracking-tight leading-relaxed">
                                Staged on file log: <br />
                                <span className="font-sans font-medium text-xs normal-case text-neutral-400/80 tabular-nums">{report.submitted_at}</span>
                            </p>
                        </div>
                        
                        <div className="flex flex-col gap-2.5 pt-2 border-t border-neutral-100">
                            <Button 
                                className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-black uppercase tracking-widest text-xs h-10 shadow-sm transition-all active:scale-[0.98]"
                                onClick={() => updateStatus('active')}
                            >
                                <CheckCircle className="mr-2 h-4 w-4 stroke-[2.5]" />
                                Authorize & close state
                            </Button>
                            
                            <Button 
                                variant="destructive" 
                                className="w-full rounded-xl font-black uppercase tracking-widest text-xs h-10 shadow-sm transition-all active:scale-[0.98]"
                                onClick={() => updateStatus('rejected')}
                            >
                                <XCircle className="mr-2 h-4 w-4 stroke-[2]" />
                                Drop as invalid/spam
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}