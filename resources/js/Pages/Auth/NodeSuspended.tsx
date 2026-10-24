import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ShieldAlert, Building2, ArrowLeft, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import axios from 'axios';

interface BarangayOption {
    id: string;
    name: string;
    city: string;
    province: string;
    code: string;
}

export default function NodeSuspended() {
    const [showAppealForm, setShowAppealForm] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [allBarangays, setAllBarangays] = useState<BarangayOption[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(true);

    // Cascading selection state
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedBarangayId, setSelectedBarangayId] = useState('');

    const appealForm = useForm({
        barangay_id: '',
        contact_email: '',
        reason: '',
    });

    useEffect(() => {
        axios.get('/api/suspended-barangay-options')
            .then(res => {
                setAllBarangays(res.data);
                setLoadingLocations(false);
            })
            .catch(() => setLoadingLocations(false));
    }, []);

    // Derive unique provinces
    const provinces = Array.from(new Set(allBarangays.map(b => b.province))).filter(Boolean).sort();

    // Derive unique cities based on selected province
    const cities = Array.from(
        new Set(
            allBarangays
                .filter(b => !selectedProvince || b.province === selectedProvince)
                .map(b => b.city)
        )
    ).filter(Boolean).sort();

    // Derive barangays based on selected province & city
    const filteredBarangays = allBarangays.filter(
        b => (!selectedProvince || b.province === selectedProvince) &&
             (!selectedCity || b.city === selectedCity)
    ).sort((a, b) => a.name.localeCompare(b.name));

    const handleProvinceChange = (province: string) => {
        setSelectedProvince(province);
        setSelectedCity('');
        setSelectedBarangayId('');
        appealForm.setData('barangay_id', '');
    };

    const handleCityChange = (city: string) => {
        setSelectedCity(city);
        setSelectedBarangayId('');
        appealForm.setData('barangay_id', '');
    };

    const handleBarangayChange = (id: string) => {
        setSelectedBarangayId(id);
        appealForm.setData('barangay_id', id);
    };

    const handleAppealSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        appealForm.post('/node-suspended/appeal', {
            preserveScroll: true,
            onSuccess: () => setSubmitted(true),
            onError: () => setSubmitted(true),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-slate-800">
            <Head title="Barangay Node Suspended" />

            <div className="w-full max-w-md space-y-6">
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-sky-100 border border-sky-200 text-sky-600 rounded-3xl shadow-sm">
                        <ShieldAlert className="h-10 w-10 animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">Barangay Node Suspended</h1>
                    <p className="text-xs text-slate-500 max-w-sm font-medium">
                        Access to this container node has been temporarily frozen by the Super Administrator due to maintenance, administrative review, or compliance requirements.
                    </p>
                </div>

                <Card className="border-slate-200/80 bg-white shadow-xl shadow-sky-900/5 rounded-3xl overflow-hidden">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-50 border border-sky-100 text-sky-900 text-xs">
                            <Building2 className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
                            <span className="leading-relaxed">All local administrative and operational workflows for this barangay container are currently locked.</span>
                        </div>

                        {!submitted ? (
                            <>
                                {!showAppealForm ? (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5 text-xs text-slate-600">
                                            <p className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">What should I do?</p>
                                            <p className="leading-relaxed font-medium">
                                                You can submit an official reactivation appeal directly through the system to request a review from the Super Administrator.
                                            </p>
                                        </div>

                                        <div className="space-y-2.5 pt-1">
                                            <Button 
                                                onClick={() => setShowAppealForm(true)}
                                                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs h-11 rounded-xl cursor-pointer gap-2 shadow-sm"
                                            >
                                                <MessageSquare className="h-4 w-4" /> Appeal via System Form
                                            </Button>

                                            <Link href="/admin-personnel/login" className="block w-full">
                                                <Button variant="outline" className="w-full text-slate-700 border-slate-200 hover:bg-slate-50 font-bold text-xs h-11 rounded-xl cursor-pointer gap-2">
                                                    <ArrowLeft className="h-4 w-4" /> Return to Login Portal
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleAppealSubmit} className="space-y-4 animate-in fade-in duration-200">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Node Reactivation Appeal</h3>
                                            <button 
                                                type="button" 
                                                onClick={() => setShowAppealForm(false)}
                                                className="text-[10px] font-bold text-sky-600 hover:underline cursor-pointer"
                                            >
                                                Back
                                            </button>
                                        </div>

                                        {/* Province Dropdown */}
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600">Province *</label>
                                            <select 
                                                value={selectedProvince}
                                                onChange={e => handleProvinceChange(e.target.value)}
                                                required
                                                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                                            >
                                                <option value="">{loadingLocations ? 'Loading provinces...' : '-- Select Province --'}</option>
                                                {provinces.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* City Dropdown */}
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600">City / Municipality *</label>
                                            <select 
                                                value={selectedCity}
                                                onChange={e => handleCityChange(e.target.value)}
                                                disabled={!selectedProvince}
                                                required
                                                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                                            >
                                                <option value="">{selectedProvince ? '-- Select City / Municipality --' : '-- Select Province First --'}</option>
                                                {cities.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Barangay Dropdown */}
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600">Barangay Name *</label>
                                            <select 
                                                value={selectedBarangayId}
                                                onChange={e => handleBarangayChange(e.target.value)}
                                                disabled={!selectedCity}
                                                required
                                                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                                            >
                                                <option value="">{selectedCity ? '-- Select Barangay Name --' : '-- Select City First --'}</option>
                                                {filteredBarangays.map(b => (
                                                    <option key={b.id} value={b.id}>
                                                        {b.name} [{b.code}]
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600">Contact Email *</label>
                                            <Input 
                                                type="email"
                                                placeholder="admin@barangay.gov.ph" 
                                                value={appealForm.data.contact_email}
                                                onChange={e => appealForm.setData('contact_email', e.target.value)}
                                                required
                                                className="rounded-xl h-10 text-xs font-mono"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600">Reason for Appeal / Notes *</label>
                                            <textarea 
                                                rows={3}
                                                placeholder="Explain why this node should be reactivated..."
                                                value={appealForm.data.reason}
                                                onChange={e => appealForm.setData('reason', e.target.value)}
                                                required
                                                className="w-full rounded-xl border border-input bg-background p-3 text-xs shadow-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 resize-none"
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <Button 
                                                type="submit" 
                                                disabled={appealForm.processing}
                                                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs h-11 rounded-xl cursor-pointer gap-2 shadow-sm"
                                            >
                                                <Send className="h-4 w-4" /> {appealForm.processing ? 'Submitting Appeal...' : 'Transmit Appeal to Super Admin'}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </>
                        ) : (
                            <div className="py-6 text-center space-y-3 animate-in fade-in duration-300">
                                <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">Appeal Submitted Successfully</h3>
                                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                                    Your reactivation appeal has been transmitted to the Super Administrator review queue. You will be notified via email once evaluated.
                                </p>
                                <div className="pt-4">
                                    <Link href="/admin-personnel/login">
                                        <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs h-11 rounded-xl cursor-pointer">
                                            Return to Login Portal
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <p className="text-center text-[10px] text-slate-400 font-mono tracking-wider">
                    MISSION-LOKAL MULTI-TENANT INFRASTRUCTURE GATEWAY
                </p>
            </div>
        </div>
    );
}