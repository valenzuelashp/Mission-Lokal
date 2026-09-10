import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { PasswordInput } from '@/Components/ui/password-input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';

interface Props { user_id: string; }

export default function ResetPassword({ user_id }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: user_id,
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // @ts-ignore
        post(window.route('password.update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <Head title="Reset Password" />
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create New Password</CardTitle>
                    <CardDescription>
                        Please input a new secure authorization key. Your password must be at least 8 characters long and contain 1 number and 1 symbol.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <input type="hidden" value={data.user_id} />
                        
                        <div className="space-y-1">
                            <Label htmlFor="password">New Password</Label>
                            <PasswordInput
                                id="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <PasswordInput
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                            {errors.password_confirmation && <p className="text-sm text-red-500 mt-1">{errors.password_confirmation}</p>}
                        </div>

                        <Button className="w-full" type="submit" disabled={processing}>
                            Reset Password
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}