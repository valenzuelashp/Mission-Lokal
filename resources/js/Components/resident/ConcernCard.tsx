import { Link } from '@inertiajs/react';
import { MapPin, ThumbsUp } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import type { PublicConcern, Severity } from '@/Types';

const severityVariant: Record<Severity, 'success' | 'secondary' | 'warning' | 'danger'> = {
    low: 'success',
    medium: 'secondary',
    high: 'warning',
    critical: 'danger',
};

const severityLabel: Record<Severity, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
};

type Props = {
    concern: PublicConcern;
};

export default function ConcernCard({ concern }: Props) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle className="text-base">
                            <Link href={`/concerns/${concern.id}`} className="hover:text-primary">
                                {concern.title}
                            </Link>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{concern.category}</p>
                    </div>
                    <Badge variant={severityVariant[concern.severity]}>{severityLabel[concern.severity]}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{concern.location_label}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{concern.created_at}</span>
                    <Button variant={concern.has_voted ? 'secondary' : 'outline'} size="sm" disabled>
                        <ThumbsUp className="h-4 w-4" />
                        {concern.vote_count}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
