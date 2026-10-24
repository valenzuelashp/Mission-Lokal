import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Settings as SettingsIcon, User, ShieldAlert, CheckCircle, Clock, KeyRound, Mail, XCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { PasswordInput } from '@/Components/ui/password-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/Types';

interface Props {
    user: { first_name: string; last_name: string; email: string };
    barangay: { 
        name: string; 
        office_address: string;
        house_street: string;
        city: string;
        province: string;
        contact_phone: string;
        contact_email: string;
    };
    pendingRequest: boolean;
    pendingClearance: boolean;
}

export default function Settings({ user, barangay, pendingRequest, pendingClearance }: Props) {
    const { flash } = usePage<PageProps & { flash?: { success?: string; error?: string } }>().props;
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    
    // OTP Bypass State for Security Tab
    const [useOtpBypass, setUseOtpBypass] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [isRequestingOtp, setIsRequestingOtp] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (otpTimer > 0) {
            interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const profileForm = useForm({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        barangay_name: barangay.name,
        house_street: barangay.house_street,
        city: barangay.city,
        province: barangay.province,
        contact_phone: barangay.contact_phone,
        contact_email: barangay.contact_email,
        super_admin_key: '', // Will only be validated in backend if email changes
    });

    const isEmailChanged = profileForm.data.email !== user.email;

    const securityForm = useForm({
        current_password: '',
        otp: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put('/admin/settings/profile', {
            preserveScroll: true,
            onSuccess: () => profileForm.reset('super_admin_key')
        });
    };

    const handleRequestOtp = () => {
        setIsRequestingOtp(true);
        router.post('/admin/settings/security/request-otp', {}, {
            preserveScroll: true,
            onSuccess: () => setOtpTimer(600), // 10 minutes
            onFinish: () => setIsRequestingOtp(false)
        });
    };

    const handleSecuritySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        securityForm.put('/admin/settings/security', {
            onSuccess: () => {
                securityForm.reset('current_password', 'password', 'password_confirmation', 'otp');
                setOtpTimer(0);
                setUseOtpBypass(false);
            },
        });
    };

    return (
        <AdminLayout title="System Configurations">
            <Head title="Admin Dashboard Settings" />

            <div className="w-full space-y-8 pb-16">
                
                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <SettingsIcon className="h-3 w-3" /> System Preferences
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                            <SettingsIcon className="h-7 w-7 text-blue-600" /> Control Settings Panel
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            Manage administrative credentials and security policies for <strong>{barangay.name}</strong>.
                        </p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-xs font-bold text-emerald-900 shadow-2xs">
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}
                
                {flash?.error && (
                    <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-xs font-bold text-red-900 shadow-2xs">
                        <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                <div className="flex flex-col gap-8 md:flex-row items-start">
                    <Card className="w-full md:w-72 shrink-0 shadow-2xs border-slate-200/80 bg-white rounded-3xl">
                        <CardContent className="p-3 flex flex-row md:flex-col gap-1.5 overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center gap-3 px-5 py-3.5 text-xs font-extrabold rounded-2xl transition-all text-left w-full cursor-pointer ${
                                    activeTab === 'profile' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <User className="h-4 w-4" /> Personal & Barangay Profile
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('security')}
                                className={`flex items-center gap-3 px-5 py-3.5 text-xs font-extrabold rounded-2xl transition-all text-left w-full cursor-pointer ${
                                    activeTab === 'security' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <ShieldAlert className="h-4 w-4" /> Security Access
                            </button>
                        </CardContent>
                    </Card>

                    <div className="flex-1 w-full">
                        {activeTab === 'profile' ? (
                            <div className="space-y-6">
                                {pendingRequest && (
                                    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs text-amber-900 shadow-2xs">
                                        <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="font-bold uppercase tracking-wider text-amber-800">Pending Approval</p>
                                            <p className="font-medium text-amber-700/90">
                                                Your recent profile update request is currently awaiting super admin approval. You cannot make further changes until it is reviewed.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden">
                                    <CardHeader className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
                                        <CardTitle className="text-base font-extrabold text-slate-900">Administrative Identity Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8">
                                        <form onSubmit={handleProfileSubmit} className="space-y-8 max-w-2xl">
                                            
                                            {/* Admin Details */}
                                            <div className="space-y-5">
                                                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Admin Information</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">First Name</label>
                                                        <Input disabled={pendingRequest} value={profileForm.data.first_name} onChange={e => profileForm.setData('first_name', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                                        {profileForm.errors.first_name && <span className="text-xs font-semibold text-red-600 mt-1 block">{profileForm.errors.first_name}</span>}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Last Name</label>
                                                        <Input disabled={pendingRequest} value={profileForm.data.last_name} onChange={e => profileForm.setData('last_name', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                                        {profileForm.errors.last_name && <span className="text-xs font-semibold text-red-600 mt-1 block">{profileForm.errors.last_name}</span>}
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Official Email Address</label>
                                                    <Input disabled={pendingRequest} type="email" value={profileForm.data.email} onChange={e => profileForm.setData('email', e.target.value)} required className={`rounded-xl h-11 text-xs transition-colors ${isEmailChanged && !pendingRequest ? 'border-rose-300 bg-rose-50/30' : ''}`} />
                                                    {profileForm.errors.email && <span className="text-xs font-semibold text-red-600 mt-1 block">{profileForm.errors.email}</span>}
                                                </div>

                                                {/* CONDITIONAL SUPER ADMIN CLEARANCE VAULT (ONLY IF NO PENDING REQUEST) */}
                                                {isEmailChanged && !pendingRequest && (
                                                    <div className="col-span-1 sm:col-span-2 p-5 mt-2 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-5">
                                                        <div className="flex items-start gap-3 text-rose-900 text-xs">
                                                            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
                                                            <div className="space-y-2">
                                                                <p className="leading-relaxed">
                                                                    <strong>Security Alert:</strong> Changing the official email address transfers ownership of this account. You must request and provide a Super Admin Clearance Key to authorize this request.
                                                                </p>
                                                                <p className="font-bold text-rose-800 bg-rose-100/60 p-2.5 rounded-lg border border-rose-200">
                                                                    <Mail className="inline-block h-3.5 w-3.5 mr-1 mb-0.5" />
                                                                    The clearance key will be sent to your CURRENT email address ({user.email}) for verification, not the new one.
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center justify-between">
                                                                <label className="flex items-center gap-1.5 text-xs font-black text-rose-700 uppercase tracking-wider">
                                                                    <KeyRound className="h-3.5 w-3.5" /> Super Admin Clearance Key
                                                                </label>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => router.post('/admin/settings/security/request-clearance')}
                                                                    disabled={pendingClearance}
                                                                    className={`text-[10px] font-bold underline cursor-pointer ${pendingClearance ? 'text-slate-400' : 'text-rose-600 hover:text-rose-700'}`}
                                                                >
                                                                    {pendingClearance ? 'Key Requested (Pending)...' : 'Request Key'}
                                                                </button>
                                                            </div>
                                                            <Input 
                                                                type="password"
                                                                placeholder="Enter the emailed clearance key"
                                                                value={profileForm.data.super_admin_key} 
                                                                onChange={e => profileForm.setData('super_admin_key', e.target.value)} 
                                                                required={isEmailChanged}
                                                                className="rounded-xl h-11 text-xs border-rose-200 focus-visible:ring-rose-500 placeholder:text-slate-400 bg-white" 
                                                            />
                                                            {profileForm.errors.super_admin_key && <span className="text-xs font-semibold text-rose-600 mt-1 block">{profileForm.errors.super_admin_key}</span>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Barangay Details */}
                                            <div className="space-y-5">
                                                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Barangay Information</h3>
                                                
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Barangay Name</label>
                                                    <Input disabled={pendingRequest} value={profileForm.data.barangay_name} onChange={e => profileForm.setData('barangay_name', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                                    {profileForm.errors.barangay_name && <span className="text-xs font-semibold text-red-600 mt-1 block">{profileForm.errors.barangay_name}</span>}
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Barangay Email</label>
                                                        <Input disabled={pendingRequest} type="email" value={profileForm.data.contact_email} onChange={e => profileForm.setData('contact_email', e.target.value)} className="rounded-xl h-11 text-xs" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Contact Phone</label>
                                                        <Input disabled={pendingRequest} value={profileForm.data.contact_phone} onChange={e => profileForm.setData('contact_phone', e.target.value)} className="rounded-xl h-11 text-xs" />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Street / Location</label>
                                                    <Input disabled={pendingRequest} value={profileForm.data.house_street} onChange={e => profileForm.setData('house_street', e.target.value)} className="rounded-xl h-11 text-xs" />
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">City</label>
                                                        <Input disabled={pendingRequest} value={profileForm.data.city} onChange={e => profileForm.setData('city', e.target.value)} className="rounded-xl h-11 text-xs" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Province</label>
                                                        <Input disabled={pendingRequest} value={profileForm.data.province} onChange={e => profileForm.setData('province', e.target.value)} className="rounded-xl h-11 text-xs" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-3">
                                                <Button type="submit" disabled={profileForm.processing || pendingRequest} className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs cursor-pointer shadow-sm rounded-xl h-11 px-6 w-full sm:w-auto">
                                                    {profileForm.processing ? 'Submitting request...' : 'Request Profile Update'}
                                                </Button>
                                                {!pendingRequest && (
                                                    <p className="mt-2 text-[11px] text-slate-500 font-medium">Changes to these details will be sent to a super admin for approval.</p>
                                                )}
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden">
                                <CardHeader className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
                                    <CardTitle className="text-base font-extrabold text-slate-900">Update Password Credentials</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8 space-y-6">
                                    
                                    <form onSubmit={handleSecuritySubmit} className="space-y-6 max-w-xl">
                                        
                                        {/* OTP BYPASS TOGGLE LOGIC */}
                                        {!useOtpBypass ? (
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Current Active Password</label>
                                                    <button type="button" onClick={() => { setUseOtpBypass(true); securityForm.clearErrors(); }} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer">
                                                        Forgot your current password?
                                                    </button>
                                                </div>
                                                <PasswordInput 
                                                    value={securityForm.data.current_password} 
                                                    onChange={e => securityForm.setData('current_password', e.target.value)} 
                                                    required={!useOtpBypass} 
                                                    className="rounded-xl h-11 text-xs" 
                                                />
                                                {securityForm.errors.current_password && <span className="text-xs font-semibold text-red-600 mt-1 block">{securityForm.errors.current_password}</span>}
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5 p-5 rounded-2xl border border-blue-200 bg-blue-50/50">
                                                <div className="flex items-center justify-between">
                                                    <label className="flex items-center gap-1.5 text-xs font-black text-blue-700 uppercase tracking-wider">
                                                        <Mail className="h-3.5 w-3.5" /> Email Verification OTP
                                                    </label>
                                                    <button type="button" onClick={() => { setUseOtpBypass(false); securityForm.clearErrors(); }} className="text-[10px] font-bold text-slate-500 hover:text-slate-700 underline cursor-pointer">
                                                        I remember my password
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-blue-800 mb-3">Verify your identity via Email OTP to bypass your current password.</p>
                                                <div className="flex gap-2">
                                                    <Input 
                                                        type="text"
                                                        placeholder="6-digit code"
                                                        maxLength={6}
                                                        value={securityForm.data.otp} 
                                                        onChange={e => securityForm.setData('otp', e.target.value)} 
                                                        required={useOtpBypass}
                                                        className="rounded-xl h-11 text-xs flex-1 text-center tracking-[0.5em] font-bold bg-white" 
                                                    />
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={handleRequestOtp} 
                                                        disabled={isRequestingOtp || otpTimer > 0}
                                                        className="h-11 rounded-xl px-4 text-xs font-bold shrink-0 cursor-pointer text-blue-700 border-blue-200 hover:bg-blue-100 bg-white"
                                                    >
                                                        {isRequestingOtp ? 'Sending...' : otpTimer > 0 ? `Resend in ${formatTime(otpTimer)}` : 'Request OTP'}
                                                    </Button>
                                                </div>
                                                {securityForm.errors.otp && <span className="text-xs font-semibold text-red-600 mt-1 block">{securityForm.errors.otp}</span>}
                                            </div>
                                        )}

                                        {/* Passwords */}
                                        <div className="space-y-4 pt-2">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">New Complex Password</label>
                                                <PasswordInput value={securityForm.data.password} onChange={e => securityForm.setData('password', e.target.value)} autoComplete="new-password" required className="rounded-xl h-11 text-xs" />
                                                {securityForm.errors.password && <span className="text-xs font-semibold text-red-600 mt-1 block">{securityForm.errors.password}</span>}
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Confirm New Password</label>
                                                <PasswordInput value={securityForm.data.password_confirmation} onChange={e => securityForm.setData('password_confirmation', e.target.value)} autoComplete="new-password" required className="rounded-xl h-11 text-xs" />
                                            </div>
                                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-[11px] text-slate-500">
                                                <strong className="font-bold text-slate-700 block mb-1">Password Complexity Standard:</strong>
                                                Requires minimum 8 characters, at least one number, and one special symbol.
                                            </div>
                                        </div>

                                        <div className="pt-3">
                                            <Button type="submit" disabled={securityForm.processing} className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs cursor-pointer shadow-sm rounded-xl h-11 px-6 w-full sm:w-auto">
                                                {securityForm.processing ? 'Modifying security layers...' : 'Commit New Password'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}