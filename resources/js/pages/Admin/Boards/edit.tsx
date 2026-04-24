import BoardController from '@/actions/App/Http/Controllers/Admin/BoardController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Boards', href: '/admin/boards' },
    { title: 'Edit Board', href: '/admin/boards/edit' },
];

export default function Edit() {
    const { board } = usePage().props as any;

    const [preview, setPreview] = useState<string | null>(board.logo ? `/storage/${board.logo}` : null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    }
    const statusOptions = [
        { id: 'active', name: 'Active' },
        { id: 'inactive', name: 'Inactive' },
    ];
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Board" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Board</h1>
                    <Link href="/admin/boards">
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-6">
                    <Form
                        {...BoardController.update.form(board.id)}
                        disableWhileProcessing
                        encType="multipart/form-data"
                        className="flex flex-col gap-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Name */}
                                    <div className="col-span-full grid gap-2">
                                        <Label htmlFor="name">Board Name</Label>
                                        <Input id="name" name="name" defaultValue={board.name} />
                                        <InputError message={errors.name} />
                                    </div>

                                    {/* Description */}
                                    <div className="col-span-full grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input id="description" name="description" defaultValue={board.description ?? ''} />
                                        <InputError message={errors.description} />
                                    </div>

                                    {/* Logo */}
                                    <div className="col-span-full grid gap-2">
                                        <Label htmlFor="logo">Logo</Label>
                                        <Input id="logo" name="logo" type="file" accept="image/*" onChange={handleFileChange} />
                                        <InputError message={errors.logo} />
                                    </div>

                                    {/* Preview */}
                                    {preview && (
                                        <div className="col-span-full mt-2">
                                            <p className="text-sm text-gray-600">Preview:</p>
                                            <img src={preview} className="h-32 w-32 rounded-md border object-cover" />
                                        </div>
                                    )}

                                    {/* Status */}
                                    <div className="col-span-full grid gap-2">
                                        <Label htmlFor="status">Active?</Label>

                                        <Select name="status" defaultValue={board.status}>
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

                                <div className="mt-6 text-center">
                                    <Button className="mt-2 w-fit max-w-md">
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Update Board
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </Card>
            </div>
        </AdminLayout>
    );
}

