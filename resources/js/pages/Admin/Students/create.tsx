import StudentController from '@/actions/App/Http/Controllers/Admin/StudentController';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { index as studentsIndex } from '@/routes/admin/students';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Students', href: '/admin/students' },
    { title: 'Create Student', href: '/admin/students/create' },
];

export default function Create() {
    const { classes, statuses } = usePage().props as {
        classes: Array<{ id: number; name: string }>;
        statuses: string[];
    };

    const [preview, setPreview] = useState<string | null>(null);
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Student" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Add Student</h1>

                    <Link href={studentsIndex().url}>
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form {...StudentController.store.form()} resetOnSuccess disableWhileProcessing className="flex flex-col gap-6">
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Profile Image */}
                                            <div className="flex flex-col items-center gap-3">
                                                <label className="group cursor-pointer">
                                                    <input
                                                        type="file"
                                                        name="profile_image"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setPreview(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                    />

                                                    {preview ? (
                                                        <img
                                                            src={preview}
                                                            alt="Profile"
                                                            className="h-32 w-32 rounded-full border object-cover transition group-hover:ring-2 group-hover:ring-primary hover:opacity-80"
                                                        />
                                                    ) : (
                                                        <Avatar className="h-32 w-32 overflow-hidden rounded-full border transition group-hover:ring-2 group-hover:ring-primary">
                                                            <AvatarFallback className="flex items-center justify-center bg-neutral-200 text-2xl font-semibold text-black dark:bg-neutral-700 dark:text-white">
                                                                ST
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                </label>

                                                <p className="text-sm text-muted-foreground">Click to upload profile image</p>

                                                <InputError message={errors.profile_image} />
                                            </div>

                                            {/* Name */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Student Name *</Label>
                                                <Input id="name" name="name" required />
                                                <InputError message={errors.name} />
                                            </div>

                                            {/* Email */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email *</Label>
                                                <Input id="email" name="email" type="email" required />
                                                <InputError message={errors.email} />
                                            </div>

                                            {/* Phone */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="phone">Mobile Number</Label>
                                                <Input id="phone" name="phone" title="Enter mobile number" placeholder="Enter mobile number" />
                                                <InputError message={errors.phone} />
                                            </div>

                                            {/* Class */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="class_id">Class *</Label>

                                                <Select name="class_id">
                                                    <SelectTrigger id="class_id">
                                                        <SelectValue placeholder="Select class" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        {classes.map((c) => (
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
                                                <Label htmlFor="school">School</Label>
                                                <Input id="school" name="school" />
                                                <InputError message={errors.school} />
                                            </div>

                                            {/* City */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input id="city" name="city" />
                                                <InputError message={errors.city} />
                                            </div>

                                            {/* State */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="state">State</Label>
                                                <Input id="state" name="state" />
                                                <InputError message={errors.state} />
                                            </div>

                                            {/* DOB */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="dob">Date of Birth</Label>
                                                <Input id="dob" name="dob" type="date" />
                                                <InputError message={errors.dob} />
                                            </div>

                                            {/* Status */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="status">Status *</Label>

                                                <Select name="status">
                                                    <SelectTrigger id="status">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statuses.map((s) => (
                                                            <SelectItem key={s} value={s}>
                                                                {s.toUpperCase()}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <InputError message={errors.status} />
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <div className="mt-6 text-center">
                                            <Button type="submit" className="mt-2 w-fit max-w-md">
                                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                Create Student
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </div>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}


