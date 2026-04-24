import PracticeTestController from '@/actions/App/Http/Controllers/Teacher/PracticeTestController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TeacherLayout from '@/layouts/teacher-layout';
import { index as practiceTestsIndex } from '@/routes/teacher/practiceTests';
import { BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Practice Tests', href: practiceTestsIndex().url },
    { title: 'Create Practice Test', href: practiceTestsIndex().url + '/create' },
];

export default function Create() {
    const { batches, blocked, message } = usePage().props as {
        batches: {
            id: number;
            batch_code: string;
            clazz?: { name: string };
            subject?: { name: string };
        }[];
        blocked?: boolean;
        message?: string;
    };

    const [fileName, setFileName] = useState<string | null>(null);

    const getMinDateTimeLocal = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Practice Test" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Create Practice Test</h1>

                    <Link href={practiceTestsIndex().url}>
                        <Button>Practice Tests</Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            {blocked ? (
                                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center text-red-700">
                                    {message ?? 'You are not allowed to create a practice test.'}
                                </div>
                            ) : (
                                <Form
                                    {...PracticeTestController.store.form()}
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

                                            {/* Batch */}
                                            <div className="grid gap-2">
                                                <Label>
                                                    Batch <span className="text-red-500">*</span>
                                                </Label>

                                                <Select name="batch_id">
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select batch" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {batches.length === 0 ? (
                                                            <div className="px-3 py-2 text-sm text-gray-500">No batches found</div>
                                                        ) : (
                                                            batches.map((b) => (
                                                                <SelectItem key={b.id} value={String(b.id)}>
                                                                    {b.batch_code}
                                                                    {b.clazz && ` — ${b.clazz.name}`}
                                                                    {b.subject && ` (${b.subject.name})`}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>

                                                <InputError message={errors.batch_id} />
                                            </div>

                                            {/* Title */}
                                            <div className="grid gap-2">
                                                <Label>
                                                    Test Title <span className="text-red-500">*</span>
                                                </Label>
                                                <Input name="title" />
                                                <InputError message={errors.title} />
                                            </div>

                                            {/* Description */}
                                            <div className="grid gap-2">
                                                <Label>Description</Label>
                                                <Input name="description" />
                                                <InputError message={errors.description} />
                                            </div>

                                            {/* Due Date */}
                                            <div className="grid gap-2">
                                                <Label>
                                                    Due Date <span className="text-red-500">*</span>
                                                </Label>
                                                <Input type="datetime-local" name="due_date" min={getMinDateTimeLocal()} />
                                                <InputError message={errors.due_date} />
                                            </div>

                                            {/* Attachment */}
                                            <div className="grid gap-2">
                                                <Label>Attachment</Label>
                                                <Input
                                                    type="file"
                                                    name="attachment"
                                                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                                                />
                                                {fileName && <p className="text-sm text-gray-600">Selected: {fileName}</p>}
                                                <InputError message={errors.attachment} />
                                            </div>

                                            <div className="mt-6 text-center">
                                                <Button type="submit" className="mt-2 w-fit">
                                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                    Create Practice Test
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
