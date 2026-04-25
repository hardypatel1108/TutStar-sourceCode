import TeacherLoginController from '@/actions/App/Http/Controllers/Auth/TeacherLoginController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import loginimage from '@/assets/images/auth/login_img.png';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white font-sans">
            <Head title="Teacher Login" />

            {/* Left Column - Form */}
            <div className="flex w-full flex-col overflow-y-auto p-8 sm:p-12 md:p-20 lg:w-1/2">
                <div className="mb-12">
                    <Link href="/" className="text-2xl font-bold tracking-tight text-[#6C3CF0]">
                        Tut<span className="text-[#1a1a1a]">Star</span>
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-[400px]">
                    <h1 className="mb-2 text-3xl font-bold text-[#1a1a1a] sm:text-4xl">Welcome Back</h1>
                    <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">Login</h2>
                    <p className="mb-10 text-neutral-500">Login to access your account</p>

                    <Form {...TeacherLoginController.store.form()} resetOnSuccess={['password']} className="flex flex-col gap-8">
                        {({ processing, errors }) => (
                            <>
                                {/* Email Field with Floating-style Label */}
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
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="john.doe@gmail.com"
                                        className="h-14 rounded-lg border-neutral-300 px-4 focus:border-[#673DE6] focus:shadow-none focus:ring-0 focus-visible:shadow-none focus-visible:ring-0"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password Field with Floating-style Label */}
                                <div className="relative">
                                    <div className="absolute -top-3 left-3 z-10 bg-white px-1">
                                        <label htmlFor="password" className="text-xs font-medium text-neutral-500">
                                            Password
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="••••••••••••••••••••••"
                                            className="h-14 rounded-lg border-neutral-300 px-4 pr-12 focus:border-[#673DE6] focus:shadow-none focus:ring-0 focus-visible:shadow-none focus-visible:ring-0"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                {/* Options */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="remember" name="remember" tabIndex={3} className="border-neutral-300 text-[#673DE6] focus:ring-[#673DE6]" />
                                        <label htmlFor="remember" className="text-sm font-medium text-neutral-600">
                                            Remember me
                                        </label>
                                    </div>
                                    {canResetPassword && (
                                        <Link href={request()} className="text-sm font-medium text-[#FF8A8A] hover:underline">
                                            Forgot Password
                                        </Link>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="h-14 w-full rounded-xl bg-[#6C3CF0] text-lg font-bold text-white hover:bg-[#5a30d6]"
                                    tabIndex={4}
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
                                    Login
                                </Button>

                                <div className="text-center text-sm font-medium text-neutral-600">
                                    Don't have an account?{' '}
                                    <Link href={register()} className="text-[#FF8A8A] hover:underline">
                                        Sign up
                                    </Link>
                                </div>

                                {/* Divider */}
                                <div className="relative flex items-center py-4">
                                    <div className="flex-grow border-t border-neutral-200"></div>
                                    <span className="mx-4 flex-shrink text-sm text-neutral-400">Or login with</span>
                                    <div className="flex-grow border-t border-neutral-200"></div>
                                </div>

                                {/* Google Login */}
                                <Button
                                    type="button"
                                    className="h-14 w-full rounded-xl border border-[#673DE6]/30 bg-[#fff] hover:bg-[#673DE6]"
                                >
                                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                </Button>
                            </>
                        )}
                    </Form>
                </div>
            </div>

            {/* Right Column - Graphic Placeholder */}
            <div className="relative hidden w-1/2 items-center justify-center bg-[#F9F8FF] lg:flex">
                <div className="relative flex h-full w-full items-center justify-center p-20">
                    {/* Background Lavender Shape */}
                    {/* <div className="absolute right-0 top-20 h-[600px] w-[600px] rounded-full bg-[#E9E7FF] opacity-50 blur-3xl" /> */}
                    
                    {/* The Graphic Area (User said they will add image later) */}
                    {/* <div className="relative z-10 flex h-[80%] w-full flex-col items-center justify-center rounded-3xl bg-white/20 shadow-2xl backdrop-blur-sm border border-white/30">
                         <div className="text-center">
                            <p className="text-neutral-400">Graphic Placeholder</p>
                            <div className="mt-4 flex gap-2">
                                <div className="h-3 w-3 animate-bounce rounded-full bg-[#6C3CF0]" />
                                <div className="h-3 w-3 animate-bounce rounded-full bg-[#FF972F] delay-75" />
                                <div className="h-3 w-3 animate-bounce rounded-full bg-[#6C3CF0] delay-150" />
                            </div>
                         </div>

                         <div className="absolute right-10 top-20 flex items-center gap-2 rounded-full bg-white p-2 shadow-lg">
                            <div className="h-3 w-3 rounded-full bg-[#34A853]" />
                            <span className="text-xs font-bold text-[#EA4335]">LIVE</span>
                         </div>

                         <div className="absolute bottom-20 left-10 rounded-2xl bg-white p-4 shadow-xl">
                            <p className="text-xs font-bold text-neutral-400">Total Enrolled Students</p>
                            <div className="mt-2 flex items-center">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-neutral-200" />
                                    ))}
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#6C3CF0] text-[10px] text-white">
                                        5K
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div> */}
                    <img src={loginimage} alt="" className='w-full object-cover'/>
                </div>
            </div>

            {status && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 rounded-lg bg-green-50 px-6 py-3 text-sm font-medium text-green-600 shadow-lg">
                    {status}
                </div>
            )}
        </div>
    );
}
