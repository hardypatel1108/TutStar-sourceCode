import HomeworkController from '@/actions/App/Http/Controllers/Teacher/HomeworkController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TeacherLayout from '@/layouts/teacher-layout';
import { index as homeworkIndex } from '@/routes/teacher/homeworks';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Homeworks', href: '/teacher/homeworks' },
    { title: 'Create Homework', href: '/teacher/homeworks/create' },
];

export default function Create() {
    const { sessions, blocked, message } = usePage().props as {
        sessions: {
            id: number;
            topic: string;
            class_date: string;
            class_date_formatted: string;
        }[];
        blocked?: boolean;
        message?: string;
    };

    const [fileName, setFileName] = useState<string | null>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        setFileName(file ? file.name : null);
    }
    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Homework" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Assign Homework</h1>

                    <Link href={homeworkIndex().url}>
                        <Button>Homeworks</Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            {/* 🚫 BLOCKED STATE */}
                            {blocked ? (
                                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center text-red-700">
                                    {message ?? 'You are not allowed to add homework at this time.'}
                                </div>
                            ) : (
                                <Form
                                    {...HomeworkController.store.form()}
                                    encType="multipart/form-data"
                                    disableWhileProcessing
                                    resetOnSuccess
                                    className="flex flex-col gap-6"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            {(errors._error || errors.edit) && (
                                                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                    {errors._error ?? errors.edit}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 gap-6">
                                                {/* Class Session */}
                                                <div className="grid gap-2">
                                                    <Label>
                                                        Class Session <span className="text-red-500">*</span>
                                                    </Label>

                                                    <Select name="classes_session_id">
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select last completed class" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {sessions.length === 0 ? (
                                                                <div className="px-3 py-2 text-sm text-gray-500">No eligible class found</div>
                                                            ) : (
                                                                sessions.map((s) => (
                                                                    <SelectItem key={s.id} value={String(s.id)}>
                                                                        {s.topic} ({s.class_date_formatted})
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>

                                                    <InputError message={errors.classes_session_id} />
                                                </div>

                                                {/* Title */}
                                                <div className="grid gap-2">
                                                    <Label>
                                                        Homework Title <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input name="title" placeholder="Enter homework title" required />
                                                    <InputError message={errors.title} />
                                                </div>

                                                {/* Description */}
                                                <div className="grid gap-2">
                                                    <Label>Description</Label>
                                                    <Input name="description" placeholder="Optional instructions" />
                                                    <InputError message={errors.description} />
                                                </div>

                                                {/* Due Date */}
                                                <div className="grid gap-2">
                                                    <Label>Due Date</Label>
                                                    <Input name="due_date" type="date" />
                                                    <InputError message={errors.due_date} />
                                                </div>

                                                {/* Attachment */}
                                                <div className="grid gap-2">
                                                    <Label>Attachment</Label>
                                                    <Input name="attachment" type="file" onChange={handleFileChange} />
                                                    {fileName && <p className="text-sm text-gray-600">Selected: {fileName}</p>}
                                                    <InputError message={errors.attachment} />
                                                </div>
                                            </div>

                                            {/* Submit */}
                                            <div className="mt-6 text-center">
                                                <Button type="submit" className="mt-2 w-fit max-w-md">
                                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                    Assign Homework
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </TeacherLayout>
    );
}
