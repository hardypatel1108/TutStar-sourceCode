import StudentSubscriptionController from '@/actions/App/Http/Controllers/Admin/StudentSubscriptionController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { index as subscriptionIndex } from '@/routes/admin/studentSubscriptions';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Subscriptions', href: '/admin/student-subscriptions' },
    { title: 'Edit Subscription', href: '' },
];

export default function Edit() {
    const { subscription, students, plans } = usePage().props as {
        subscription: any;
        students: Array<{ id: number; name: string }>;
        plans: Array<{ id: number; title: string }>;
    };

    const statusOptions = [
        { id: 'active', name: 'Active' },
        { id: 'expired', name: 'Expired' },
        { id: 'cancelled', name: 'Cancelled' },
    ];
    function formatDateOnly(dateString: string | null) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 10); // yyyy-mm-dd
    }
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Subscription" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Student Subscription</h1>

                    <Link href={subscriptionIndex().url}>
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form
                                {...StudentSubscriptionController.update.form({ student_subscription: subscription.id})}
                                disableWhileProcessing
                                className="flex flex-col gap-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid grid-cols-1 gap-6">

                                            {/* Student Select */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="student_id">Student *</Label>

                                                <Select name="student_id" defaultValue={String(subscription.student_id)}>
                                                    <SelectTrigger id="student_id">
                                                        <SelectValue placeholder="Select Student" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {students.map((s) => (
                                                            <SelectItem key={s.id} value={String(s.id)}>
                                                                {s.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <InputError message={errors.student_id} />
                                            </div>

                                            {/* Plan Select */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="plan_id">Plan *</Label>

                                                <Select name="plan_id" defaultValue={String(subscription.plan_id)}>
                                                    <SelectTrigger id="plan_id">
                                                        <SelectValue placeholder="Select Plan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {plans.map((p) => (
                                                            <SelectItem key={p.id} value={String(p.id)}>
                                                                {p.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <InputError message={errors.plan_id} />
                                            </div>

                                            {/* Start Date */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="start_at">Start Date *</Label>
                                                <Input
                                                    id="start_at"
                                                    name="start_at"
                                                    type="date"
                                                    defaultValue={formatDateOnly(subscription.start_at)}
                                                />
                                                <InputError message={errors.start_at} />
                                            </div>

                                            {/* End Date */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="end_at">End Date *</Label>
                                                <Input
                                                    id="end_at"
                                                    name="end_at"
                                                    type="date"
                                                    defaultValue={formatDateOnly(subscription.end_at)}
                                                />
                                                <InputError message={errors.end_at} />
                                            </div>

                                            {/* Status */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="status">Status *</Label>

                                                <Select name="status" defaultValue={subscription.status}>
                                                    <SelectTrigger id="status">
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

                                            {/* Auto Renew */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="auto_renew">Auto Renew {' '} {subscription.auto_renew ? "1" : "0"}</Label>

                                                <Select
                                                    name="auto_renew"
                                                    defaultValue={subscription.auto_renew ? "1" : "0"}
                                                >
                                                    <SelectTrigger id="auto_renew">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        <SelectItem value="1">Yes</SelectItem>
                                                        <SelectItem value="0">No</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <InputError message={errors.auto_renew} />
                                            </div>

                                            {/* Price Paid */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="price_paid">Price Paid</Label>
                                                <Input
                                                    id="price_paid"
                                                    type="number"
                                                    name="price_paid"
                                                    step="0.01"
                                                    min="0"
                                                    defaultValue={subscription.price_paid}
                                                />
                                                <InputError message={errors.price_paid} />
                                            </div>

                                            {/* PhonePe Order ID */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="phonepe_order_id">PhonePe Order ID</Label>
                                                <Input
                                                    id="phonepe_order_id"
                                                    name="phonepe_order_id"
                                                    defaultValue={subscription.phonepe_order_id}
                                                />
                                                <InputError message={errors.phonepe_order_id} />
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <div className="mt-6 text-center">
                                            <Button type="submit" className="mt-2 w-fit max-w-md">
                                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                Update Subscription
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

