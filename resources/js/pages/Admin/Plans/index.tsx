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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AdminLayout from "@/layouts/admin-layout";
import { dashboard } from "@/routes/admin";
import { create, destroy, edit, index } from "@/routes/admin/plans";
import { type BreadcrumbItem } from "@/types";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface Plan {
    id: number;
    title: string;
    price: number;
    duration_days: number;
    ongoing_batches: number;
    type: string;
    status: string;
    board?: { name: string };
    clazz?: { name: string };
    subjects?: { name: string }[];
    offers?: { id: number }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: dashboard().url },
    { title: "Plans", href: index().url },
];

export default function Index() {
    const { plans, filters, boards, classes, subjects } = usePage().props as {
        plans: any;
        filters: any;
        boards: { id: number; name: string }[];
        classes: { id: number; name: string }[];
        subjects: { id: number; name: string }[];
    };

    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "");
    const [type, setType] = useState(filters.type || "");
    const [boardId, setBoardId] = useState(filters.board || "");
    const [classId, setClassId] = useState(filters.class || "");
    const [subjectId, setSubjectId] = useState(filters.subject || "");
    const [minPrice, setMinPrice] = useState(filters.min_price || "");
    const [maxPrice, setMaxPrice] = useState(filters.max_price || "");
    const [minDuration, setMinDuration] = useState(filters.min_duration || "");
    const [maxDuration, setMaxDuration] = useState(filters.max_duration || "");
    const [hasOffer, setHasOffer] = useState(filters.has_offer || "");

    const { delete: deletePlan, processing } = useForm();

    const handleFilterChange = (key: string, value: any) => {
        const params = {
            search,
            status,
            type,
            board: boardId,
            class: classId,
            subject: subjectId,
            min_price: minPrice,
            max_price: maxPrice,
            min_duration: minDuration,
            max_duration: maxDuration,
            has_offer: hasOffer,
        };

        params[key] = value;

        router.get(index().url, params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number) => {
        deletePlan(destroy({ plan: id }).url, { preserveScroll: true });
    };

    const formatCurrency = (amount: number | string) => {
        const value = Number(amount ?? 0);
        return `₹${value.toLocaleString("en-IN")}`;
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Plans" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
                    <Link href={create().url}>
                        <Button>Add Plan</Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine plans list</p>

                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                    <div className="flex min-w-64 flex-col gap-1">

                        <Input
                            title="Search by title or description..." placeholder="Search by title or description..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                handleFilterChange("search", e.target.value);
                            }}
                            className="w-64"
                        />
                    </div>

                    {/* Status */}
                    <div className="flex min-w-40 flex-col gap-1">

                        <select title="Select"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                handleFilterChange("status", e.target.value);
                            }}
                            className="rounded-md border border-input bg-background p-2 text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Type */}
                    <div className="flex min-w-40 flex-col gap-1">

                        <select title="Select"
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value);
                                handleFilterChange("type", e.target.value);
                            }}
                            className="rounded-md border border-input bg-background p-2 text-sm"
                        >
                            <option value="">All Types</option>
                            <option value="single">Single</option>
                            <option value="combo">Combo</option>
                        </select>
                    </div>

                    {/* Board */}
                    <div className="flex min-w-40 flex-col gap-1">

                        <select title="Select"
                            value={boardId}
                            onChange={(e) => {
                                setBoardId(e.target.value);
                                handleFilterChange("board", e.target.value);
                            }}
                            className="rounded-md border border-input bg-background p-2 text-sm"
                        >
                            <option value="">All Boards</option>
                            {boards.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Class */}
                    <div className="flex min-w-40 flex-col gap-1">

                        <select title="Select"
                            value={classId}
                            onChange={(e) => {
                                setClassId(e.target.value);
                                handleFilterChange("class", e.target.value);
                            }}
                            className="rounded-md border border-input bg-background p-2 text-sm"
                        >
                            <option value="">All Classes</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Subject */}
                    <div className="flex min-w-40 flex-col gap-1">

                        <select title="Select"
                            value={subjectId}
                            onChange={(e) => {
                                setSubjectId(e.target.value);
                                handleFilterChange("subject", e.target.value);
                            }}
                            className="rounded-md border border-input bg-background p-2 text-sm"
                        >
                            <option value="">All Subjects</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="flex min-w-32 flex-col gap-1">

                        <Input
                            className="w-32"
                            type="number"
                            title="Min Price" placeholder="Min Price"
                            value={minPrice}
                            onChange={(e) => {
                                setMinPrice(e.target.value);
                                handleFilterChange("min_price", e.target.value);
                            }}
                        />
                    </div>
                    <div className="flex min-w-32 flex-col gap-1">

                        <Input
                            className="w-32"
                            type="number"
                            title="Max Price" placeholder="Max Price"
                            value={maxPrice}
                            onChange={(e) => {
                                setMaxPrice(e.target.value);
                                handleFilterChange("max_price", e.target.value);
                            }}
                        />
                    </div>

                    {/* Duration Range */}
                    <div className="flex min-w-32 flex-col gap-1">

                        <Input
                            className="w-32"
                            type="number"
                            title="Min Days" placeholder="Min Days"
                            value={minDuration}
                            onChange={(e) => {
                                setMinDuration(e.target.value);
                                handleFilterChange("min_duration", e.target.value);
                            }}
                        />
                    </div>
                    <div className="flex min-w-32 flex-col gap-1">

                        <Input
                            className="w-32"
                            type="number"
                            title="Max Days" placeholder="Max Days"
                            value={maxDuration}
                            onChange={(e) => {
                                setMaxDuration(e.target.value);
                                handleFilterChange("max_duration", e.target.value);
                            }}
                        />
                    </div>

                    {/* Has Offer */}
                    <div className="flex min-w-44 flex-col gap-1">

                        <select title="Select"
                            value={hasOffer}
                            onChange={(e) => {
                                setHasOffer(e.target.value);
                                handleFilterChange("has_offer", e.target.value);
                            }}
                            className="rounded-md border border-input bg-background p-2 text-sm"
                        >
                            <option value="">Offers?</option>
                            <option value="1">Has Active Offer</option>
                            <option value="0">No Offer</option>
                        </select>
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
                                <TableHead>Title</TableHead>
                                <TableHead>Board</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Subjects</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Ongoing Batches</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Offers</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {plans.data.length > 0 ? (
                                plans.data.map((plan: Plan, index: number) => (
                                    <TableRow key={plan.id}>
                                        <TableCell>
                                            {(plans.current_page - 1) * plans.per_page + (index + 1)}
                                        </TableCell>
                                        <TableCell className="font-medium">{plan.title}</TableCell>
                                        <TableCell>{plan.board?.name || "—"}</TableCell>
                                        <TableCell>{plan.clazz?.name || "—"}</TableCell>
                                        <TableCell>
                                            {plan.subjects?.map((s) => s.name).join(", ") || "—"}
                                        </TableCell>
                                        <TableCell>{formatCurrency(plan.price)}</TableCell>
                                        <TableCell>{plan.duration_days} days</TableCell>
                                        <TableCell>{plan.ongoing_batches ?? 0}</TableCell>
                                        <TableCell>{plan.type}</TableCell>
                                        <TableCell>
                                            <Badge variant={plan.offers?.length ? "success" : "outline"}>
                                                {plan.offers?.length ? "Yes" : "No"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={plan.status === "active" ? "success" : "destructive"}>
                                                {plan.status}
                                            </Badge>
                                        </TableCell>

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

                                                    <DropdownMenuItem asChild>
                                                        <Link href={edit({ plan: plan.id }).url}>Edit</Link>
                                                    </DropdownMenuItem>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600"
                                                                onSelect={(e) => e.preventDefault()}
                                                            >
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>

                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>

                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>

                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(plan.id)}
                                                                    disabled={processing}
                                                                    className="bg-red-600 text-white hover:bg-red-700"
                                                                >
                                                                    {processing ? "Deleting..." : "Confirm"}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={12} className="py-4 text-center text-muted-foreground">
                                        No plans found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {plans.total > plans.per_page && (
                        <div className="flex justify-end space-x-2 p-4">
                            {plans.links.map((link: any, idx: number) =>
                                link.url ? (
                                    <Button
                                        key={idx}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => router.visit(link.url, { preserveScroll: true })}
                                    >
                                        {link.label.replace("&laquo;", "«").replace("&raquo;", "»")}
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




