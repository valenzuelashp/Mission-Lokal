import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Settings as SettingsIcon, User, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/Types';

interface Props {
    user: { first_name: string; last_name: string; email: string };
    barangay: { name: string; office_address: string };
}

export default function Settings({ user, barangay }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    // Profile Configuration Hook
    const profileForm = useForm({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
    });

    // Security Rules Hook 
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
                <h2 className="text-2xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
                    <SettingsIcon className="h-6 w-6 text-blue-700" /> Control Settings Panel
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage administrative contact details, review active container nodes, and update access credentials for <strong>{barangay.name}</strong>.
                </p>
            </div>

            {flash.success && (
                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{flash.success}</span>
                </div>
            )}

            <div className="flex flex-col gap-6 md:flex-row items-start">
                {/* Navigation Tab Toggle List */}
                <Card className="w-full md:w-64 shrink-0 shadow-sm">
                    <CardContent className="p-2 flex flex-row md:flex-col gap-1 overflow-x-auto whitespace-nowrap">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left w-full ${
                                activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <User className="h-4 w-4" /> Personal Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left w-full ${
                                activeTab === 'security' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <ShieldAlert className="h-4 w-4" /> Security Access
                        </button>
                    </CardContent>
                </Card>

                {/* Sub-Form Container */}
                <div className="flex-1 w-full">
                    {activeTab === 'profile' ? (
                        <Card className="shadow-sm">
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle className="text-base text-slate-900">Administrative Identity Details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">First Name</label>
                                            <Input value={profileForm.data.first_name} onChange={e => profileForm.setData('first_name', e.target.value)} required />
                                            {profileForm.errors.first_name && <span className="text-xs text-red-600 mt-1 block">{profileForm.errors.first_name}</span>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Name</label>
                                            <Input value={profileForm.data.last_name} onChange={e => profileForm.setData('last_name', e.target.value)} required />
                                            {profileForm.errors.last_name && <span className="text-xs text-red-600 mt-1 block">{profileForm.errors.last_name}</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Email Address</label>
                                        <Input type="email" value={profileForm.data.email} onChange={e => profileForm.setData('email', e.target.value)} required />
                                        {profileForm.errors.email && <span className="text-xs text-red-600 mt-1 block">{profileForm.errors.email}</span>}
                                    </div>
                                    <div className="pt-2">
                                        <Button type="submit" disabled={profileForm.processing} className="bg-blue-700 text-white hover:bg-blue-800">
                                            {profileForm.processing ? 'Saving details...' : 'Update Account Info'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="shadow-sm">
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle className="text-base text-slate-900">Update Password Credentials</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 flex items-start gap-2 max-w-md">
                                    <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="font-semibold">Mandatory Password Requirement Policy:</strong>
                                        <ul className="list-disc list-inside mt-1 ml-1 text-blue-800 space-y-0.5">
                                            <li>Minimum length of 8+ characters</li>
                                            <li>Must contain at least 1 number</li>
                                            <li>Must contain at least 1 specific special symbol</li>
                                        </ul>
                                    </div>
                                </div>

                                <form onSubmit={handleSecuritySubmit} className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Current Active Password</label>
                                        <Input type="password" value={securityForm.data.current_password} onChange={e => securityForm.setData('current_password', e.target.value)} required />
                                        {securityForm.errors.current_password && <span className="text-xs text-red-600 mt-1 block">{securityForm.errors.current_password}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Complex Password</label>
                                        <Input type="password" value={securityForm.data.password} onChange={e => securityForm.setData('password', e.target.value)} required />
                                        {securityForm.errors.password && <span className="text-xs text-red-600 mt-1 block">{securityForm.errors.password}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Confirm New Password</label>
                                        <Input type="password" value={securityForm.data.password_confirmation} onChange={e => securityForm.setData('password_confirmation', e.target.value)} required />
                                        {securityForm.errors.password_confirmation && <span className="text-xs text-red-600 mt-1 block">{securityForm.errors.password_confirmation}</span>}
                                    </div>
                                    <div className="pt-2">
                                        <Button type="submit" disabled={securityForm.processing} className="bg-blue-700 text-white hover:bg-blue-800">
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