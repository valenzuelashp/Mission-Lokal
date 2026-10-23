import { Head, Link, useForm } from '@inertiajs/react';
import ResidentLayout, { useResidentTheme } from '@/Layouts/ResidentLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

type Field = { key: string; label: string };

export default function CreateDocumentRequest({ template }: { template: { id: string; name: string; fields: Field[] } }) {
    const theme = useResidentTheme();
    const form = useForm<{ answers: Record<string, string> }>({
        answers: Object.fromEntries(template.fields.map((field) => [field.key, ''])),
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(`/documents/${template.id}`);
    };

    return (
        <ResidentLayout>
            <Head title={template.name} />
            <form onSubmit={submit} className="mx-auto max-w-xl space-y-5 pb-10">
                <Link href="/documents" className={`text-xs font-bold ${theme.primaryText}`}>Back</Link>
                <h1 className={`text-2xl font-black ${theme.textMain}`}>{template.name}</h1>
                <p className={`text-sm font-medium ${theme.textMuted}`}>
                    Your name and address come from your profile. Fill in the rest.
                </p>
                {template.fields.map((field) => (
                    <label key={field.key} className="block space-y-1.5">
                        <span className={`text-xs font-black uppercase tracking-wider ${theme.textMuted}`}>{field.label}</span>
                        <Input
                            required
                            value={form.data.answers[field.key] ?? ''}
                            onChange={(event) => form.setData('answers', { ...form.data.answers, [field.key]: event.target.value })}
                            className="h-11 rounded-xl"
                        />
                        {form.errors[`answers.${field.key}`] && (
                            <span className="text-xs font-semibold text-rose-600">{form.errors[`answers.${field.key}`]}</span>
                        )}
                    </label>
                ))}
                {template.fields.length === 0 && (
                    <p className={`text-sm font-semibold ${theme.textMuted}`}>This request only uses the name and address on your profile.</p>
                )}
                <Button type="submit" disabled={form.processing} className={`h-11 rounded-xl font-black text-white ${theme.primaryBg}`}>
                    Send request
                </Button>
            </form>
        </ResidentLayout>
    );
}
