import { Head, Link } from '@inertiajs/react';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-slate-50 px-4 py-12">
            <Head title="Privacy Policy" />

            <div className="mx-auto w-full max-w-2xl rounded-xl border bg-white p-8 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Mission-Lokal</p>
                <h1 className="mt-1 text-2xl font-bold text-blue-900">Privacy Policy</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    This policy explains how barangay staff use Mission-Lokal in line with the Data Privacy Act of 2012 (Republic Act No. 10173).
                </p>

                <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700">
                    <section>
                        <h2 className="font-semibold text-slate-900">What we collect</h2>
                        <p className="mt-1">
                            When you register or use the app we may collect your name, birthday, address, email, mobile number,
                            government ID image, parent/guardian details (for minors), concern reports, map pin location, photos
                            attached to reports, and account activity needed to run barangay services.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-slate-900">Why we collect it</h2>
                        <p className="mt-1">
                            Personal data is used only to verify you against barangay records, process community concerns and
                            blotters, assign personnel, send service updates, and keep an audit trail of staff actions.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-slate-900">Government IDs</h2>
                        <p className="mt-1">
                            Uploaded IDs are encrypted at rest on a private disk. Only authorized barangay administrators can
                            decrypt and view them during verification. IDs are not shown on the public feed.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-slate-900">Sensitive reports (VAWC / domestic)</h2>
                        <p className="mt-1">
                            Reports tagged as VAWC or domestic disputes are forced private. They never appear on the public
                            community feed. Only the reporter and authorized barangay staff or assigned personnel can see them.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-slate-900">Who can see your data</h2>
                        <p className="mt-1">
                            Fellow residents see only public concerns. Administrators manage verification, reports, and missions
                            for your barangay. Assigned personnel see only the mission details they need to respond. We do not
                            sell personal data.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-semibold text-slate-900">Your consent and rights</h2>
                        <p className="mt-1">
                            Registration requires explicit consent to this processing. You may ask the barangay administrator
                            to access, correct, or review your records, subject to barangay procedures and applicable law.
                        </p>
                    </section>
                </div>

                <div className="mt-8 flex items-center justify-between border-t pt-4">
                    <Link href="/register" className="text-sm text-blue-600 hover:underline">
                        Back to registration
                    </Link>
                    <Link href="/login" className="text-sm text-blue-600 hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
