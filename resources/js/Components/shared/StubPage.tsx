import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Construction } from 'lucide-react';

type StubPageProps = PropsWithChildren<{
    title: string;
    description?: string;
}>;

export default function StubPage({ title, description, children }: StubPageProps) {
    return (
        <AdminLayout title={title}>
            <Head title={title} />
            {children ?? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-xs">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3 border border-blue-100">
                        <Construction className="h-6 w-6" />
                    </div>
                    <h1 className="text-lg font-black text-slate-900">{title}</h1>
                    <p className="mt-1 max-w-sm text-xs font-medium text-slate-500 leading-relaxed">
                        {description ?? 'This command center module is currently being finalized for deployment.'}
                    </p>
                </div>
            )}
        </AdminLayout>
    );
}