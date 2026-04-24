import PaymentController from '@/actions/App/Http/Controllers/Admin/PaymentController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { index as paymentsIndex } from '@/routes/admin/payments';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Payments', href: '/admin/payments' },
    { title: 'Edit Payment', href: '#' },
];

export default function Edit() {
    const { payment, students, checkoutPlans } = usePage().props as {
        payment: {
            id: number;
            student_id: number;
            checkout_plan_id: number | null;
            amount: number;
            gateway: string;
            gateway_txn_id: string | null;
            gateway_verified: boolean;
            status: string;
            note: string | null;
        };
        students: { id: number; name: string }[];
        checkoutPlans: { id: number; label: string }[];
    };

    const gatewayOptions = [
        { id: 'phonepe', name: 'PhonePe' },
        { id: 'manual', name: 'Manual' },
    ];

    const statusOptions = [
        { id: 'pending', name: 'Pending' },
        { id: 'completed', name: 'Completed' },
        { id: 'failed', name: 'Failed' },
        { id: 'refunded', name: 'Refunded' },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Payment" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Payment</h1>

                    <Link href={paymentsIndex().url}>
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form
                                {...PaymentController.update.form(payment.id)}
                                defaults={payment}
                                disableWhileProcessing
                                className="flex flex-col gap-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Student */}
                                            <div className="grid gap-2">
                                                <Label>Student *</Label>
                                                <Select name="student_id" defaultValue={String(payment.student_id)}>
                                                    <SelectTrigger>
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

                                            {/* Checkout Plan */}
                                            <div className="grid gap-2">
                                                <Label>Checkout Plan</Label>
                                                <Select
                                                    name="checkout_plan_id"
                                                    defaultValue={payment.checkout_plan_id ? String(payment.checkout_plan_id) : undefined}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Optional" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {checkoutPlans.map((cp) => (
                                                            <SelectItem key={cp.id} value={String(cp.id)}>
                                                                {cp.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.checkout_plan_id} />
                                            </div>

                                            {/* Amount */}
                                            <div className="grid gap-2">
                                                <Label>Amount *</Label>
                                                <Input name="amount" type="number" step="0.01" defaultValue={String(payment.amount ?? '')} />
                                                <InputError message={errors.amount} />
                                            </div>

                                            {/* Gateway */}
                                            <div className="grid gap-2">
                                                <Label>Payment Gateway *</Label>
                                                <Select name="gateway" defaultValue={payment.gateway}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Gateway" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {gatewayOptions.map((g) => (
                                                            <SelectItem key={g.id} value={g.id}>
                                                                {g.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.gateway} />
                                            </div>

                                            {/* Gateway TXN */}
                                            <div className="grid gap-2">
                                                <Label>Gateway Transaction ID</Label>
                                                <Input name="gateway_txn_id" defaultValue={payment.gateway_txn_id ?? ''} />
                                                <InputError message={errors.gateway_txn_id} />
                                            </div>

                                            {/* Gateway Verified */}
                                            <div className="grid gap-2">
                                                <Label>Gateway Verified</Label>
                                                <Select name="gateway_verified" defaultValue={payment.gateway_verified ? '1' : '0'}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select verification" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">Yes</SelectItem>
                                                        <SelectItem value="0">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.gateway_verified} />
                                            </div>

                                            {/* Status */}
                                            <div className="grid gap-2">
                                                <Label>Status *</Label>
                                                <Select name="status" defaultValue={payment.status}>
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

                                            {/* Note */}
                                            <div className="grid gap-2">
                                                <Label>Note</Label>
                                                <Input name="note" defaultValue={payment.note ?? ''} />
                                                <InputError message={errors.note} />
                                            </div>
                                        </div>

                                        <div className="mt-6 text-center">
                                            <Button type="submit">
                                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                                Update Payment
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

