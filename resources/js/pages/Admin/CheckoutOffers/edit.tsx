import CheckoutOfferController from '@/actions/App/Http/Controllers/Admin/CheckoutOfferController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { index as offersIndex } from '@/routes/admin/checkoutOffers';
import { create as plansCreate } from '@/routes/admin/checkoutPlans';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Checkout Offers', href: '/admin/checkout-offers' },
    { title: 'Edit Offer', href: '#' },
];

export default function Edit() {
    const { offer, plans, activeConflictsByPlan = {} } = usePage().props as {
        offer: {
            id: number;
            checkout_plan_id: number;
            title: string;
            type: string;
            value: number;
            starts_at_local: string | null;
            ends_at_local: string | null;
            active: boolean;
        };
        plans: any[];
        activeConflictsByPlan?: Record<string, number>;
    };
    const [selectedPlanId, setSelectedPlanId] = useState<string>(String(offer.checkout_plan_id ?? ''));
    const [activeValue, setActiveValue] = useState<string>(offer.active ? '1' : '0');
    const conflictCount = useMemo(() => Number(activeConflictsByPlan?.[selectedPlanId] ?? 0), [activeConflictsByPlan, selectedPlanId]);
    const selectedPlan = useMemo(() => plans.find((p: any) => String(p.id) === String(selectedPlanId)), [plans, selectedPlanId]);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Checkout Offer" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Offer</h1>
                    <div className="flex items-center gap-2">
                        <Link href={plansCreate().url}>
                            <Button variant="outline">Add Checkout Plan</Button>
                        </Link>
                        <Link href={offersIndex().url}>
                            <Button>Back</Button>
                        </Link>
                    </div>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form
                                {...CheckoutOfferController.update.form({ checkout_offer: offer.id })}
                                disableWhileProcessing
                                defaults={offer}
                                className="flex flex-col gap-6"
                                onSubmit={(e) => {
                                    if (activeValue === '1' && conflictCount > 0) {
                                        const ok = window.confirm(
                                            `There is already an active checkout offer for this checkout plan in the current time window. If you continue, existing active offers will be set to inactive and this offer will become active. Continue?`,
                                        );
                                        if (!ok) e.preventDefault();
                                    }
                                }}
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Checkout Plan */}
                                            <div className="grid gap-2">
                                                <Label>
                                                    Checkout Plan <span className="text-red-500">*</span>
                                                </Label>

                                                <Select name="checkout_plan_id" value={selectedPlanId} onValueChange={setSelectedPlanId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select plan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {plans.map((plan) => (
                                                            <SelectItem key={plan.id} value={String(plan.id)}>
                                                                {plan.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <InputError message={errors.checkout_plan_id} />
                                            </div>
                                            {selectedPlan && (
                                                <div className="rounded-md border bg-muted/20 p-3 text-sm">
                                                    <p className="font-medium">{selectedPlan.title}</p>
                                                    <p className="text-muted-foreground">Months: {selectedPlan.months ?? '-'}</p>
                                                    <p className="text-muted-foreground">Plan: {selectedPlan.plan?.title || '-'}</p>
                                                    <p className="text-muted-foreground">Type: {selectedPlan.plan?.type || '-'}</p>
                                                    <p className="text-muted-foreground">Price: {selectedPlan.plan?.price ?? '-'}</p>
                                                    <p className="text-muted-foreground">
                                                        Subjects: {selectedPlan.plan?.subjects?.length ? selectedPlan.plan.subjects.join(', ') : '-'}
                                                    </p>
                                                    {selectedPlan.plan?.offers?.length ? (
                                                        <div className="mt-2">
                                                            <p className="text-xs font-medium text-muted-foreground">Plan Offers</p>
                                                            <ul className="mt-1 text-xs text-muted-foreground">
                                                                {selectedPlan.plan.offers.map((offerItem: any) => (
                                                                    <li key={offerItem.id}>
                                                                        {offerItem.title} - {offerItem.type} {offerItem.value} {offerItem.active ? '(Active)' : ''}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ) : (
                                                        <p className="mt-2 text-xs text-muted-foreground">No plan offers.</p>
                                                    )}
                                                </div>
                                            )}
                                            {/* Title */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="title">Offer Title *</Label>
                                                <Input id="title" name="title" defaultValue={offer.title} />
                                                <InputError message={errors.title} />
                                            </div>

                                            {/* Type */}
                                            <div className="grid gap-2">
                                                <Label>Offer Type *</Label>
                                                <Select name="type" defaultValue={offer.type}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.type} />
                                            </div>

                                            {/* Value */}
                                            <div className="grid gap-2">
                                                <Label>Value *</Label>
                                                <Input name="value" type="number" defaultValue={offer.value} min="0" step="1" />
                                                <InputError message={errors.value} />
                                            </div>

                                            {/* Starts At */}
                                            <div className="grid gap-2">
                                                <Label>Starts At</Label>
                                                <Input
                                                    name="starts_at"
                                                    type="datetime-local"
                                                    defaultValue={offer.starts_at_local ? offer.starts_at_local.replace(' ', 'T').slice(0, 16) : ''}
                                                />
                                                <InputError message={errors.starts_at} />
                                            </div>

                                            {/* Ends At */}
                                            <div className="grid gap-2">
                                                <Label>Ends At</Label>
                                                <Input
                                                    name="ends_at"
                                                    type="datetime-local"
                                                    defaultValue={offer.ends_at_local ? offer.ends_at_local.replace(' ', 'T').slice(0, 16) : ''}
                                                />
                                                <InputError message={errors.ends_at} />
                                            </div>

                                            {/* Active */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="active">Active?</Label>

                                                <Select name="active" value={activeValue} onValueChange={setActiveValue}>
                                                    <SelectTrigger id="active">
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">Active</SelectItem>
                                                        <SelectItem value="0">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <InputError message={errors.active} />
                                            </div>
                                            {activeValue === '1' && conflictCount > 0 && (
                                                <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                                                    Warning: an active checkout offer already exists for this plan in current time window. On save, other active offers for this checkout plan will be set inactive.
                                                </div>
                                            )}
                                        </div>

                                        {/* Submit */}
                                        <div className="mt-6 text-center">
                                            <Button type="submit" className="w-fit">
                                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                                Update Offer
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

