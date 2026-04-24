import CheckoutPlanController from '@/actions/App/Http/Controllers/Admin/CheckoutPlanController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/admin-layout';
import { index as plansIndex } from '@/routes/admin/checkoutPlans';
import { create as offersCreate } from '@/routes/admin/checkoutOffers';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Checkout Plans', href: '/admin/checkout-plans' },
    { title: 'Create Plan', href: '/admin/checkout-plans/create' },
];
export default function Create() {
      const { plans } = usePage().props as { plans: any[] };
      const [selectedPlanId, setSelectedPlanId] = useState<string>('');
      const selectedPlan = useMemo(() => plans.find((p) => String(p.id) === String(selectedPlanId)), [plans, selectedPlanId]);
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
             <Head title="Create Checkout Plan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Add Checkout Plan</h1>
                    <div className="flex items-center gap-2">
                        <Link href={offersCreate().url}>
                            <Button variant="outline">Add Offer</Button>
                        </Link>
                        <Link href={plansIndex().url}>
                            <Button>Back</Button>
                        </Link>
                    </div>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form {...CheckoutPlanController.store.form()} resetOnSuccess disableWhileProcessing className="flex flex-col gap-6">
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid grid-cols-1 gap-6">
                                         <div className="grid gap-2">
                                                <Label htmlFor="plan_id">
                                                    Select Plan <span className="text-red-500">*</span>
                                                </Label>

                                                <Select name="plan_id" value={selectedPlanId} onValueChange={setSelectedPlanId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose existing plan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {plans.map((p) => (
                                                            <SelectItem key={p.id} value={String(p.id)}>
                                                                {p.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <InputError message={errors.plan_id} />
                                            </div>
                                            {selectedPlan && (
                                                <div className="rounded-md border bg-muted/20 p-3 text-sm">
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
                                            <div className="grid gap-2">
                                                <Label htmlFor="title">Plan Title (optional)</Label>
                                                <Input id="title" name="title" title="Ex: Premium Annual" placeholder="Ex: Premium Annual" />
                                                <InputError message={errors.title} />
                                            </div>
                                              {/* Months */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="months">
                                                    Duration in Months <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="months"
                                                    name="months"
                                                    type="number"
                                                    min="1"
                                                    title="Example: 12" placeholder="Example: 12"
                                                    required
                                                />
                                                <InputError message={errors.months} />
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <div className="mt-6 text-center">
                                            <Button type="submit" className="mt-2 w-fit max-w-md">
                                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                Create Plan
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


