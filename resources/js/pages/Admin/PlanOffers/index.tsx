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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminLayout from "@/layouts/admin-layout";
import { dashboard } from "@/routes/admin";
import { create, destroy, edit, index } from "@/routes/admin/planOffers";
import { type BreadcrumbItem } from "@/types";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";

interface PlanOffer {
    id: number;
    title: string;
    type: string;
    value: number;
    active: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
    starts_at_formatted?: string | null;
    ends_at_formatted?: string | null;
    is_currently_active?: boolean;
}

interface PlanOfferGroup {
    id: number;
    title: string;
    type: string;
    offers: PlanOffer[];
    active_offer?: PlanOffer | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: dashboard().url },
    { title: "Plan Offers", href: index().url },
];

export default function Index() {
    const { planOffers, filters, plans, offerTypes, planTypes } = usePage().props as {
        planOffers: any;
        filters: any;
        plans: { id: number; title: string }[];
        offerTypes: string[];
        planTypes: any[];
    };

    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "");
    const [planId, setPlanId] = useState(filters.plan || "");
    const [type, setType] = useState(filters.type || "");
    const [minValue, setMinValue] = useState(filters.min_value || "");
    const [maxValue, setMaxValue] = useState(filters.max_value || "");
    const [startsFrom, setStartsFrom] = useState(filters.starts_from || "");
    const [startsTo, setStartsTo] = useState(filters.starts_to || "");
    const [endsFrom, setEndsFrom] = useState(filters.ends_from || "");
    const [endsTo, setEndsTo] = useState(filters.ends_to || "");

    const { delete: deleteOffer, processing } = useForm();

    const handleFilterChange = (field: string, value: string) => {
        const params = {
            search,
            status,
            plan: planId,
            type,
            min_value: minValue,
            max_value: maxValue,
            starts_from: startsFrom,
            starts_to: startsTo,
            ends_from: endsFrom,
            ends_to: endsTo,
        };

        params[field] = value;

        router.get(index().url, params, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleDelete = (id: number) => {
        deleteOffer(destroy({ plan_offer: id }).url, { preserveScroll: true });
    };

    const formatCurrency = (amount: number | string) => {
        const value = Number(amount ?? 0);
        return `₹${value.toLocaleString("en-IN")}`;
    };

    const formatOfferValue = (offer: PlanOffer) => {
        const type = String(offer.type || "").toLowerCase();
        if (type === "percentage") {
            return `${offer.value}%`;
        }
        return formatCurrency(offer.value);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Plan Offers" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Plan Offers</h1>
                    <Link href={create().url}>
                        <Button>Add Offer</Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine plan offers list</p>

                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                    <div className="flex min-w-64 flex-col gap-1">
                        <Input
                        title="Search" placeholder="Search"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            handleFilterChange("search", e.target.value);
                        }}
                        className="w-64"
                    />
                    </div>

                    <div className="flex min-w-40 flex-col gap-1"><select title="Select"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            handleFilterChange("status", e.target.value);
                        }}
                        className="rounded-md border p-2 text-sm"
                    >
                        <option value="">Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select></div>

                    <div className="flex min-w-40 flex-col gap-1"><select title="Select"
                        value={planId}
                        onChange={(e) => {
                            setPlanId(e.target.value);
                            handleFilterChange("plan", e.target.value);
                        }}
                        className="rounded-md border p-2 text-sm"
                    >
                        <option value="">Plan</option>
                        {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.title}
                            </option>
                        ))}
                    </select></div>

                    <div className="flex min-w-40 flex-col gap-1"><select title="Select"
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value);
                            handleFilterChange("type", e.target.value);
                        }}
                        className="rounded-md border p-2 text-sm"
                    >
                        <option value="">Offer Type</option>
                        {offerTypes.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select></div>

                    {/* Value Range */}
                    <div className="flex min-w-32 flex-col gap-1"><Input
                        title="Min Value" placeholder="Min Value"
                        type="number"
                        value={minValue}
                        onChange={(e) => {
                            setMinValue(e.target.value);
                            handleFilterChange("min_value", e.target.value);
                        }}
                        className="w-32"
                    /></div>
                    <div className="flex min-w-32 flex-col gap-1"><Input
                        title="Max Value" placeholder="Max Value"
                        type="number"
                        value={maxValue}
                        onChange={(e) => {
                            setMaxValue(e.target.value);
                            handleFilterChange("max_value", e.target.value);
                        }}
                        className="w-32"
                    /></div>

                    {/* Date Filters */}
                    <div className="flex min-w-40 flex-col gap-1"><Input
                        type="date"
                        title="Starts From" placeholder="Starts From"
                        value={startsFrom}
                        onChange={(e) => {
                            setStartsFrom(e.target.value);
                            handleFilterChange("starts_from", e.target.value);
                        }}
                    /></div>
                    <div className="flex min-w-40 flex-col gap-1"><Input
                        type="date"
                        title="Starts To" placeholder="Starts To"
                        value={startsTo}
                        onChange={(e) => {
                            setStartsTo(e.target.value);
                            handleFilterChange("starts_to", e.target.value);
                        }}
                    /></div>

                    <div className="flex min-w-40 flex-col gap-1"><Input
                        type="date"
                        title="Ends From" placeholder="Ends From"
                        value={endsFrom}
                        onChange={(e) => {
                            setEndsFrom(e.target.value);
                            handleFilterChange("ends_from", e.target.value);
                        }}
                    /></div>
                    <div className="flex min-w-40 flex-col gap-1"><Input
                        type="date"
                        title="Ends To" placeholder="Ends To"
                        value={endsTo}
                        onChange={(e) => {
                            setEndsTo(e.target.value);
                            handleFilterChange("ends_to", e.target.value);
                        }}
                    /></div>
                    <div className="mt-3">
                        <Button type="button" variant="outline" onClick={() => router.get(index().url)}>
                            Clear Filters
                        </Button>
                    </div>
                    </div>
                </div>

                {/* Listing */}
                <Card className="p-4">
                    {planOffers.data.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Offers</TableHead>
                                    <TableHead>Active Offer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Active Period</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {planOffers.data.map((plan: PlanOfferGroup) => {
                                    const offersLabel = plan.offers.map((o) => o.title).join(" / ");
                                    const activeOffer = plan.active_offer;
                                    const statusLabel = activeOffer?.is_currently_active ? "Active" : activeOffer?.active ? "Active" : "Inactive";
                                    const statusVariant = statusLabel === "Active" ? "default" : "destructive";
                                    return (
                                        <TableRow key={plan.id}>
                                            <TableCell className="font-medium whitespace-normal">{plan.title}</TableCell>
                                            <TableCell className="whitespace-normal">{offersLabel || "—"}</TableCell>
                                            <TableCell className="whitespace-normal">
                                                {activeOffer ? (
                                                    <>
                                                        <div className="font-medium">{activeOffer.title}</div>
                                                        <div className="text-xs text-muted-foreground">{formatOfferValue(activeOffer)}</div>
                                                    </>
                                                ) : (
                                                    "—"
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={statusVariant}
                                                    className={statusLabel === "Active" ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined}
                                                >
                                                    {statusLabel}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-normal">
                                                {activeOffer ? (
                                                    <span>
                                                        {activeOffer.starts_at_formatted || "—"} to {activeOffer.ends_at_formatted || "—"}
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline">View Offers</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-3xl">
                                                        <DialogHeader>
                                                            <DialogTitle>{plan.title}</DialogTitle>
                                                            <DialogDescription>All offers for this plan</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-3">
                                                            {plan.offers.length > 0 ? (
                                                                plan.offers.map((offer) => (
                                                                    <div key={offer.id} className="rounded-xl border bg-card p-4">
                                                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                                                            <div>
                                                                                <p className="text-sm font-semibold">{offer.title}</p>
                                                                                <p className="text-xs text-muted-foreground capitalize">{offer.type}</p>
                                                                            </div>
                                                                            <Badge
                                                                                variant={offer.active ? "default" : "destructive"}
                                                                                className={offer.active ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined}
                                                                            >
                                                                                {offer.active ? "Active" : "Inactive"}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                                                                            <div className="flex items-center justify-between">
                                                                                <span>Value</span>
                                                                                <span className="font-medium text-foreground">{formatOfferValue(offer)}</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between">
                                                                                <span>Starts</span>
                                                                                <span>{offer.starts_at_formatted || "—"}</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between">
                                                                                <span>Ends</span>
                                                                                <span>{offer.ends_at_formatted || "—"}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-3 flex items-center justify-end gap-2">
                                                                            <Link href={edit({ plan_offer: offer.id }).url}>
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
                                                                                            {processing ? "Deleting..." : "Confirm"}
                                                                                        </AlertDialogAction>
                                                                                    </AlertDialogFooter>
                                                                                </AlertDialogContent>
                                                                            </AlertDialog>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="text-sm text-muted-foreground">No offers found.</div>
                                                            )}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground">No plan offers found.</div>
                    )}

                    {/* Pagination */}
                    {planOffers.total > planOffers.per_page && (
                        <div className="flex justify-end space-x-2 pt-4">
                            {planOffers.links.map((link: any, idx: number) =>
                                link.url ? (
                                    <Button
                                        key={idx}
                                        variant={link.active ? "default" : "outline"}
                                        onClick={() =>
                                            router.visit(link.url, {
                                                preserveScroll: true,
                                            })
                                        }
                                        size="sm"
                                    >
                                        {link.label
                                            .replace("&laquo;", "«")
                                            .replace("&raquo;", "»")}
                                    </Button>
                                ) : null
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}



