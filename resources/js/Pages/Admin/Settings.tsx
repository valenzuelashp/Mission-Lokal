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

            <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                    <SettingsIcon className="h-6 w-6 text-blue-600" /> Control Settings Panel
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                    Manage administrative credentials and security policies for <strong>{barangay.name}</strong>.
                </p>
            </div>

            {flash?.success && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-xs font-bold text-emerald-900 flex items-center gap-2.5 shadow-2xs">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{flash.success}</span>
                </div>
            )}

            <div className="flex flex-col gap-6 md:flex-row items-start">
                <Card className="w-full md:w-64 shrink-0 shadow-xs border-slate-200/80 bg-white rounded-2xl">
                    <CardContent className="p-2.5 flex flex-row md:flex-col gap-1 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-extrabold rounded-xl transition-all text-left w-full cursor-pointer ${
                                activeTab === 'profile' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <User className="h-4 w-4" /> Personal Profile
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('security')}
                            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-extrabold rounded-xl transition-all text-left w-full cursor-pointer ${
                                activeTab === 'security' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <ShieldAlert className="h-4 w-4" /> Security Access
                        </button>
                    </CardContent>
                </Card>

                <div className="flex-1 w-full">
                    {activeTab === 'profile' ? (
                        <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                                <CardTitle className="text-base font-extrabold text-slate-900">Administrative Identity Details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">First Name</label>
                                            <Input value={profileForm.data.first_name} onChange={e => profileForm.setData('first_name', e.target.value)} required />
                                            {profileForm.errors.first_name && <span className="text-xs font-medium text-red-600 mt-1 block">{profileForm.errors.first_name}</span>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Last Name</label>
                                            <Input value={profileForm.data.last_name} onChange={e => profileForm.setData('last_name', e.target.value)} required />
                                            {profileForm.errors.last_name && <span className="text-xs font-medium text-red-600 mt-1 block">{profileForm.errors.last_name}</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Official Email Address</label>
                                        <Input type="email" value={profileForm.data.email} onChange={e => profileForm.setData('email', e.target.value)} required />
                                        {profileForm.errors.email && <span className="text-xs font-medium text-red-600 mt-1 block">{profileForm.errors.email}</span>}
                                    </div>
                                    <div className="pt-2">
                                        <Button type="submit" disabled={profileForm.processing} className="bg-blue-700 text-white hover:bg-blue-800 font-bold text-xs cursor-pointer shadow-sm">
                                            {profileForm.processing ? 'Saving details...' : 'Update Account Info'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                                <CardTitle className="text-base font-extrabold text-slate-900">Update Password Credentials</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="mb-5 rounded-xl bg-blue-50 border border-blue-200 p-4 text-xs text-blue-900 flex items-start gap-2.5 max-w-lg">
                                    <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="font-extrabold uppercase tracking-wide">Password Complexity Standard:</strong>
                                        <ul className="list-disc list-inside mt-1 ml-1 text-blue-800 space-y-0.5 font-medium">
                                            <li>Minimum 8 characters length</li>
                                            <li>At least one numerical digit</li>
                                            <li>At least one special symbol</li>
                                        </ul>
                                    </div>
                                </div>

                                <form onSubmit={handleSecuritySubmit} className="space-y-4 max-w-lg">
                                    <div>
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Current Active Password</label>
                                        <PasswordInput value={securityForm.data.current_password} onChange={e => securityForm.setData('current_password', e.target.value)} autoComplete="current-password" required />
                                        {securityForm.errors.current_password && <span className="text-xs font-medium text-red-600 mt-1 block">{securityForm.errors.current_password}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">New Complex Password</label>
                                        <PasswordInput value={securityForm.data.password} onChange={e => securityForm.setData('password', e.target.value)} autoComplete="new-password" required />
                                        {securityForm.errors.password && <span className="text-xs font-medium text-red-600 mt-1 block">{securityForm.errors.password}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Confirm New Password</label>
                                        <PasswordInput value={securityForm.data.password_confirmation} onChange={e => securityForm.setData('password_confirmation', e.target.value)} autoComplete="new-password" required />
                                        {securityForm.errors.password_confirmation && <span className="text-xs font-medium text-red-600 mt-1 block">{securityForm.errors.password_confirmation}</span>}
                                    </div>
                                    <div className="pt-2">
                                        <Button type="submit" disabled={securityForm.processing} className="bg-blue-700 text-white hover:bg-blue-800 font-bold text-xs cursor-pointer shadow-sm">
                                            {securityForm.processing ? 'Modifying security layers...' : 'Commit New Password'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}