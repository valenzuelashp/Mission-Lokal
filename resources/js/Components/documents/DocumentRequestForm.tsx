import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

type Field = { key: string; label: string };
type Template = { id: string; fields: Field[] };

type Props = {
    template: Template;
    onCancel?: () => void;
};

export default function DocumentRequestForm({ template, onCancel }: Props) {
    const theme = useResidentTheme();
    const form = useForm<{ answers: Record<string, string> }>({
        answers: Object.fromEntries(template.fields.map((field) => [field.key, ''])),
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(`/documents/${template.id}`);
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <p className={`text-xs font-medium leading-relaxed ${theme.textMuted}`}>
                Your name and address come from your profile. Fill in the remaining details.
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
                <p className={`text-sm font-semibold ${theme.textMuted}`}>
                    This request only uses the name and address on your profile.
                </p>
            )}
            <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={form.processing} className={`h-10 rounded-xl font-black text-white ${theme.primaryBg} ${theme.primaryHover}`}>
                    {form.processing ? 'Sending request…' : 'Send request'}
                </Button>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} className={`h-10 rounded-xl ${theme.cardBorder} ${theme.cardBg} ${theme.textMain} ${theme.hoverBg}`}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}