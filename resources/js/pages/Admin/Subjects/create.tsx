import SubjectController from '@/actions/App/Http/Controllers/Admin/SubjectController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { index as subjectsIndex } from '@/routes/admin/subjects';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

export default function Create() {
    const { boards, classes: initialClasses = [], subjectCopy } = usePage().props as {
        boards: Array<{ id: number; name: string }>;
        classes?: Array<{ id: number; name: string }>;
        subjectCopy?: any;
    };

    const [classes, setClasses] = useState<Array<{ id: number; name: string }>>(initialClasses);
    const [selectedBoardId, setSelectedBoardId] = useState<string>(subjectCopy?.board_id ? String(subjectCopy.board_id) : '');
    const [selectedClassId, setSelectedClassId] = useState<string>(subjectCopy?.class_id ? String(subjectCopy.class_id) : '');
    const [status, setStatus] = useState<string>(subjectCopy?.status ?? '');

    // When board changes → fetch classes
    const fetchClasses = async (boardId: string) => {
        if (!boardId) return setClasses([]);

        const res = await fetch(`/admin/classes-by-board/${boardId}`);
        const data = await res.json();
        setClasses(data);
        setSelectedClassId('');
    };

    const statusOptions = [
        { id: 'active', name: 'Active' },
        { id: 'inactive', name: 'Inactive' },
    ];

    return (
        <AdminLayout>
            <Head title="Create Subject" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Add Subject</h1>

                    <Link href={subjectsIndex().url}>
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form {...SubjectController.store.form()} resetOnSuccess disableWhileProcessing className="flex flex-col gap-6">
                                {({ errors, processing }) => (
                                    <>
                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Board Select */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="board_id">Board *</Label>

                                                <Select
                                                    name="board_id"
                                                    value={selectedBoardId}
                                                    onValueChange={(value) => {
                                                        setSelectedBoardId(value);
                                                        fetchClasses(value);
                                                    }}
                                                >
                                                    <SelectTrigger id="board_id">
                                                        <SelectValue placeholder="Select Board" />
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

                                            {/* Class Select */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="class_id">Class *</Label>

                                                <Select
                                                    name="class_id"
                                                    value={selectedClassId}
                                                    onValueChange={(value) => setSelectedClassId(value)}
                                                    disabled={classes.length === 0}
                                                >
                                                    <SelectTrigger id="class_id">
                                                        <SelectValue placeholder="Select Class" />
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

                                            {/* Name */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Subject Name *</Label>
                                                <Input id="name" name="name" defaultValue={subjectCopy?.name ?? ''} required />
                                                <InputError message={errors.name} />
                                            </div>

                                            {/* Code */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="code">Subject Code *</Label>
                                                <Input id="code" name="code" defaultValue={subjectCopy?.code ?? ''} required />
                                                <InputError message={errors.code} />
                                            </div>

                                            {/* Description */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Input id="description" name="description" defaultValue={subjectCopy?.description ?? ''} />
                                                <InputError message={errors.description} />
                                            </div>

                                            {/* Icon */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="icon">Icon (Image)</Label>

                                                <Input id="icon" name="icon" type="file" accept="image/*" />

                                                <InputError message={errors.icon} />
                                            </div>

                                            {/* Color */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="color">Color</Label>
                                                <Input id="color" name="color" title="ff0000" placeholder="ff0000" defaultValue={subjectCopy?.color ?? ''} />
                                                <InputError message={errors.color} />
                                            </div>

                                            {/* Status */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="status">Status *</Label>

                                                <Select name="status" value={status} onValueChange={(value) => setStatus(value)}>
                                                    <SelectTrigger id="status">
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        {statusOptions.map((s) => (
                                                            <SelectItem key={s.id} value={s.id}>
                                                                {s.name}
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
                                                Create Subject
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


