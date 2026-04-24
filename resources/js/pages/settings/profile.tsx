import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useRef } from 'react';

import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentLayout from '@/layouts/studentLayout';
import { edit } from '@/routes/profile';
import { useState } from 'react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
    studentProfile,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    studentProfile?: any;
}) {
    const { auth, boards, classes, recommendedPlans = [], payments } = usePage<SharedData>().props as {
        auth: any;
        boards: { id: number; name: string }[];
        classes: { id: number; name: string; board_id?: number | null }[];
        recommendedPlans?: any[];
        payments?: any;
    };

    const initials = useInitials();
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedBoardId, setSelectedBoardId] = useState<string>(studentProfile?.board_id ? String(studentProfile.board_id) : '');
    const [selectedClassId, setSelectedClassId] = useState<string>(studentProfile?.class_id ? String(studentProfile.class_id) : '');
    const filteredClasses = classes.filter((c) => !selectedBoardId || String(c.board_id ?? '') === selectedBoardId);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));
    };
    const paymentsData = payments?.data ?? [];
    const paymentLinks = payments?.links ?? [];
    const formatCurrency = (amount: number | string | null | undefined) => {
        const value = Number(amount ?? 0);
        return `INR ${value.toLocaleString('en-IN')}`;
    };
    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-xl p-0 sm:p-4">
                <div className="relative mb-24 rounded-2xl sm:mb-32 sm:bg-white/70 sm:p-4 sm:p-6 sm:shadow">
                    {studentProfile?.batches?.length > 0 && (
                        <div>
                            {/* Header */}
                            <div className="flex items-center justify-between p-2 sm:pb-4">
                                <h2 className="font-semibold tracking-tight max-sm:text-sm md:text-xl">Ongoing & Previous Batches</h2>
                            </div>

                            {/* Course chips */}
                            <div className="flex flex-wrap gap-3 px-2">
                                {studentProfile?.batches.map((b: any, i: number) => {
                                    const joinedAt = b.pivot?.joined_at ? b.joined_at_formatted : null;

                                    const endAt = b.is_active ? 'Present' : (b.ended_at_formatted ?? '-');

                                    return (
                                        <div
                                            key={i}
                                            className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm shadow-sm ${
                                                i % 2 === 0 ? 'bg-blue-100 text-blue-900' : 'bg-orange-100 text-orange-900'
                                            } `}
                                        >
                                            {/* Avatar */}
                                            <img
                                                src={b.subject?.icon ? `/storage/${b.subject.icon}` : '/images/default-avatar.png'}
                                                alt={b.subject?.name}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />

                                            {/* Text */}
                                            <div className="leading-tight">
                                                <p className="font-semibold">{b.subject?.name ?? 'Course'}</p>
                                                <p className="text-xs opacity-80">Batch ID: {b.id}{b.batch_code ? ` (${b.batch_code})` : ''}</p>
                                                <p className="text-xs opacity-80">Teacher: {b.teacher?.user?.name ?? '-'}</p>
                                                {joinedAt && (
                                                    <p className="text-[11px] opacity-70">
                                                        {joinedAt} to {endAt}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 p-2 sm:pb-4">
                        {/* <Heading title="My Account" /> */}
                        <div className="space-y-0.5">
                            <h2 className="font-semibold tracking-tight max-sm:text-sm md:text-xl">{'My Account'}</h2>
                        </div>
                        <Link
                            href="/notifications"
                            className="relative hidden rounded-lg border border-blue-600 px-3 py-1 text-sm text-blue-600 max-sm:hidden md:inline-flex"
                        >
                            Notifications
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-500" />
                        </Link>
                    </div>

                    <div className="pt-0 sm:px-4 sm:py-4">
                        {/* parent */}
                        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                            {/* LEFT */}
                            <div className="w-full lg:w-1/2">
                                <div className="space-y-4 rounded-2xl border border-[#9BACF7] bg-white/30 p-4 backdrop-blur-sm sm:p-6">
                                    <div className="flex items-center justify-between border-b border-[#E4E5FF] py-2">
                                        <span className="text-sm font-semibold text-gray-900">Unique Id</span>
                                        <span className="text-sm font-medium text-gray-500">{studentProfile?.student_uid ?? '-'}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-[#E4E5FF] py-2">
                                        <span className="text-sm font-semibold text-gray-900">Class</span>
                                        <span className="text-sm font-medium text-gray-500">{studentProfile?.clazz?.name || '-'}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-[#E4E5FF] py-2">
                                        <span className="hidden text-sm font-semibold text-gray-900 sm:inline-block">Date of Birth</span>
                                        <span className="text-sm font-semibold text-gray-900 sm:hidden">DOB</span>
                                        <span className="text-sm font-medium text-gray-500">
                                            {studentProfile?.dob
                                                ? new Date(studentProfile.dob).toLocaleDateString('en-GB', {
                                                      day: '2-digit',
                                                      month: 'short',
                                                      year: 'numeric',
                                                  })
                                                : '-'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <span className="hidden text-sm font-semibold text-gray-900 sm:inline-block">Date of Joining</span>
                                        <span className="text-sm font-semibold text-gray-900 sm:hidden">Joining</span>
                                        <span className="text-sm font-medium text-gray-500">
                                            {/* {studentProfile.created_at}{' '} */}
                                            {studentProfile?.created_at
                                                ? new Date(studentProfile.created_at).toLocaleDateString('en-GB', {
                                                      day: '2-digit',
                                                      month: 'short',
                                                      year: 'numeric',
                                                  })
                                                : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* column 2 â€“ put whatever you want here */}
                            <div className="mt-8 w-full lg:mt-0 lg:w-1/2">
                                <section className="rounded-2xl border border-[#9BACF7] bg-white/30 p-4 sm:p-6">
                                    <div className="space-y-4">
                                        {/* ================= EDIT PROFILE INFO ================= */}
                                        <Dialog>
                                            <div className="flex items-center justify-between border-b pb-3">
                                                <span className="text-sm font-medium text-gray-900">Profile Information</span>

                                                <DialogTrigger asChild>
                                                    <Button size="sm" className="rounded-full bg-[#673DE6] px-5">
                                                        Edit
                                                    </Button>
                                                </DialogTrigger>
                                            </div>

                                            <DialogContent className="sm:max-w-lg">
                                                <DialogHeader>
                                                    <DialogTitle>Edit Profile Information</DialogTitle>
                                                </DialogHeader>

                                                <Form {...ProfileController.update.form()} encType="multipart/form-data" className="space-y-4">
                                                    {({ errors, processing, recentlySuccessful }) => (
                                                        <>
                                                            {/* Profile Image */}
                                                            <div className="flex flex-col items-center justify-center gap-4">
                                                                {/* Label */}
                                                                <Label className="text-center text-sm text-gray-600">Profile Image</Label>

                                                                {/* Clickable Image */}
                                                                <div
                                                                    onClick={handleImageClick}
                                                                    className="group relative cursor-pointer"
                                                                    title="Click to change profile image"
                                                                >
                                                                    {preview || auth.user.profile_image ? (
                                                                        // âœ… IMAGE EXISTS (preview OR saved image)
                                                                        <img
                                                                            src={preview ? preview : `/storage/${auth.user.profile_image}`}
                                                                            alt="Profile"
                                                                            className="h-32 w-32 rounded-full border object-cover transition group-hover:ring-2 group-hover:ring-primary hover:opacity-80"
                                                                        />
                                                                    ) : (
                                                                        // âœ… NO IMAGE â†’ AVATAR FALLBACK
                                                                        <Avatar className="h-32 w-32 overflow-hidden rounded-full border transition group-hover:ring-2 group-hover:ring-primary">
                                                                            <AvatarFallback className="flex items-center justify-center bg-neutral-200 text-2xl font-semibold text-black dark:bg-neutral-700 dark:text-white">
                                                                                {initials(auth.user.name)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                    )}

                                                                    {/* Overlay */}
                                                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
                                                                        <span className="text-xs text-white">Click to change</span>
                                                                    </div>
                                                                </div>

                                                                {/* Hidden File Input */}
                                                                <input
                                                                    ref={fileInputRef}
                                                                    type="file"
                                                                    name="profile_image"
                                                                    accept="image/*"
                                                                    onChange={handleFileChange}
                                                                    className="hidden"
                                                                />

                                                                <InputError message={errors.profile_image} />
                                                            </div>
                                                            {/* <div className="grid gap-2">
                                                                <Label>Profile Image</Label>
                                                                <Input type="file" name="profile_image" />
                                                                <InputError message={errors.profile_image} />
                                                            </div> */}

                                                                                                                        {/* Board */}
                                                            <div className="grid gap-2">
                                                                <Label>Board</Label>
                                                                <Select
                                                                    name="board_id"
                                                                    value={selectedBoardId}
                                                                    onValueChange={(value) => {
                                                                        setSelectedBoardId(value);
                                                                        if (selectedClassId) {
                                                                            const stillValid = classes.some((c) => String(c.id) === selectedClassId && String(c.board_id ?? '') === value);
                                                                            if (!stillValid) {
                                                                                setSelectedClassId('');
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select board" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {boards.map((b) => (
                                                                            <SelectItem key={b.id} value={String(b.id)}>
                                                                                {b.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <InputError message={errors.board_id} />
                                                            </div>

                                                            {/* Class */}
                                                            <div className="grid gap-2">
                                                                <Label>Class</Label>
                                                                <Select
                                                                    name="class_id"
                                                                    value={selectedClassId}
                                                                    onValueChange={setSelectedClassId}
                                                                    disabled={!selectedBoardId}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select class" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {filteredClasses.map((c) => (
                                                                            <SelectItem key={c.id} value={String(c.id)}>
                                                                                {c.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <InputError message={errors.class_id} />
                                                            </div>

                                                            {/* School */}
                                                            <div className="grid gap-2">
                                                                <Label>School</Label>
                                                                <Input name="school" defaultValue={studentProfile?.school} />
                                                            </div>

                                                            {/* City */}
                                                            <div className="grid gap-2">
                                                                <Label>City / Town</Label>
                                                                <Input name="city" defaultValue={studentProfile?.city} />
                                                            </div>

                                                            {/* State */}
                                                            <div className="grid gap-2">
                                                                <Label>State</Label>
                                                                <Input name="state" defaultValue={studentProfile?.state} />
                                                            </div>

                                                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                                                <div>
                                                                    <p className="mt-4 text-sm text-muted-foreground">
                                                                        Your email address is unverified.{' '}
                                                                        <Link
                                                                            href={send()}
                                                                            as="button"
                                                                            className="text-orange-600 underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
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
                                                            <div className="flex items-center justify-end gap-3 pt-4">
                                                                <Transition
                                                                    show={recentlySuccessful}
                                                                    enter="transition ease-in-out"
                                                                    enterFrom="opacity-0"
                                                                    leave="transition ease-in-out"
                                                                    leaveTo="opacity-0"
                                                                >
                                                                    <p className="text-sm text-green-600">Saved</p>
                                                                </Transition>
                                                                <Button disabled={processing}>Save Changes</Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </Form>
                                            </DialogContent>
                                        </Dialog>
                                        {/* Password */}
                                        <Dialog>
                                            <div className="flex items-center justify-between border-b pb-3">
                                                <span className="text-sm font-medium text-gray-900">Password</span>

                                                <DialogTrigger asChild>
                                                    <Button size="sm" className="rounded-full bg-[#673DE6] px-5">
                                                        Reset
                                                    </Button>
                                                </DialogTrigger>
                                            </div>

                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Change Password</DialogTitle>
                                                </DialogHeader>

                                                {/* EXISTING FORM (UNCHANGED) */}
                                                <Form
                                                    {...PasswordController.update.form()}
                                                    options={{ preserveScroll: true }}
                                                    resetOnError={['password', 'password_confirmation', 'current_password']}
                                                    resetOnSuccess
                                                    onError={(errors) => {
                                                        if (errors.password) passwordInput.current?.focus();
                                                        if (errors.current_password) currentPasswordInput.current?.focus();
                                                    }}
                                                    className="space-y-4"
                                                >
                                                    {({ errors, processing, recentlySuccessful }) => (
                                                        <>
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="current_password">Current password</Label>
                                                                <Input
                                                                    id="current_password"
                                                                    ref={currentPasswordInput}
                                                                    name="current_password"
                                                                    type="password"
                                                                />
                                                                <InputError message={errors.current_password} />
                                                            </div>

                                                            <div className="grid gap-2">
                                                                <Label htmlFor="password">New password</Label>
                                                                <Input id="password" ref={passwordInput} name="password" type="password" />
                                                                <InputError message={errors.password} />
                                                            </div>

                                                            <div className="grid gap-2">
                                                                <Label htmlFor="password_confirmation">Confirm password</Label>
                                                                <Input id="password_confirmation" name="password_confirmation" type="password" />
                                                                <InputError message={errors.password_confirmation} />
                                                            </div>

                                                            <div className="flex items-center gap-3 pt-2">
                                                                <Button disabled={processing}>Save password</Button>

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
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog>
                                            <div className="flex items-center justify-between border-b pb-3">
                                                <span className="text-sm font-medium text-gray-900">Phone number</span>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="secondary">
                                                        Reset
                                                    </Button>
                                                </DialogTrigger>
                                            </div>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Update Phone Number</DialogTitle>
                                                </DialogHeader>
                                                <Form {...ProfileController.update.form()} className="space-y-4">
                                                    {({ errors, processing, recentlySuccessful }) => (
                                                        <>
                                                            <div className="grid gap-2">
                                                                <Label>Phone Number</Label>
                                                                <Input name="phone" defaultValue={auth.user.phone ?? ''} />
                                                                <InputError message={errors.phone} />
                                                            </div>
                                                            <div className="flex items-center justify-end gap-3">
                                                                <Transition
                                                                    show={recentlySuccessful}
                                                                    enter="transition ease-in-out"
                                                                    enterFrom="opacity-0"
                                                                    leave="transition ease-in-out"
                                                                    leaveTo="opacity-0"
                                                                >
                                                                    <p className="text-sm text-green-600">Saved</p>
                                                                </Transition>
                                                                <Button disabled={processing}>Save</Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </Form>
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900">Email</span>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="secondary">
                                                        Reset
                                                    </Button>
                                                </DialogTrigger>
                                            </div>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Update Email</DialogTitle>
                                                </DialogHeader>
                                                <Form {...ProfileController.update.form()} className="space-y-4">
                                                    {({ errors, processing, recentlySuccessful }) => (
                                                        <>
                                                            <div className="grid gap-2">
                                                                <Label>Email</Label>
                                                                <Input name="email" type="email" defaultValue={auth.user.email ?? ''} />
                                                                <InputError message={errors.email} />
                                                            </div>
                                                            <div className="flex items-center justify-end gap-3">
                                                                <Transition
                                                                    show={recentlySuccessful}
                                                                    enter="transition ease-in-out"
                                                                    enterFrom="opacity-0"
                                                                    leave="transition ease-in-out"
                                                                    leaveTo="opacity-0"
                                                                >
                                                                    <p className="text-sm text-green-600">Saved</p>
                                                                </Transition>
                                                                <Button disabled={processing}>Save</Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </Form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </section>
                            </div>
                            {/* <div className="mt-8 w-full lg:mt-0 lg:w-1/2">
                                <section className="space-y-8 rounded-2xl border border-[#9BACF7] p-4 sm:p-6">
                                    <div className="space-y-6">
                                        <Form
                                            {...PasswordController.update.form()}
                                            options={{
                                                preserveScroll: true,
                                            }}
                                            resetOnError={['password', 'password_confirmation', 'current_password']}
                                            resetOnSuccess
                                            onError={(errors) => {
                                                if (errors.password) {
                                                    passwordInput.current?.focus();
                                                }

                                                if (errors.current_password) {
                                                    currentPasswordInput.current?.focus();
                                                }
                                            }}
                                            className="space-y-6"
                                        >
                                            {({ errors, processing, recentlySuccessful }) => (
                                                <>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="current_password">Current password</Label>

                                                        <Input
                                                            id="current_password"
                                                            ref={currentPasswordInput}
                                                            name="current_password"
                                                            type="password"
                                                            className="mt-1 block w-full border-gray-500"
                                                            autoComplete="current-password"
                                                            placeholder="Current password"
                                                        />

                                                        <InputError message={errors.current_password} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="password">New password</Label>

                                                        <Input
                                                            id="password"
                                                            ref={passwordInput}
                                                            name="password"
                                                            type="password"
                                                            className="mt-1 block w-full border-gray-500"
                                                            autoComplete="new-password"
                                                            placeholder="New password"
                                                        />

                                                        <InputError message={errors.password} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="password_confirmation">Confirm password</Label>

                                                        <Input
                                                            id="password_confirmation"
                                                            name="password_confirmation"
                                                            type="password"
                                                            className="mt-1 block w-full border-gray-500"
                                                            autoComplete="new-password"
                                                            placeholder="Confirm password"
                                                        />

                                                        <InputError message={errors.password_confirmation} />
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <Button disabled={processing}>Save password</Button>

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
                                </section>
                            </div> */}
                        </div>
                    </div>

                                        {/* My Payments */}
                    <div className="mt-6">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="font-semibold tracking-tight max-sm:text-sm md:text-xl">Payment History</p>
                            <p className="text-xs text-gray-500">Showing 10 per page</p>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-[#9BACF7] bg-white/80 shadow-sm">
                            <div className="hidden grid-cols-6 border-b bg-[#F6F8FF] px-4 py-3 text-xs font-semibold text-gray-600 sm:grid">
                                <p>Amount</p>
                                <p>Gateway</p>
                                <p>Status</p>
                                <p>Date</p>
                                <p className="text-right">Validity</p>
                                <p className="text-right">Details</p>
                            </div>

                            {paymentsData.length === 0 && <p className="py-6 text-center text-sm text-neutral-500">No payments found</p>}

                            {paymentsData.map((p: any, i: number) => (
                                <div key={i} className="border-b px-4 py-4 last:border-0">
                                    <div className="space-y-3 sm:hidden">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold">INR {p.amount}</p>
                                            <p
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                                    p.status === 'completed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : p.status === 'failed'
                                                          ? 'bg-red-100 text-red-700'
                                                          : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                            >
                                                {p.status}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-600">
                                            <span className="capitalize">{p.gateway}</span>
                                            <span>
                                                {new Date(p.created_at).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        {p.gateway_txn_id && <p className="text-xs text-gray-500">Txn: {p.gateway_txn_id}</p>}
                                        {p.status === 'completed' && p.expiry_date_formatted && (
                                            <p className={`text-xs font-medium ${p.is_expired ? 'text-red-600' : 'text-green-600'}`}>
                                                {p.is_expired ? `Expired on ${p.expiry_date_formatted}` : `Valid till ${p.expiry_date_formatted}`}
                                            </p>
                                        )}
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="w-fit"
                                            onClick={() => {
                                                setSelectedPayment(p);
                                                setPaymentDialogOpen(true);
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </div>

                                    <div className="hidden grid-cols-6 items-center gap-2 sm:grid">
                                        <p className="font-semibold">INR {p.amount}</p>
                                        <p className="capitalize">{p.gateway}</p>
                                        <p
                                            className={`font-medium capitalize ${
                                                p.status === 'completed' ? 'text-green-600' : p.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                            }`}
                                        >
                                            {p.status}
                                        </p>
                                        <div className="text-sm text-gray-600">
                                            {new Date(p.created_at).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </div>
                                        <div className="text-right text-xs">
                                            {p.status === 'completed' && p.expiry_date_formatted ? (
                                                <span className={p.is_expired ? 'text-red-600' : 'text-green-600'}>
                                                    {p.is_expired ? `Expired ${p.expiry_date_formatted}` : `Till ${p.expiry_date_formatted}`}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedPayment(p);
                                                    setPaymentDialogOpen(true);
                                                }}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {paymentLinks.length > 3 && (
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {paymentLinks.map((link: any, idx: number) => {
                                    const label = String(link.label).replace('&laquo;', '«').replace('&raquo;', '»');
                                    return (
                                        <Link
                                            key={`${label}-${idx}`}
                                            href={link.url ?? '#'}
                                            preserveScroll
                                            className={`rounded-md border px-3 py-1 text-sm ${
                                                !link.url
                                                    ? 'pointer-events-none border-gray-200 text-gray-400'
                                                    : link.active
                                                      ? 'border-[#673DE6] bg-[#673DE6] text-white'
                                                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: label }} />
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Payment Details</DialogTitle>
                            </DialogHeader>
                            {selectedPayment && (
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Plan</span>
                                        <span className="font-medium">{selectedPayment.plan_title || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Type</span>
                                        <span className="capitalize">{selectedPayment.plan_type || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Subjects</span>
                                        <span className="text-right">
                                            {Array.isArray(selectedPayment.plan_subjects) && selectedPayment.plan_subjects.length > 0
                                                ? selectedPayment.plan_subjects.join(', ')
                                                : '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Months</span>
                                        <span className="font-medium">{selectedPayment.checkout_months ?? '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">MRP (Plan Price)</span>
                                        <span className="font-medium">
                                            {selectedPayment.plan_price !== null && selectedPayment.plan_price !== undefined
                                                ? formatCurrency(selectedPayment.plan_price)
                                                : '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Discount</span>
                                        <span className="font-medium">
                                            {selectedPayment.discount_amount !== null ? formatCurrency(selectedPayment.discount_amount) : '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t pt-2">
                                        <span className="text-gray-500">Total Paid</span>
                                        <span className="font-semibold">{formatCurrency(selectedPayment.amount)}</span>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </StudentLayout>
    );
}






