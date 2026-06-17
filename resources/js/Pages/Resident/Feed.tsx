import { Head } from '@inertiajs/react';
import ResidentLayout from '@/Layouts/ResidentLayout';

export default function Feed() {
    return (
        <ResidentLayout>
            <Head title="Feed" />
            <h1 className="text-2xl font-semibold">Public Feed</h1>
        </ResidentLayout>
    );
}
