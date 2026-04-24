import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { dashboard as dashboardindex } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/checkoutOffers';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

interface OfferItem {
    id: number;
    title: string;
    type: string;
    value: number;
    starts_at_formatted: string | null;
    ends_at_formatted: string | null;
    active: boolean;
}

interface CheckoutPlanGroup {
    checkout_plan_id: number;
    checkout_plan_title: string | null;
    checkout_plan_months: number | null;
    offers: OfferItem[];
}

interface OfferGroup {
    plan_id: number;
    base_plan_title: string | null;
    months: number[];
    checkout_plans: CheckoutPlanGroup[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboardindex().url },
    { title: 'Checkout Offers', href: index().url },
];

export default function Index() {
    const { offers, filters } = usePage().props as {
        offers: OfferGroup[];
        filters: any;
    };

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [type, setType] = useState(filters.type || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const { delete: deleteOffer, processing } = useForm();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<OfferGroup | null>(null);
    const [activePlanId, setActivePlanId] = useState<number | null>(null);

    const handleFilterChange = (filterKey: string, value: string) => {
        const params: any = {
            search,
            status,
            type,
            start_date: startDate,
            end_date: endDate,
        };
        params[filterKey] = value;
        router.get(index().url, params, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        deleteOffer(destroy({ checkout_offer: id }).url, { preserveScroll: true });
    };

    const formatCurrency = (amount: number | string) => {
        const value = Number(amount ?? 0);
        return `INR ${value.toLocaleString('en-IN')}`;
    };

    const formatOfferValue = (offer: OfferItem) => {
        const typeValue = String(offer.type || '').toLowerCase();
        if (typeValue === 'percentage') {
            return `${offer.value}%`;
        }
        return formatCurrency(offer.value);
    };

    const openDetails = (group: OfferGroup) => {
        setSelectedGroup(group);
        const firstPlanId = group.checkout_plans?.[0]?.checkout_plan_id ?? null;
        setActivePlanId(firstPlanId);
        setDialogOpen(true);
    };

    const activePlan = useMemo(
        () => selectedGroup?.checkout_plans?.find((plan) => plan.checkout_plan_id === activePlanId) ?? null,
        [selectedGroup, activePlanId],
    );

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Checkout Offers" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Checkout Offers</h1>
                    <Link href={create().url}>
                        <Button>Add Offer</Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine checkout offers</p>
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                        <div className="flex min-w-64 flex-col gap-1">
                            <Input
                                title="Search" placeholder="Search"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    handleFilterChange('search', e.target.value);
                                }}
                                className="w-64"
                            />
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">
                            <select title="Select"
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    handleFilterChange('status', e.target.value);
                                }}
                                className="rounded-md border border-input bg-background p-2 text-sm"
                            >
                                <option value="all">Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">
                            <select title="Select"
                                value={type}
                                onChange={(e) => {
                                    setType(e.target.value);
                                    handleFilterChange('type', e.target.value);
                                }}
                                className="rounded-md border border-input bg-background p-2 text-sm"
                            >
                                <option value="all">Type</option>
                                <option value="percentage">Percentage</option>
                                <option value="flat">Flat</option>
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">
                            <Input
                                type="date"
                                title="Start Date" placeholder="Start Date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    handleFilterChange('start_date', e.target.value);
                                }}
                                className="w-40"
                            />
                        </div>
                        <div className="flex min-w-40 flex-col gap-1">
                            <Input
                                type="date"
                                title="End Date" placeholder="End Date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    handleFilterChange('end_date', e.target.value);
                                }}
                                className="w-40"
                            />
                        </div>
                        <div className="mt-3">
                            <Button type="button" variant="outline" onClick={() => router.get(index().url)}>
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <Card className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Base Plan</TableHead>
                                <TableHead>Months</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {offers.length > 0 ? (
                                offers.map((group, index) => {
                                    const monthsSummary = group.months?.length ? group.months.join(' / ') : '-';

                                    return (
                                        <TableRow key={group.plan_id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{group.base_plan_title || '-'}</TableCell>
                                            <TableCell>{monthsSummary}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => openDetails(group)}>View Offers</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-4 text-center text-muted-foreground">
                                        No offers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[92vh] w-[96vw] max-w-6xl overflow-hidden p-0">
                    <div className="border-b bg-muted/20 px-6 py-5">
                        <DialogTitle className="text-lg font-semibold">
                            {selectedGroup?.base_plan_title || 'Checkout Offers'}
                        </DialogTitle>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>Months: {selectedGroup?.months?.length ? selectedGroup.months.join(' / ') : '-'}</span>
                            <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/60 md:inline-block" />
                            <span>Total Plans: {selectedGroup?.checkout_plans?.length ?? 0}</span>
                        </div>
                    </div>

                    {selectedGroup && (
                        <div className="flex max-h-[calc(92vh-90px)] flex-1 flex-col overflow-hidden">
                            {/* Top Tabs */}
                            <div className="border-b px-6 py-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Select Month
                                </p>
                                <div className="flex gap-2 overflow-x-auto">
                                    {selectedGroup.checkout_plans.map((plan) => (
                                        <button
                                            key={plan.checkout_plan_id}
                                            type="button"
                                            onClick={() => setActivePlanId(plan.checkout_plan_id)}
                                            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                                                activePlanId === plan.checkout_plan_id
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-muted bg-background text-muted-foreground hover:bg-muted/30'
                                            }`}
                                        >
                                            {plan.checkout_plan_months ?? '-'} Month
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-5">
                                {activePlan ? (
                                    <>
                                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/10 px-4 py-3">
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {activePlan.checkout_plan_title || 'Checkout Plan'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Months: {activePlan.checkout_plan_months ?? '-'}
                                                </p>
                                            </div>
                                            <Badge variant="secondary" className="px-2 py-1 text-xs">
                                                {activePlan.offers.length} Offer{activePlan.offers.length === 1 ? '' : 's'}
                                            </Badge>
                                        </div>

                                        <div className="grid gap-4">
                                            {activePlan.offers.map((offer) => (
                                                <div key={offer.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-base font-semibold">{offer.title}</p>
                                                            <p className="text-xs text-muted-foreground capitalize">{offer.type}</p>
                                                        </div>
                                                        <Badge
                                                            variant={offer.active ? 'default' : 'destructive'}
                                                            className={offer.active ? 'bg-emerald-600 text-white hover:bg-emerald-600' : undefined}
                                                        >
                                                            {offer.active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>

                                                    <div className="mt-4 grid gap-3 rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground sm:grid-cols-3">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Amount</p>
                                                            <p className="mt-1 font-medium text-foreground">{formatOfferValue(offer)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Starts</p>
                                                            <p className="mt-1">{offer.starts_at_formatted || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ends</p>
                                                            <p className="mt-1">{offer.ends_at_formatted || '-'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-end gap-2">
                                                        <Link href={edit({ checkout_offer: offer.id }).url}>
                                                            <Button size="sm" variant="outline">
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button size="sm" variant="destructive" disabled={processing}>
                                                                    Delete
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Offer</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete this offer? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(offer.id)}
                                                                        disabled={processing}
                                                                        className="bg-red-600 text-white hover:bg-red-700"
                                                                    >
                                                                        {processing ? 'Deleting...' : 'Confirm'}
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                                        Select a month to view offers.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}


