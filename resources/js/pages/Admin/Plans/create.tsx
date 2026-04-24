import PlanController from '@/actions/App/Http/Controllers/Admin/PlanController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { index as plansIndex } from '@/routes/admin/plans';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

export default function Create() {
    const { boards } = usePage().props as {
        boards: Array<{ id: number; name: string }>;
    };

    const [classes, setClasses] = useState<Array<{ id: number; name: string }>>([]);
    const [subjects, setSubjects] = useState<Array<{ id: number; name: string }>>([]);
    const [planType, setPlanType] = useState<string>('single');

    const fetchClasses = async (boardId: string) => {
        const res = await fetch(`/admin/classes-by-board/${boardId}`);
        const data = await res.json();
        setClasses(data);
        setSubjects([]);
    };

    const fetchSubjects = async (classId: string) => {
        const res = await fetch(`/admin/subjects-by-class/${classId}`);
        const data = await res.json();
        setSubjects(data);
    };

    const typeOptions = [
        { id: 'single', name: 'Single' },
        { id: 'combo', name: 'Combo' },
        { id: 'all', name: 'All' },
    ];

    const statusOptions = [
        { id: 'active', name: 'Active' },
        { id: 'inactive', name: 'Inactive' },
    ];

    return (
        <AdminLayout>
            <Head title="Create Plan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Add Plan</h1>

                    <Link href={plansIndex().url}>
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form {...PlanController.store.form()} resetOnSuccess disableWhileProcessing>
                                {({ errors, processing }) => (
                                    <div className="flex flex-col gap-6">
                                        {/* Board */}
                                        <div className="grid gap-2">
                                            <Label>Board *</Label>

                                            <Select name="board_id" onValueChange={fetchClasses}>
                                                <SelectTrigger>
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

                                        {/* Class */}
                                        <div className="grid gap-2">
                                            <Label>Class *</Label>

                                            <Select name="class_id" disabled={classes.length === 0} onValueChange={fetchSubjects}>
                                                <SelectTrigger>
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

                                        {/* Title */}
                                        <div className="grid gap-2">
                                            <Label>Title *</Label>
                                            <Input name="title" />
                                            <InputError message={errors.title} />
                                        </div>

                                        {/* Type */}
                                        <div className="grid gap-2">
                                            <Label>Plan Type *</Label>

                                            <Select name="type" onValueChange={(val) => setPlanType(val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {typeOptions.map((t) => (
                                                        <SelectItem key={t.id} value={t.id}>
                                                            {t.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <InputError message={errors.type} />
                                        </div>

                                        {/* Subjects - only for combo/all */}
                                        {planType !== 'all' && (
                                            <div className="grid gap-2">
                                                <Label>Subjects *</Label>

                                                <div className="grid gap-2">
                                                    {subjects.length > 0 &&
                                                        subjects.map((sub) => (
                                                            <div key={sub.id} className="flex items-center gap-2">
                                                                <input
                                                                    type={planType === 'single' ? 'radio' : 'checkbox'}
                                                                    name={planType === 'single' ? 'subject_ids' : 'subject_ids[]'}
                                                                    value={sub.id}
                                                                    className="h-4 w-4"
                                                                />
                                                                <span>{sub.name}</span>
                                                            </div>
                                                        ))}
                                                </div>

                                                <InputError message={errors.subject_ids} />
                                            </div>
                                        )}

                                        {/* ALL PLAN TYPE — we send all subject IDs but we do NOT show UI */}
                                        {planType === 'all' &&
                                            subjects.length > 0 &&
                                            subjects.map((sub) => <input key={sub.id} type="hidden" name="subject_ids[]" value={sub.id} />)}
                                        {/* Duration */}
                                        <div className="grid gap-2">
                                            <Label>Duration (Days) *</Label>
                                            <Input type="number" name="duration_days" min="1" />
                                            <InputError message={errors.duration_days} />
                                        </div>

                                        {/* Ongoing Batches */}
                                        <div className="grid gap-2">
                                            <Label>Ongoing Batches *</Label>
                                            <Input type="number" name="ongoing_batches" min="0" defaultValue="0" />
                                            <InputError message={errors.ongoing_batches} />
                                        </div>

                                        {/* Price */}
                                        <div className="grid gap-2">
                                            <Label>Price *</Label>
                                            <Input type="number" name="price" min="0" step="0.01" />
                                            <InputError message={errors.price} />
                                        </div>

                                        {/* Description */}
                                        <div className="grid gap-2">
                                            <Label>Description</Label>
                                            <Input name="description" />
                                            <InputError message={errors.description} />
                                        </div>

                                        {/* Status */}
                                        <div className="grid gap-2">
                                            <Label>Status *</Label>

                                            <Select name="status">
                                                <SelectTrigger>
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

                                        {/* Submit */}
                                        <div className="text-center">
                                            <Button type="submit" className="mt-4 w-fit">
                                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                Create Plan
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Form>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold">Plan Offers</h2>
                            <p className="text-xs text-muted-foreground">
                                Save this plan first, then you can add offers.
                            </p>
                        </div>
                        <Button variant="outline" disabled>
                            Add Offer
                        </Button>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}

