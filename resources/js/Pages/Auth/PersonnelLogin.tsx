import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function PersonnelLogin() {
    const { data, setData, post, processing, errors } = useForm({
        account_id: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/personnel/login');
    };

    return (
        <>
            <Head title="Personnel Login" />
            <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
                <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border bg-background p-6 shadow-sm">
                    <div>
                        <h1 className="text-xl font-semibold">Personnel Portal</h1>
                        <p className="text-sm text-muted-foreground">Mission assignments &amp; proof upload</p>
                    </div>
                    <div>
                        <label htmlFor="account_id" className="text-sm font-medium">Account ID</label>
                        <input
                            id="account_id"
                            value={data.account_id}
                            onChange={(e) => setData('account_id', e.target.value)}
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        />
                        {errors.account_id && <p className="mt-1 text-sm text-red-600">{errors.account_id}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
                    >
                        Sign in
                    </button>
                </form>
            </div>
        </>
    );
}
