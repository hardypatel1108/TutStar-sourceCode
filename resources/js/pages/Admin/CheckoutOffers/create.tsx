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
import { Form, Head, Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Checkout Offers', href: '/admin/checkout-offers' },
    { title: 'Create Offer', href: '/admin/checkout-offers/create' },
];
interface Plan {
    id: number;
    title: string;
    months?: number | null;
    plan?: {
        title?: string | null;
        type?: string | null;
        price?: number | null;
        subjects?: string[];
        offers?: Array<{ id: number; title: string; type: string; value: number; active: boolean }>;
    } | null;
}
export default function Create({ plans, activeConflictsByPlan = {} }: { plans: Plan[]; activeConflictsByPlan?: Record<string, number> }) {
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [activeValue, setActiveValue] = useState<string>('1');
    const conflictCount = useMemo(() => Number(activeConflictsByPlan?.[selectedPlanId] ?? 0), [activeConflictsByPlan, selectedPlanId]);
    const selectedPlan = useMemo(() => plans.find((p: any) => String(p.id) === String(selectedPlanId)), [plans, selectedPlanId]);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Checkout Offer" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Add Checkout Offer</h1>
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
                                {...CheckoutOfferController.store.form()}
                                resetOnSuccess
                                disableWhileProcessing
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
                                            <Label htmlFor="checkout_plan_id">
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
                                                            {selectedPlan.plan.offers.map((offer: any) => (
                                                                <li key={offer.id}>
                                                                    {offer.title} - {offer.type} {offer.value} {offer.active ? '(Active)' : ''}
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
                                                <Label htmlFor="title">
                                                    Offer Title <span className="text-red-500">*</span>
                                                </Label>
                                                <Input id="title" name="title" title="Enter offer name" placeholder="Enter offer name" required />
                                                <InputError message={errors.title} />
                                            </div>

                                            {/* Type */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="type">
                                                    Offer Type <span className="text-red-500">*</span>
                                                </Label>

                                                <Select name="type">
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
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
                                                <Label htmlFor="value">
                                                    Value <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="value"
                                                    name="value"
                                                    type="number"
                                                    min="00"
                                                    step="01"
                                                    title="Enter discount value" placeholder="Enter discount value"
                                                    required
                                                />
                                                <InputError message={errors.value} />
                                            </div>

                                            {/* Starts At */}
                                            <div className="col-span-full grid gap-2">
                                                <Label htmlFor="starts_at">Starts At</Label>
                                                <Input id="starts_at" name="starts_at" type="datetime-local" className="" />
                                                <InputError message={errors.starts_at} />
                                            </div>

                                            {/* Ends At */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="ends_at">Ends At</Label>
                                                <Input id="ends_at" name="ends_at" type="datetime-local" />
                                                <InputError message={errors.ends_at} />
                                            </div>

                                            {/* Active Toggle */}
                                            {/* Status */}
                                            <div className="grid gap-2">
                                                <Label>Status *</Label>

                                                <Select name="active" value={activeValue} onValueChange={setActiveValue}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        <SelectItem value="1">Active</SelectItem>
                                                        <SelectItem value="0">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <InputError message={errors.status} />
                                            </div>
                                            {activeValue === '1' && conflictCount > 0 && (
                                                <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                                                    Warning: an active checkout offer already exists for this plan in current time window. On save, other active offers for this checkout plan will be set inactive.
                                                </div>
                                            )}
                                        </div>

                                        {/* Submit */}
                                        <div className="mt-6 text-center">
                                            <Button type="submit" className="mt-2 w-fit max-w-md">
                                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                Create Offer
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


