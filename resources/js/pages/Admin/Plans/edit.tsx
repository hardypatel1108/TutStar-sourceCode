import PlanController from '@/actions/App/Http/Controllers/Admin/PlanController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { index as plansIndex } from '@/routes/admin/plans';
import { create as createPlanOffer, edit as editPlanOffer } from '@/routes/admin/planOffers';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

export default function Edit() {
    const { plan, boards, classes, subjects, selectedSubjects, planOffers = [] } = usePage().props as any;

    const [currentClasses, setCurrentClasses] = useState(classes);
    const [currentSubjects, setCurrentSubjects] = useState(subjects);
    const [planType, setPlanType] = useState(plan.type);

    const fetchClasses = async (boardId: string) => {
        const res = await fetch(`/admin/classes-by-board/${boardId}`);
        const data = await res.json();
        setCurrentClasses(data);
        setCurrentSubjects([]);
    };

    const fetchSubjects = async (classId: string) => {
        const res = await fetch(`/admin/subjects-by-class/${classId}`);
        const data = await res.json();
        setCurrentSubjects(data);
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

    const formatOfferValue = (offer: any) => {
        const type = String(offer.type || '').toLowerCase();
        if (type === 'percentage') {
            return `${offer.value}%`;
        }
        return `INR ${Number(offer.value ?? 0).toLocaleString('en-IN')}`;
    };

    return (
        <AdminLayout>
            <Head title="Edit Plan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Plan</h1>

                    <Link href={plansIndex().url}>
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form {...PlanController.update.form(plan.id)} disableWhileProcessing>
                                {({ errors, processing }) => (
                                    <div className="flex flex-col gap-6">

                                        {/* Board */}
                                        <div className="grid gap-2">
                                            <Label>Board *</Label>

                                            <Select
                                                name="board_id"
                                                defaultValue={String(plan.board_id)}
                                                onValueChange={fetchClasses}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Board" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {boards.map((b: any) => (
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

                                            <Select
                                                name="class_id"
                                                defaultValue={String(plan.class_id)}
                                                onValueChange={fetchSubjects}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Class" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {currentClasses.map((c: any) => (
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
                                            <Input name="title" defaultValue={plan.title} />
                                            <InputError message={errors.title} />
                                        </div>

                                        {/* Type */}
                                        <div className="grid gap-2">
                                            <Label>Plan Type *</Label>

                                            <Select
                                                name="type"
                                                defaultValue={plan.type}
                                                onValueChange={setPlanType}
                                            >
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

                                        {/* Subjects */}
                                        {planType !== 'all' && (
                                            <div className="grid gap-2">
                                                <Label>Subjects *</Label>

                                                <div className="grid gap-2">
                                                    {currentSubjects.map((sub: any) => (
                                                        <div key={sub.id} className="flex items-center gap-2">
                                                            <input
                                                                type={planType === 'single' ? 'radio' : 'checkbox'}
                                                                name={planType === 'single' ? 'subject_ids' : 'subject_ids[]'}
                                                                value={sub.id}
                                                                defaultChecked={selectedSubjects.includes(sub.id)}
                                                                className="h-4 w-4"
                                                            />
                                                            <span>{sub.name}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <InputError message={errors.subject_ids} />
                                            </div>
                                        )}

                                        {/* If ALL type → send hidden subject IDs */}
                                        {planType === 'all' &&
                                            currentSubjects.map((sub: any) => (
                                                <input key={sub.id} type="hidden" name="subject_ids[]" value={sub.id} />
                                            ))}

                                        {/* Duration */}
                                        <div className="grid gap-2">
                                            <Label>Duration (Days) *</Label>
                                            <Input type="number" name="duration_days" defaultValue={plan.duration_days} />
                                            <InputError message={errors.duration_days} />
                                        </div>

                                        {/* Ongoing Batches */}
                                        <div className="grid gap-2">
                                            <Label>Ongoing Batches *</Label>
                                            <Input type="number" name="ongoing_batches" min="0" defaultValue={plan.ongoing_batches ?? 0} />
                                            <InputError message={errors.ongoing_batches} />
                                        </div>

                                        {/* Price */}
                                        <div className="grid gap-2">
                                            <Label>Price *</Label>
                                            <Input type="number" name="price" defaultValue={plan.price} />
                                            <InputError message={errors.price} />
                                        </div>

                                        {/* Description */}
                                        <div className="grid gap-2">
                                            <Label>Description</Label>
                                            <Input name="description" defaultValue={plan.description} />
                                            <InputError message={errors.description} />
                                        </div>

                                        {/* Status */}
                                        <div className="grid gap-2">
                                            <Label>Status *</Label>

                                            <Select name="status" defaultValue={plan.status}>
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
                                                Update Plan
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
                            <p className="text-xs text-muted-foreground">Manage offers for this plan.</p>
                        </div>
                        <Link href={createPlanOffer({ query: { plan_id: plan.id } }).url}>
                            <Button>Add Offer</Button>
                        </Link>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {planOffers.length > 0 ? (
                            planOffers.map((offer: any) => (
                                <div key={offer.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-base font-semibold">{offer.title}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{offer.type}</p>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                offer.active
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-red-600 text-white'
                                            }`}
                                        >
                                            {offer.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid gap-2 rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">
                                        <div className="flex items-center justify-between">
                                            <span>Value</span>
                                            <span className="font-medium text-foreground">{formatOfferValue(offer)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Starts</span>
                                            <span>{offer.starts_at_formatted || '-'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Ends</span>
                                            <span>{offer.ends_at_formatted || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-end gap-2">
                                        <Link href={editPlanOffer({ plan_offer: offer.id }).url}>
                                            <Button size="sm" variant="outline">
                                                Edit
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                No offers yet. Click “Add Offer” to create one.
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}

