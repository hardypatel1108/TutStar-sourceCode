import ClazzController from '@/actions/App/Http/Controllers/Admin/ClazzController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { index as classesIndex } from '@/routes/admin/classes';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Classes', href: '/admin/classes' },
    { title: 'Create Class', href: '/admin/classes/create' },
];

export default function Create() {
    const { boards } = usePage().props as {
        boards: Array<{ id: number; name: string }>;
    };

    const statusOptions = [
        { id: 'active', name: 'Active' },
        { id: 'inactive', name: 'Inactive' },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Class" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Add Class</h1>

                    <Link href={classesIndex().url}>
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form {...ClazzController.store.form()} resetOnSuccess disableWhileProcessing className="flex flex-col gap-6">
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Board Select */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="board_id">Board *</Label>

                                                <Select name="board_id">
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

                                            {/* Name */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Class Name *</Label>
                                                <Input id="name" name="name" required />
                                                <InputError message={errors.name} />
                                            </div>

                                            {/* Description */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Input id="description" name="description" />
                                                <InputError message={errors.description} />
                                            </div>

                                            {/* Ordinal */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="ordinal">Ordinal *</Label>
                                                <Input id="ordinal" name="ordinal" type="number" min={1} required />
                                                <InputError message={errors.ordinal} />
                                            </div>

                                            {/* Status */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="status">Status *</Label>

                                                <Select name="status">
                                                    <SelectTrigger id="status">
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map((s) => (
                                                            <SelectItem
                                                                key={s.id}
                                                                value={s.id} // send "active" or "inactive"
                                                            >
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
                                                Create Class
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

