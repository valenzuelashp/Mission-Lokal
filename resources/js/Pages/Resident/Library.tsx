import { Head } from '@inertiajs/react';
import { BookOpen, Phone, Shield } from 'lucide-react';
import PageHeader from '@/Components/shared/PageHeader';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import ResidentLayout from '@/Layouts/ResidentLayout';
import type { LibraryPageProps } from '@/Types';

const typeIcon = {
    manual: BookOpen,
    contact: Phone,
    evacuation: Shield,
};

export default function Library({ items }: LibraryPageProps) {
    return (
        <ResidentLayout>
            <Head title="Library" />
            <PageHeader
                title="Barangay library"
                description="Emergency guides, contacts, and evacuation info — available offline when installed as PWA."
            />

            <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item) => {
                    const Icon = typeIcon[item.type];
                    return (
                        <Card key={item.id} className="transition-shadow hover:shadow-md">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <Badge variant="outline" className="capitalize">
                                        {item.type}
                                    </Badge>
                                </div>
                                <CardTitle className="text-base pt-2">{item.title}</CardTitle>
                                <CardDescription>{item.category}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </ResidentLayout>
    );
}
