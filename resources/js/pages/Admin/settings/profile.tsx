import ProfileController from '@/actions/App/Http/Controllers/Admin/Settings/ProfileController';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import SettingsLayout from '@/layouts/admin/settings/layout';
import { edit } from '@/routes/admin/profile';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleImageClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreview(URL.createObjectURL(file));
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <Form
                        {...ProfileController.update.form()}
                        encType="multipart/form-data"
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <Label className="text-sm text-gray-600">Profile Image</Label>

                                    <div onClick={handleImageClick} className="group relative cursor-pointer">
                                        {preview || auth.user.profile_image ? (
                                            <img
                                                src={preview ?? `/storage/${auth.user.profile_image}`}
                                                className="h-32 w-32 rounded-full border object-cover transition group-hover:ring-2 group-hover:ring-primary"
                                            />
                                        ) : (
                                            <Avatar className="h-32 w-32 rounded-full border">
                                                <AvatarFallback>{auth.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        )}

                                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
                                            <span className="text-xs text-white">Click to change</span>
                                        </div>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        name="profile_image"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />

                                    <InputError className="mt-2" message={errors.profile_image} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full border-gray-500"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        title="Full name" placeholder="Full name"
                                    />

                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full border-gray-500"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        title="Email address" placeholder="Email address"
                                    />

                                    <InputError className="mt-2" message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>

                                    <Input
                                        id="phone"
                                        className="mt-1 block w-full border-gray-500"
                                        defaultValue={auth.user.phone ?? ''}
                                        name="phone"
                                        autoComplete="tel"
                                        title="Phone number" placeholder="Phone number"
                                    />

                                    <InputError className="mt-2" message={errors.phone} />
                                </div>

                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to resend the verification email.
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing}>Save</Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">Saved</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* <DeleteU ser /> */}
            </SettingsLayout>
        </AdminLayout>
    );
}

