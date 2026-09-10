import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { PasswordInput } from '@/Components/ui/password-input';
import { Label } from '@/Components/ui/label';

export default function AdminPersonnelLogin() {
    const { data, setData, post, processing, errors } = useForm({
        account_id: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin-personnel/login'); // <--- UPDATED TO MATCH YOUR NEW ROUTE
    };

    return (
        <>
            <Head title="Admin & Personnel Login" />
            <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
                <Card className="w-full max-w-sm">
                    <CardHeader className="items-center text-center">
                        <img
                            src="/images/barangay-tambo-logo.png"
                            alt="Barangay Tambo, City of Parañaque"
                            className="h-28 w-28 object-contain sm:h-32 sm:w-32"
                        />
                        <CardTitle>Command Portal</CardTitle>
                        <CardDescription>Admin &amp; personnel sign in</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="account_id">Account ID / Email</Label>
                                <Input
                                    id="account_id"
                                    value={data.account_id}
                                    onChange={(e) => setData('account_id', e.target.value)}
                                    autoComplete="username"
                                />
                                {errors.account_id && <p className="text-sm text-destructive">{errors.account_id}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="current-password"
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={processing}>
                                Sign in
                            </Button>
                            <p className="text-center text-xs text-muted-foreground">
                                Resident?{' '}
                                <Link href="/login" className="text-primary underline">
                                    Resident login
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}