import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Settings as SettingsIcon, User, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { PasswordInput } from '@/Components/ui/password-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/Types';

interface Props {
    user: { first_name: string; last_name: string; email: string };
    barangay: { name: string; office_address: string };
}

export default function Settings({ user, barangay }: Props) {
    const { flash } = usePage<PageProps & { flash?: { success?: string } }>().props;
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    const profileForm = useForm({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
    });

    const securityForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put('/admin/settings/profile');
    };

    const handleSecuritySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        securityForm.put('/admin/settings/security', {
            onSuccess: () => securityForm.reset('current_password', 'password', 'password_confirmation'),
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
                                <User className="h-4 w-4" /> Personal Profile
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
                            <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden">
                                <CardHeader className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
                                    <CardTitle className="text-base font-extrabold text-slate-900">Administrative Identity Details</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8">
                                    <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-xl">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">First Name</label>
                                                <Input value={profileForm.data.first_name} onChange={e => profileForm.setData('first_name', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                                {profileForm.errors.first_name && <span className="text-xs font-semibold text-red-600 mt-1 block">{profileForm.errors.first_name}</span>}
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Last Name</label>
                                                <Input value={profileForm.data.last_name} onChange={e => profileForm.setData('last_name', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                                {profileForm.errors.last_name && <span className="text-xs font-semibold text-red-600 mt-1 block">{profileForm.errors.last_name}</span>}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Official Email Address</label>
                                            <Input type="email" value={profileForm.data.email} onChange={e => profileForm.setData('email', e.target.value)} required className="rounded-xl h-11 text-xs" />
                                            {profileForm.errors.email && <span className="text-xs font-semibold text-red-600 mt-1 block">{profileForm.errors.email}</span>}
                                        </div>
                                        <div className="pt-3">
                                            <Button type="submit" disabled={profileForm.processing} className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs cursor-pointer shadow-sm rounded-xl h-11 px-6">
                                                {profileForm.processing ? 'Saving details...' : 'Update Account Info'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden">
                                <CardHeader className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
                                    <CardTitle className="text-base font-extrabold text-slate-900">Update Password Credentials</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 sm:p-8 space-y-6">
                                    <div className="rounded-2xl bg-blue-50/80 border border-blue-200 p-5 text-xs text-blue-950 flex items-start gap-3 max-w-xl">
                                        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <strong className="font-black uppercase tracking-wider block">Password Complexity Standard:</strong>
                                            <ul className="list-disc list-inside text-blue-900 space-y-0.5 font-medium">
                                                <li>Minimum 8 characters length</li>
                                                <li>At least one numerical digit</li>
                                                <li>At least one special symbol</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSecuritySubmit} className="space-y-5 max-w-xl">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Current Active Password</label>
                                            <PasswordInput value={securityForm.data.current_password} onChange={e => securityForm.setData('current_password', e.target.value)} autoComplete="current-password" required className="rounded-xl h-11 text-xs" />
                                            {securityForm.errors.current_password && <span className="text-xs font-semibold text-red-600 mt-1 block">{securityForm.errors.current_password}</span>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">New Complex Password</label>
                                            <PasswordInput value={securityForm.data.password} onChange={e => securityForm.setData('password', e.target.value)} autoComplete="new-password" required className="rounded-xl h-11 text-xs" />
                                            {securityForm.errors.password && <span className="text-xs font-semibold text-red-600 mt-1 block">{securityForm.errors.password}</span>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Confirm New Password</label>
                                            <PasswordInput value={securityForm.data.password_confirmation} onChange={e => securityForm.setData('password_confirmation', e.target.value)} autoComplete="new-password" required className="rounded-xl h-11 text-xs" />
                                            {securityForm.errors.password_confirmation && <span className="text-xs font-semibold text-red-600 mt-1 block">{securityForm.errors.password_confirmation}</span>}
                                        </div>
                                        <div className="pt-3">
                                            <Button type="submit" disabled={securityForm.processing} className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs cursor-pointer shadow-sm rounded-xl h-11 px-6">
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