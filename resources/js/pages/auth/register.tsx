import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <AuthLayout title="Join TutStar" description="Create your student account" childrendivClassName="max-w-xl" mainDivClassName="max-w-sm">
            <Head title="Sign Up" />

            <Form
                {...RegisteredUserController.store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Full Name */}
                        <div className="grid gap-2">
                            <Label>
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input name="name" placeholder="Enter your full name" required />
                            <InputError message={errors.name} />
                        </div>

                        {/* Phone */}
                        <div className="grid gap-2">
                            <Label>
                                Phone Number <span className="text-red-500">*</span>
                            </Label>
                            <Input name="phone" placeholder="+91 9876543210" required />
                            <InputError message={errors.phone} />
                        </div>

                        {/* Email */}
                        <div className="grid gap-2">
                            <Label>
                                Email Address <span className="text-red-500">*</span>
                            </Label>
                            <Input type="email" name="email" placeholder="email@example.com" required />
                            <InputError message={errors.email} />
                        </div>

                        {/* Password */}
                        <div className="grid gap-2">
                            <Label>Password</Label>
                            <Input type={showPassword ? 'text' : 'password'} name="password" placeholder="Create password" required />
                            <button
                                type="button"
                                className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                {showPassword ? 'Hide password' : 'Show password'}
                            </button>
                            <InputError message={errors.password} />
                        </div>

                        {/* Confirm Password */}
                        <div className="grid gap-2">
                            <Label>Confirm Password</Label>
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                placeholder="Confirm password"
                                required
                            />
                            <button
                                type="button"
                                className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                            >
                                {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                {showConfirmPassword ? 'Hide password' : 'Show password'}
                            </button>
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <Button type="submit" className="w-full">
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Student Account
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account? <TextLink href={login()}>Log in</TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
