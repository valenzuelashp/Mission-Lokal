import { Head, Link } from '@inertiajs/react';
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 px-4 py-12 text-slate-900">
            <Head title="Privacy Policy & Compliance" />

            <div className="mx-auto w-full max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer" asChild>
                        <Link href="/login">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Authentication
                        </Link>
                    </Button>
                    <span className="font-mono text-xs text-blue-700 font-bold uppercase tracking-widest">Republic Act No. 10173</span>
                </div>

                <Card className="progressive-blur rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-xl shadow-blue-950/5 backdrop-blur-md">
                    <CardContent className="p-0 space-y-6">
                        <div className="border-b border-slate-200 pb-5">
                            <p className="text-xs font-black uppercase tracking-widest text-blue-700">Mission-Lokal Governance</p>
                            <h1 className="mt-1 text-3xl font-black text-slate-900 tracking-tight">Data Privacy Policy</h1>
                            <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                                This policy details how municipal and barangay staff process citizen data in strict alignment with the Data Privacy Act of 2012 (Republic Act No. 10173).
                            </p>
                        </div>

                        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700">
                            <section className="space-y-2">
                                <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" /> 1. Data Categories Collected
                                </h2>
                                <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    When you register or utilize our progressive web application, we collect your legal name, birthday, physical address, email, mobile number, government ID graphic, parent/guardian details (for minor accounts), community concern reports, geolocation map pins, media attachments, and official audit log interactions.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> 2. Purpose Limitation & Processing
                                </h2>
                                <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    Personal information is processed exclusively for verifying residency against official barangay logbooks, investigating community concerns, mediating blotter disputes, dispatching field personnel, and maintaining immutable security audit logs.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-indigo-500" /> 3. Government ID Encryption at Rest
                                </h2>
                                <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    Uploaded government identification files are encrypted using robust AES-256-GCM encryption at rest on secure private server storage. Only authorized verifying officers can decrypt and inspect documents during onboarding. IDs are never published publicly.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-purple-500" /> 4. Sensitive Reports (VAWC & Domestic Protection)
                                </h2>
                                <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    Reports identified as VAWC, domestic violence, or otherwise force-private are kept out of the public community feed. VAWC mission details are restricted to the reporting resident, authorized barangay administrators, and assigned VAW Desk personnel. Automated checks may not recognize every sensitive report, so avoid including unnecessary identifying details in reports intended for public handling.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-sky-500" /> 5. AI-Assisted Concern Triage
                                </h2>
                                <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    Concern text and up to five uploaded images may be sent to Google Gemini for analysis unless the application identifies the concern as private or sensitive before processing. Identified private and force-private concerns use local analysis instead. Automated detection can miss sensitive details, so do not include unnecessary personal information in a report.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-cyan-500" /> 6. Phone and Walk-in Reports
                                </h2>
                                <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    Residents may report concerns by phone or in person without creating a Mission-Lokal account. Authorized barangay admins record the provided name, contact details, incident information, and intake source for follow-up. These contact details are restricted internal information and are not displayed in public concern listings. Accountless reports do not have resident-account verification or resident notifications.
                                </p>
                            </section>
                        </div>

                        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5 text-xs font-bold">
                            <Link href="/register" className="text-blue-700 hover:underline">
                                &larr; Back to Registration
                            </Link>
                            <Link href="/login" className="text-blue-700 hover:underline">
                                Return to Sign In &rarr;
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}