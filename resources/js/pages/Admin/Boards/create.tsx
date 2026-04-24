import BoardController from '@/actions/App/Http/Controllers/Admin/BoardController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/admin-layout';
import { index } from '@/routes/admin/boards';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Boards', href: '/admin/boards' },
    { title: 'Create Board', href: '/admin/boards/create' },
];

export default function Create() {
    const [preview, setPreview] = useState<string | null>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
    }

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Board" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Add Board</h1>
                    <Link href={index().url}>
                        <Button>Back</Button>
                    </Link>
                </div>
                <Card className="p-4">
                    {' '}
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form
                                {...BoardController.store.form()}
                                resetOnSuccess
                                disableWhileProcessing
                                encType="multipart/form-data"
                                className="flex flex-col gap-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {/* Name */}
                                            <div className="col-span-full grid gap-2">
                                                <Label htmlFor="name">
                                                    Board Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input id="name" name="name" type="text" required title="Enter board name" placeholder="Enter board name" autoFocus />
                                                <InputError message={errors.name} />
                                            </div>

                                            {/* Description */}
                                            <div className="col-span-full grid gap-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Input id="description" name="description" type="text" title="Optional description" placeholder="Optional description" />
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
                                                    <p className="mb-1 text-sm text-gray-600">Preview:</p>
                                                    <img src={preview} alt="Logo Preview" className="h-32 w-32 rounded-md border object-cover" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 text-center">
                                            <Button type="submit" className="mt-2 w-fit max-w-md" tabIndex={15}>
                                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                Create
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


