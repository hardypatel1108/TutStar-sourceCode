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
    { title: 'Edit Student', href: '' },
];

export default function Edit() {
    const { student, classes, statuses } = usePage().props as {
        student: any;
        classes: Array<{ id: number; name: string }>;
        statuses: string[];
    };
    const [preview, setPreview] = useState<string | null>(null);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Student" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Student</h1>

                    <Link href={studentsIndex().url}>
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form {...StudentController.update.form({ student: student.id })} disableWhileProcessing className="flex flex-col gap-6">
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
                                                    {preview || student.user.profile_image ? (
                                                        <img
                                                            src={preview ? preview : `/storage/${student.user.profile_image}`}
                                                            alt="Profile"
                                                            className="h-32 w-32 rounded-full border object-cover transition group-hover:ring-2 group-hover:ring-primary hover:opacity-80"
                                                        />
                                                    ) : (
                                                        <Avatar className="h-32 w-32 overflow-hidden rounded-full border transition group-hover:ring-2 group-hover:ring-primary">
                                                            <AvatarFallback className="flex items-center justify-center bg-neutral-200 text-2xl font-semibold text-black">
                                                                {student.user.name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                </label>

                                                <p className="text-sm text-muted-foreground">Click to change profile image</p>

                                                <InputError message={errors.profile_image} />
                                            </div>
                                            {/* Name */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Student Name *</Label>
                                                <Input id="name" name="name" defaultValue={student.user.name} required />
                                                <InputError message={errors.name} />
                                            </div>

                                            {/* Email */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email *</Label>
                                                <Input id="email" name="email" type="email" defaultValue={student.user.email} required />
                                                <InputError message={errors.email} />
                                            </div>

                                            {/* Phone */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="phone">Mobile Number</Label>
                                                <Input id="phone" name="phone" defaultValue={student.user.phone || ''} title="Enter mobile number" placeholder="Enter mobile number" />
                                                <InputError message={errors.phone} />
                                            </div>

                                            {/* Class */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="class_id">Class *</Label>

                                                <Select name="class_id" defaultValue={String(student.class_id)}>
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
                                                <Input id="school" name="school" defaultValue={student.school} />
                                                <InputError message={errors.school} />
                                            </div>

                                            {/* City */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input id="city" name="city" defaultValue={student.city} />
                                                <InputError message={errors.city} />
                                            </div>

                                            {/* State */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="state">State</Label>
                                                <Input id="state" name="state" defaultValue={student.state} />
                                                <InputError message={errors.state} />
                                            </div>

                                            {/* DOB */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="dob">Date of Birth</Label>
                                                <Input
                                                    id="dob"
                                                    name="dob"
                                                    type="date"
                                                    defaultValue={student.dob_date_local ? student.dob_date_local.slice(0, 10) : ''}
                                                />
                                                <InputError message={errors.dob} />
                                            </div>

                                            {/* Status */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="status">Status *</Label>

                                                <Select name="status" defaultValue={student.status}>
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
                                                Update Student
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


