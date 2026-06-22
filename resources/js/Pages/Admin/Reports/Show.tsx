import { Head, Link, router } from '@inertiajs/react';
import { MapPin, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import MapView from '@/Components/maps/MapView';

export default function Show({ report }: any) {
    
    const updateStatus = (newStatus: string) => {
    router.put(`/admin/reports/${report.id}`, {            status: newStatus
        });
    };

    return (
        <AdminLayout title={`Report ${report.id}`}>
            <Head title="Report Detail" />

            {/* Back Button and Header */}
            <div className="mb-6 flex items-center gap-4">
            <Link href="/admin/reports" className="text-muted-foreground hover:text-foreground">                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h2 className="text-2xl font-semibold text-blue-900">Report Details</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                
                {/* Main Information Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold">{report.title}</h3>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 uppercase tracking-wider">
                                {report.status}
                            </span>
                        </div>
                        <p className="whitespace-pre-wrap text-muted-foreground">{report.description}</p>
                        
                        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{report.location}</span>
                        </div>
                    </div>

                    {/* Map Area */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm overflow-hidden">
                        <h4 className="mb-4 font-semibold">Location Map</h4>
                        {/* The REAL Map Component! */}
                        <MapView
                            center={[report.lat, report.lng]}
                            pins={[{ id: report.id, lat: report.lat, lng: report.lng, title: report.title }]}
                            className="h-64 w-full rounded-md border"
                        />
                    </div>
                </div>

                {/* Admin Actions Sidebar */}
                <div className="space-y-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h4 className="mb-4 font-semibold">Admin Actions</h4>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Submitted on: <br/>{report.submitted_at}
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <Button 
                                className="w-full bg-green-600 text-white hover:bg-green-700"
                                onClick={() => updateStatus('active')}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve & Make Active
                            </Button>
                            
                            <Button 
                                variant="destructive" 
                                className="w-full"
                                onClick={() => updateStatus('rejected')}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Mark as Rejected/Spam
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}