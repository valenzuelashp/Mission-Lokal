import { Head, Link, useForm } from '@inertiajs/react';
import CertificatePaper from '@/Components/documents/CertificatePaper';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

type FieldOption = { key: string; label: string };

type Template = {
    id: string;
    name: string;
    body: string;
    signatory_name: string;
    signatory_title: string;
    resident_fields: string[];
    is_enabled: boolean;
    is_system: boolean;
    paper_size: 'show' | 'short' | 'long' | 'a4';
};

type Letterhead = {
    barangay_name: string | null;
    city: string | null;
    contact_phone: string | null;
    logo_url: string | null;
};

const sample: Record<string, string> = {
    resident_name: 'MARIA CLARA RESIDENT',
    address: '124 Quirino Avenue, Tambo',
    barangay_name: 'Barangay Tambo',
    date: 'October 23, 2026',
    signatory_name: 'Juan Dela Cruz',
    signatory_title: 'Barangay Chairman',
    purpose: 'school enrollment',
    requesting_office: 'Tambo Elementary School',
    business_name: 'TAMBO SARI-SARI STORE',
    business_nature: 'retail goods',
    business_address: '124 Quirino Avenue',
    years_of_residency: '10 years',
};

const defaultBody = 'This is to certify that this document is hereby granted and issued to {{resident_name}}, a resident of {{address}}, {{barangay_name}}.\n\nThis certification is being issued upon the request of {{resident_name}} for {{purpose}}.';

function preview(body: string, signatoryName: string, signatoryTitle: string): string {
    return body.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (_, key: string) => {
        if (key === 'signatory_name') return signatoryName || sample.signatory_name;
        if (key === 'signatory_title') return signatoryTitle || sample.signatory_title;
        return sample[key] ?? `{{${key}}}`;
    });
}

export default function DocumentForm({
    template,
    fields,
    letterhead,
    signatureUrl,
}: {
    template: Template | null;
    fields: FieldOption[];
    letterhead: Letterhead;
    signatureUrl: string | null;
}) {
    const form = useForm({
        name: template?.name ?? '',
        body: template?.body ?? defaultBody,
        signatory_name: template?.signatory_name ?? '',
        signatory_title: template?.signatory_title ?? 'Barangay Chairman',
        resident_fields: template?.resident_fields ?? ['purpose'],
        paper_size: template?.paper_size ?? 'short',
        is_enabled: template?.is_enabled ?? true,
    });

    const toggleField = (key: string) => {
        const current = form.data.resident_fields;
        form.setData(
            'resident_fields',
            current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
        );
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (template) {
            form.put(`/admin/documents/templates/${template.id}`);
            return;
        }
        form.post('/admin/documents/templates');
    };

    return (
        <AdminLayout title="Command Center: Document wording">
            <Head title={template ? `Edit ${template.name}` : 'Add document'} />
            <form onSubmit={submit} className="mx-auto w-full max-w-3xl space-y-6 pb-16">
                <div>
                    <Link href="/admin/documents" className="text-xs font-bold text-blue-700 hover:underline">Back to documents</Link>
                    <h1 className="mt-2 text-2xl font-black text-slate-900">{template ? template.name : 'New document'}</h1>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                        Write the certificate in your barangay’s wording. Blanks in double braces are filled from the resident’s profile or their request.
                    </p>
                </div>

                <label className="block space-y-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600">Document name</span>
                    <Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="h-11 rounded-xl text-sm" required />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-1.5">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-600">Signatory name</span>
                        <Input value={form.data.signatory_name} onChange={(event) => form.setData('signatory_name', event.target.value)} className="h-11 rounded-xl text-sm" placeholder="Name printed on the certificate" />
                    </label>
                    <label className="block space-y-1.5">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-600">Signatory title</span>
                        <Input value={form.data.signatory_title} onChange={(event) => form.setData('signatory_title', event.target.value)} className="h-11 rounded-xl text-sm" required />
                    </label>
                </div>

                <label className="block space-y-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600">Paper size</span>
                    <select
                        value={form.data.paper_size}
                        onChange={(event) => form.setData('paper_size', event.target.value as 'show' | 'short' | 'long' | 'a4')}
                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold"
                    >
                        <option value="show">Show only</option>
                        <option value="short">Short (8.5 × 11 in)</option>
                        <option value="long">Long (8.5 × 13 in)</option>
                        <option value="a4">A4</option>
                    </select>
                    <span className="block text-[11px] font-medium text-slate-500">Show only stays on screen. Short, long, and A4 set the printed page.</span>
                </label>

                <fieldset className="space-y-2">
                    <legend className="text-xs font-black uppercase tracking-wider text-slate-600">What the resident fills in</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {fields.map((field) => (
                            <label key={field.key} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={form.data.resident_fields.includes(field.key)}
                                    onChange={() => toggleField(field.key)}
                                />
                                {field.label}
                                <span className="font-mono text-[10px] text-slate-400">{`{{${field.key}}}`}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <label className="block space-y-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600">Certificate wording</span>
                    <textarea
                        required
                        rows={8}
                        value={form.data.body}
                        onChange={(event) => form.setData('body', event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 p-4 text-sm leading-relaxed"
                    />
                    <span className="block text-[11px] font-medium text-slate-500">
                        Always available: {`{{resident_name}} {{address}} {{barangay_name}} {{date}} {{signatory_name}} {{signatory_title}}`}
                    </span>
                </label>

                <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <input
                        type="checkbox"
                        checked={form.data.is_enabled}
                        onChange={(event) => form.setData('is_enabled', event.target.checked)}
                    />
                    Residents can request this document
                </label>

                <div>
                    <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-500">Sample with stand-in details</p>
                    <CertificatePaper
                        paperSize={form.data.paper_size}
                        title={form.data.name || 'Document'}
                        barangayName={letterhead.barangay_name ?? sample.barangay_name}
                        city={letterhead.city}
                        contactPhone={letterhead.contact_phone}
                        logoUrl={letterhead.logo_url}
                        body={preview(form.data.body, form.data.signatory_name, form.data.signatory_title)}
                        issuedDay="23rd"
                        issuedMonth="October"
                        issuedYear="2026"
                        signatoryName={form.data.signatory_name || sample.signatory_name}
                        signatoryTitle={form.data.signatory_title || sample.signatory_title}
                        signatureUrl={signatureUrl}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button asChild type="button" variant="outline" className="h-11 rounded-xl font-bold">
                        <Link href="/admin/documents">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={form.processing} className="h-11 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700">
                        Save document
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
