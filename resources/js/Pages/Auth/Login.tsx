import { Head, useForm, Link } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { PasswordInput } from '@/Components/ui/password-input';
import { Label } from '@/Components/ui/label';

// Tell TypeScript about Ziggy's route function
declare function route(name: string): string;

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        account_id: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Login" />
            <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
                <Card className="w-full max-w-sm">
                    <CardHeader className="items-center text-center">
                        <img
                            src="/images/barangay-tambo-logo.png"
                            alt="Barangay Tambo, City of Parañaque"
                            className="h-28 w-28 object-contain sm:h-32 sm:w-32"
                        />
                        <CardTitle>Mission-Lokal</CardTitle>
                        <CardDescription>Resident &amp; admin sign in</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="account_id">Account ID</Label>
                                <Input
                                    id="account_id"
                                    value={data.account_id}
                                    onChange={(e) => setData('account_id', e.target.value)}
                                    autoComplete="username"
                                />
                                {errors.account_id && <p className="text-sm text-destructive">{errors.account_id}</p>}
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link 
                                        href={route('password.request')} 
                                        className="text-xs text-primary underline-offset-4 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
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
                            <Button type="button" variant="outline" className="w-full" asChild>
                                <Link href={route('register')}>
                                    Register
                                </Link>
                            </Button>
                            <p className="text-center text-xs text-muted-foreground">
                                Already submitted?{' '}
                                <Link href="/account-status" className="text-primary underline-offset-4 hover:underline">
                                    Check registration status
                                </Link>
                            </p>
                            <p className="text-center text-xs text-muted-foreground">
                                <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
                                    Privacy Policy
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}