import EmailVerificationNotificationController from '@/actions/App/Http/Controllers/Auth/EmailVerificationNotificationController';
import { logout } from '@/routes';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import loginimage from '@/assets/images/auth/login_img.png';

import { Button } from '@/components/ui/button';

export default function VerifyEmail({ status }: { status?: string }) {
    const { auth } = usePage().props as { auth?: { user?: { email?: string } } };
    const email = auth?.user?.email;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white font-sans">
            <Head title="Verify Email" />

            {/* Left Column - Form */}
            <div className="flex w-full flex-col overflow-y-auto p-8 sm:p-12 md:p-20 lg:w-1/2">
                <div className="mb-12">
                    <Link href="/" className="text-2xl font-bold tracking-tight text-[#6C3CF0]">
                        Tut<span className="text-[#1a1a1a]">Star</span>
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-[400px]">
                    <h1 className="mb-2 text-3xl font-bold text-[#1a1a1a] sm:text-4xl">Verify Email</h1>
                    <p className="mb-10 text-neutral-500">Please verify your email address by clicking on the link we just emailed to you.</p>

                    {status === 'verification-link-sent' && (
                        <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-600">
                            A new verification link has been sent to {email || 'your registered email address'}.
                        </div>
                    )}

                    {email && (
                        <div className="mb-10 text-sm text-neutral-500">
                            Verification email sent to: <span className="font-medium text-[#1a1a1a]">{email}</span>
                        </div>
                    )}

                    <Form {...EmailVerificationNotificationController.store.form()} className="flex flex-col gap-8">
                        {({ processing }) => (
                            <>
                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="h-14 w-full rounded-xl bg-[#6C3CF0] text-lg font-bold text-white hover:bg-[#5a30d6]"
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
                                    Resend verification email
                                </Button>

                                <div className="text-center text-sm font-medium text-neutral-600">
                                    <Link href={logout()} className="text-[#FF8A8A] hover:underline">
                                        Log out
                                    </Link>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>

            {/* Right Column - Graphic Placeholder */}
            <div className="relative hidden w-1/2 items-center justify-center bg-[#F9F8FF] lg:flex">
                <div className="relative flex h-full w-full items-center justify-center p-20">
                    <img src={loginimage} alt="" className='w-full object-cover'/>
                </div>
            </div>
        </div>
    );
}
