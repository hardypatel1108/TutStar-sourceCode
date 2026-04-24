import HomeworkController from '@/actions/App/Http/Controllers/Teacher/HomeworkController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TeacherLayout from '@/layouts/teacher-layout';
import { index as homeworkIndex } from '@/routes/teacher/homeworks';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const breadcrumbs = [
    { title: 'Homeworks', href: '/teacher/homeworks' },
    { title: 'Edit Homework', href: '#' },
];

export default function Edit() {
    const { homework, canEdit, edit_block_reason } = usePage().props as {
        homework: any;
        canEdit: boolean;
        edit_block_reason?: string;
    };

    const [showBlocked, setShowBlocked] = useState(!canEdit);
    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Homework" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Homework</h1>

                    <Link href={homeworkIndex().url}>
                        <Button variant="outline">Back</Button>
                    </Link>
                </div>

                <Card className="p-6">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            {/* ⛔ BLOCKED POPUP */}
                            <AlertDialog open={showBlocked}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Editing Not Allowed</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {edit_block_reason ?? 'You can edit a homework only within 30 minutes of creation.'}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogAction onClick={() => (window.location.href = homeworkIndex().url)}>Go Back</AlertDialogAction>
                                </AlertDialogContent>
                            </AlertDialog>

                            {/* ✏️ EDIT FORM */}
                            {canEdit && (
                                <Form {...HomeworkController.update.form(homework.id)} encType="multipart/form-data" className="flex flex-col gap-6">
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid grid-cols-1 gap-6">
                                                {(errors._error || errors.edit) && (
                                                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                        {errors._error ?? errors.edit}
                                                    </div>
                                                )}
                                                <div className="grid gap-4">
                                                    <div>
                                                        <Label>Homework Title</Label>
                                                        <Input name="title" defaultValue={homework.title} />
                                                        <InputError message={errors.title} />
                                                    </div>

                                                    <div>
                                                        <Label>Description</Label>
                                                        <Input name="description" defaultValue={homework.description} />
                                                        <InputError message={errors.description} />
                                                    </div>

                                                    <div>
                                                        <Label>Due Date</Label>
                                                        <Input
                                                            type="date"
                                                            name="due_date"
                                                            defaultValue={homework.due_date_local ? homework.due_date_local.slice(0, 10) : ''}
                                                        />
                                                        <InputError message={errors.due_date} />
                                                    </div>

                                                    <div>
                                                        <Label>Attachment</Label>
                                                        <Input type="file" name="attachment" />
                                                        <InputError message={errors.attachment} />
                                                    </div>
                                                </div>

                                                <Button type="submit" disabled={processing} className="mt-4 w-fit">
                                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                                    Update Homework
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
