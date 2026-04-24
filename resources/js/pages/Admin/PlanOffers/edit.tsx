import PlanOfferController from '@/actions/App/Http/Controllers/Admin/PlanOfferController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/admin-layout';
import { index } from '@/routes/admin/planOffers';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Plan Offers', href: '/admin/planoffers' },
    { title: 'Edit Plan Offer', href: index().url },
];

export default function Edit() {
    const { planOffer, plans, activeConflictsByPlan = {} } = usePage().props as any;

    const { data, setData } = useForm({
        active: planOffer.active ? 1 : 0,
    });
    const [selectedPlanId, setSelectedPlanId] = useState<string>(String(planOffer.plan_id ?? ''));

    const typeOptions = [
        { id: 'percentage', name: 'Percentage (%)' },
        { id: 'flat', name: 'Flat Amount' },
    ];
    const conflictCount = useMemo(() => Number(activeConflictsByPlan?.[selectedPlanId] ?? 0), [activeConflictsByPlan, selectedPlanId]);
    const selectedPlan = useMemo(() => plans.find((p: any) => String(p.id) === String(selectedPlanId)), [plans, selectedPlanId]);
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Plan Offer" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Plan Offer</h1>
                    <Link href={index().url}>
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-6">
                    <div className="mx-auto w-full max-w-2xl">
                        <Form
                            {...PlanOfferController.update.form({ plan_offer: planOffer.id })}
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
                                            <Label>Select Plan *</Label>

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
                                            <Label>Offer Title *</Label>
                                            <Input name="title" defaultValue={planOffer.title} type="text" />
                                            <InputError message={errors.title} />
                                        </div>

                                        {/* Type */}
                                        <div className="grid gap-2">
                                            <Label>Offer Type *</Label>
                                            <Select name="type" defaultValue={planOffer.type}>
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
                                            <Label>Discount Value *</Label>
                                            <Input name="value" type="number" step="0.01" defaultValue={planOffer.value} />
                                            <InputError message={errors.value} />
                                        </div>

                                        {/* Start Date */}
                                        <div className="grid gap-2">
                                            <Label>Start Date *</Label>
                                            <Input name="starts_at" type="date" defaultValue={planOffer.starts_at_local ? planOffer.starts_at_local.slice(0, 10) : ''} />
                                            <InputError message={errors.starts_at} />
                                        </div>

                                        {/* End Date */}
                                        <div className="grid gap-2">
                                            <Label>End Date</Label>
                                            <Input name="ends_at" type="date" defaultValue={planOffer.ends_at_local ? planOffer.ends_at_local.slice(0, 10) : ''} />
                                            <InputError message={errors.ends_at} />
                                        </div>

                                        {/* Active */}
                                        <div className="col-span-full flex items-center justify-between rounded-md border p-3">
                                            <Label>Active?</Label>

                                            <Switch checked={data.active === 1} onCheckedChange={(value) => setData('active', value ? 1 : 0)} />
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
                                        <Button type="submit" className="mt-2 w-fit max-w-md">
                                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                            Update Offer
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

