import CheckoutOfferController from '@/actions/App/Http/Controllers/Admin/CheckoutOfferController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { index as offersIndex } from '@/routes/admin/checkoutOffers';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Checkout Offers', href: '/admin/checkout-offers' },
    { title: 'Edit Offer', href: '/admin/checkout-offers/edit' },
];

export default function Edit() {
    const { offer } = usePage().props as {
        offer: {
            id: number;
            title: string;
            type: string;
            value: number;
            starts_at: string | null;
            ends_at: string | null;
            active: boolean;
        };
    };
    function formatDateTimeLocal(dateString: string | null) {
        if (!dateString) return '';
        return dateString.replace(' ', 'T').slice(0, 16);
    }

    const statusOptions = [
        { id: '1', name: 'Active' },
        { id: '0', name: 'Inactive' },
    ];
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Checkout Offer" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Offer</h1>

                    <Link href={offersIndex().url}>
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form
                                {...CheckoutOfferController.update.form({ checkout_offer: offer.id })}
                                disableWhileProcessing
                                defaults={offer}
                                className="flex flex-col gap-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid grid-cols-1 gap-6">
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
                                                <Input name="starts_at" type="datetime-local" defaultValue={formatDateTimeLocal(offer.starts_at)} />
                                                <InputError message={errors.starts_at} />
                                            </div>

                                            {/* Ends At */}
                                            <div className="grid gap-2">
                                                <Label>Ends At</Label>
                                                <Input name="ends_at" type="datetime-local" defaultValue={formatDateTimeLocal(offer.ends_at)} />
                                                <InputError message={errors.ends_at} />
                                            </div>

                                            {/* Active */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="active">Active?</Label>

                                                <Select name="active" defaultValue={offer.active ? "1" : "0"}>
                                                    <SelectTrigger id="active">
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map((s) => (
                                                            <SelectItem
                                                                key={s.id}
                                                                value={s.id} // send "active" or "inactive"
                                                            >
                                                                {s.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <InputError message={errors.active} />
                                            </div>
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

