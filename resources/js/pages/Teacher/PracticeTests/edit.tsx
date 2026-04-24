import PracticeTestController from '@/actions/App/Http/Controllers/Teacher/PracticeTestController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TeacherLayout from '@/layouts/teacher-layout';
import { index as practiceTestsIndex } from '@/routes/teacher/practiceTests';
import { BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Practice Tests', href: practiceTestsIndex().url },
    { title: 'Edit Practice Test', href: '#' },
];

export default function Edit() {
    const { practiceTest } = usePage().props as {
        practiceTest: {
            id: number;
            title: string;
            description?: string | null;
            due_date: string;
            attachment?: string | null;
            batch?: {
                batch_code: string;
            };
        };
    };

    const [fileName, setFileName] = useState<string | null>(null);

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Practice Test" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Edit Practice Test
                    </h1>

                    <Link href={practiceTestsIndex().url}>
                        <Button variant="outline">Back</Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form
                                {...PracticeTestController.update.form(practiceTest.id)}
                                encType="multipart/form-data"
                                disableWhileProcessing
                                className="flex flex-col gap-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        {(errors._error || errors.edit) && (
                                            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                {errors._error ?? errors.edit}
                                            </div>
                                        )}

                                        {/* Batch (read-only info) */}
                                        {practiceTest.batch && (
                                            <div className="rounded-md border bg-gray-50 p-3 text-sm text-gray-700">
                                                <strong>Batch:</strong>{' '}
                                                {practiceTest.batch.batch_code}
                                            </div>
                                        )}

                                        {/* Title */}
                                        <div className="grid gap-2">
                                            <Label>
                                                Test Title{' '}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                name="title"
                                                defaultValue={practiceTest.title}
                                            />
                                            <InputError message={errors.title} />
                                        </div>

                                        {/* Description */}
                                        <div className="grid gap-2">
                                            <Label>Description</Label>
                                            <Input
                                                name="description"
                                                defaultValue={
                                                    practiceTest.description ?? ''
                                                }
                                            />
                                            <InputError
                                                message={errors.description}
                                            />
                                        </div>

                                        {/* Due Date */}
                                        <div className="grid gap-2">
                                            <Label>
                                                Due Date{' '}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="datetime-local"
                                                name="due_date"
                                                defaultValue={practiceTest.due_date_local?.slice(
                                                    0,
                                                    16
                                                )}
                                                min={new Date()
                                                    .toISOString()
                                                    .slice(0, 16)}
                                            />
                                            <InputError message={errors.due_date} />
                                        </div>

                                       

                                        {/* New Attachment */}
                                        <div className="grid gap-2">
                                            <Label>Replace Attachment</Label>
                                            <Input
                                                type="file"
                                                name="attachment"
                                                onChange={(e) =>
                                                    setFileName(
                                                        e.target.files?.[0]?.name ??
                                                            null
                                                    )
                                                }
                                            />
                                            {fileName && (
                                                <p className="text-sm text-gray-600">
                                                    Selected: {fileName}
                                                </p>
                                            )}
                                            <InputError
                                                message={errors.attachment}
                                            />
                                        </div>

                                        {/* Submit */}
                                        <div className="mt-6 text-center">
                                            <Button
                                                type="submit"
                                                className="mt-2 w-fit"
                                                disabled={processing}
                                            >
                                                {processing && (
                                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Update Practice Test
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </div>
                    </div>
                </Card>
            </div>
        </TeacherLayout>
    );
}
