import PlanOfferController from '@/actions/App/Http/Controllers/Admin/PlanOfferController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { index } from '@/routes/admin/planOffers';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Plan Offers', href: '/admin/planoffers' },
    { title: 'Create Plan Offer', href: index().url },
];

export default function Create() {
    const { plans, activeConflictsByPlan = {}, selectedPlanId: initialPlanId } = usePage().props as any;
    const { data, setData } = useForm({
        active: 0, // default value
    });
    const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId ? String(initialPlanId) : '');

    useEffect(() => {
        if (initialPlanId && !selectedPlanId) {
            setSelectedPlanId(String(initialPlanId));
        }
    }, [initialPlanId, selectedPlanId]);
    const typeOptions = [
        { id: 'percentage', name: 'Percentage (%)' },
        { id: 'flat', name: 'Flat Amount' },
    ];
    const conflictCount = useMemo(() => Number(activeConflictsByPlan?.[selectedPlanId] ?? 0), [activeConflictsByPlan, selectedPlanId]);
    const selectedPlan = useMemo(() => plans.find((p: any) => String(p.id) === String(selectedPlanId)), [plans, selectedPlanId]);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Plan Offer" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Add Plan Offer</h1>
                    <Link href={index().url}>
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-6">
                    <div className="mx-auto w-full max-w-2xl">
                        <Form
                            {...PlanOfferController.store.form()}
                            resetOnSuccess
                            disableWhileProcessing
                            className="flex flex-col gap-6"
                            onSubmit={(e) => {
                                if (data.active === 1 && conflictCount > 0) {
                                    const ok = window.confirm(
                                        `There is already an active offer for this plan in the current time window. If you continue, existing active offers will be set to inactive and this offer will become active. Continue?`,
                                    );
                                    if (!ok) e.preventDefault();
                                }
                            }}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {/* Plan */}
                                    <div className="col-span-full grid gap-2">
                                        <Label htmlFor="plan_id">
                                            Select Plan <span className="text-red-500">*</span>
                                        </Label>

                                            <Select name="plan_id" value={selectedPlanId} onValueChange={setSelectedPlanId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a plan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {plans.map((p: any) => (
                                                        <SelectItem key={p.id} value={String(p.id)}>
                                                            {p.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.plan_id} />
                                            <input type="hidden" name="plan_id" value={selectedPlanId} />
                                        </div>

                                        {selectedPlan && (
                                            <div className="col-span-full rounded-md border bg-muted/20 p-3 text-sm">
                                                <p className="font-medium">{selectedPlan.name}</p>
                                                <p className="text-muted-foreground">Type: {selectedPlan.type || '-'}</p>
                                                <p className="text-muted-foreground">Price: {selectedPlan.price ?? '-'}</p>
                                                <p className="text-muted-foreground">
                                                    Subjects: {selectedPlan.subjects?.length ? selectedPlan.subjects.join(', ') : '-'}
                                                </p>
                                                {selectedPlan.offers?.length ? (
                                                    <div className="mt-2">
                                                        <p className="text-xs font-medium text-muted-foreground">Recent Offers</p>
                                                        <ul className="mt-1 text-xs text-muted-foreground">
                                                            {selectedPlan.offers.map((offer: any) => (
                                                                <li key={offer.id}>
                                                                    {offer.title} - {offer.type} {offer.value} {offer.active ? '(Active)' : ''}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <p className="mt-2 text-xs text-muted-foreground">No offers yet.</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Title */}
                                        <div className="col-span-full grid gap-2">
                                            <Label htmlFor="title">
                                                Offer Title <span className="text-red-500">*</span>
                                            </Label>
                                            <Input id="title" name="title" type="text" title="Enter offer title" placeholder="Enter offer title" />
                                            <InputError message={errors.title} />
                                        </div>

                                        {/* Type */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="type">
                                                Offer Type <span className="text-red-500">*</span>
                                            </Label>
                                            <Select name="type">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select offer type" />
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

                                        {/* Value */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="value">
                                                Discount Value <span className="text-red-500">*</span>
                                            </Label>
                                            <Input id="value" name="value" type="number" step="0.01" title="Value" placeholder="Value" />
                                            <InputError message={errors.value} />
                                        </div>

                                        {/* Start Date */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="starts_at">
                                                Start Date <span className="text-red-500">*</span>
                                            </Label>
                                            <Input id="starts_at" name="starts_at" type="date" />
                                            <InputError message={errors.starts_at} />
                                        </div>

                                        {/* End Date */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="ends_at">End Date</Label>
                                            <Input id="ends_at" name="ends_at" type="date" />
                                            <InputError message={errors.ends_at} />
                                        </div>

                                        {/* Active */}
                                        <div className="col-span-full flex items-center justify-between rounded-md border p-3">
                                            <Label htmlFor="active">Active?</Label>
                                            <Switch checked={data.active === 1} onCheckedChange={(value) => setData('active', value ? 1 : 0)} />

                                            {/* Hidden input that Inertia sends */}
                                            <input type="hidden" name="active" value={data.active} />
                                        </div>
                                        {data.active === 1 && conflictCount > 0 && (
                                            <div className="col-span-full rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                                                Warning: an active offer already exists for this plan in current time window. On save, other active offers for this plan will be set inactive.
                                            </div>
                                        )}
                                        <InputError message={errors.active} />
                                    </div>

                                    <div className="mt-6 text-center">
                                        <Button type="submit" className="mt-2 w-fit max-w-md" tabIndex={15}>
                                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                            Create Offer
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}


