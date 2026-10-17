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
            <div className="w-full">
                {children ?? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-2xs">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 border border-blue-100 shadow-2xs">
                            <Construction className="h-7 w-7" />
                        </div>
                        <h1 className="text-xl font-black text-slate-900">{title}</h1>
                        <p className="mt-1.5 max-w-sm text-xs font-semibold text-slate-500 leading-relaxed">
                            {description ?? 'This command center module is currently being finalized for deployment.'}
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}