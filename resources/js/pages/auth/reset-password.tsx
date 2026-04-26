import NewPasswordController from '@/actions/App/Http/Controllers/Auth/NewPasswordController';
import { Form, Head, Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import loginimage from '@/assets/images/auth/login_img.png';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-white font-sans">
            <Head title="Reset Password" />

            {/* Left Column - Form */}
            <div className="flex w-full flex-col overflow-y-auto p-8 sm:p-12 md:p-20 lg:w-1/2">
                <div className="mb-12">
                    <Link href="/" className="text-2xl font-bold tracking-tight text-[#6C3CF0]">
                        Tut<span className="text-[#1a1a1a]">Star</span>
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-[400px]">
                    <h1 className="mb-2 text-3xl font-bold text-[#1a1a1a] sm:text-4xl">Reset Password</h1>
                    <p className="mb-10 text-neutral-500">Please enter your new password below</p>

                    <Form
                        {...NewPasswordController.store.form()}
                        transform={(data) => ({ ...data, token, email })}
                        resetOnSuccess={['password', 'password_confirmation']}
                        className="flex flex-col gap-8"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Email Field (Readonly) */}
                                <div className="relative">
                                    <div className="absolute -top-3 left-3 z-10 bg-white px-1">
                                        <label htmlFor="email" className="text-xs font-medium text-neutral-500">
                                            Email
                                        </label>
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={email}
                                        readOnly
                                        className="h-14 rounded-lg border-neutral-300 bg-neutral-50 px-4 focus:border-[#673DE6] focus:shadow-none focus:ring-0 focus-visible:shadow-none focus-visible:ring-0"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password Field */}
                                <div className="relative">
                                    <div className="absolute -top-3 left-3 z-10 bg-white px-1">
                                        <label htmlFor="password" className="text-xs font-medium text-neutral-500">
                                            New Password
                                        </label>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        autoFocus
                                        autoComplete="new-password"
                                        placeholder="••••••••••••••••••••••"
                                        className="h-14 rounded-lg border-neutral-300 px-4 focus:border-[#673DE6] focus:shadow-none focus:ring-0 focus-visible:shadow-none focus-visible:ring-0"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                {/* Confirm Password Field */}
                                <div className="relative">
                                    <div className="absolute -top-3 left-3 z-10 bg-white px-1">
                                        <label htmlFor="password_confirmation" className="text-xs font-medium text-neutral-500">
                                            Confirm Password
                                        </label>
                                    </div>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        required
                                        autoComplete="new-password"
                                        placeholder="••••••••••••••••••••••"
                                        className="h-14 rounded-lg border-neutral-300 px-4 focus:border-[#673DE6] focus:shadow-none focus:ring-0 focus-visible:shadow-none focus-visible:ring-0"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="h-14 w-full rounded-xl bg-[#6C3CF0] text-lg font-bold text-white hover:bg-[#5a30d6]"
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
                                    Reset Password
                                </Button>
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
