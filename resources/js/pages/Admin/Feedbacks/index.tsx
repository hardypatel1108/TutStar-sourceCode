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
import { dashboard } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/feedbacks';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Feedbacks', href: index().url },
];

export default function Index() {
    const { feedbacks, filters, classes } = usePage().props as {
        feedbacks: any;
        filters: any;
        classes: { id: number; name: string }[];
    };

    // ─────────────────────────────────────────────
    // Local States Matching Controller Filters
    // ─────────────────────────────────────────────
    const [search, setSearch] = useState(filters.search || '');
    const [rating, setRating] = useState(filters.rating || '');
    const [forced, setForced] = useState(filters.forced ?? '');
    const [classId, setClassId] = useState(filters.class_id || '');
    const [city, setCity] = useState(filters.city || '');
    const [state, setState] = useState(filters.state || '');
    const [dob, setDob] = useState(filters.dob || '');
    const [status, setStatus] = useState(filters.status || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    const { delete: deleteFeedback, processing } = useForm();

    // ────────────────────────────────────────
    // Filter handler
    // ────────────────────────────────────────
    const applyFilters = () => {
        router.get(
            index().url,
            {
                search,
                rating,
                forced,
                class_id: classId,
                city,
                state,
                dob,
                status,
                from_date: fromDate,
                to_date: toDate,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleDelete = (id: number) => {
        deleteFeedback(destroy({ feedback: id }).url, { preserveScroll: true });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Feedbacks" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Feedbacks</h1>
                    <Link href={create().url}>
                        <Button>Add Feedback</Button>
                    </Link>
                </div>

                {/* ───────────────────────────────── FILTERS ───────────────────────────────── */}
                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine feedbacks list</p>

                    </div>
                    <div className="flex flex-wrap items-end gap-2">

                    {/* Search Student */}
                    <div className="flex min-w-64 flex-col gap-1">

                        <Input
                        title="Search by student name/email..." placeholder="Search by student name/email..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            applyFilters();
                        }}
                        className="w-64"
                    />
                    </div>

                    {/* Rating */}
                    <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">Rating</label><select title="Select"
                        value={rating}
                        onChange={(e) => {
                            setRating(e.target.value);
                            applyFilters();
                        }}
                        className="rounded-md border border-input bg-background p-2 text-sm"
                    >
                        <option value="">All Ratings</option>
                        <option value="1">1 Star</option>
                        <option value="2">2 Star</option>
                        <option value="3">3 Star</option>
                        <option value="4">4 Star</option>
                        <option value="5">5 Star</option>
                    </select></div>

                    {/* Forced By Admin */}
                    <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">Forced By Admin</label><select title="Select"
                        value={forced}
                        onChange={(e) => {
                            setForced(e.target.value);
                            applyFilters();
                        }}
                        className="rounded-md border border-input bg-background p-2 text-sm"
                    >
                        <option value="">Forced?</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select></div>

                    {/* Class */}
                    <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">Class</label><select title="Select"
                        value={classId}
                        onChange={(e) => {
                            setClassId(e.target.value);
                            applyFilters();
                        }}
                        className="rounded-md border border-input bg-background p-2 text-sm"
                    >
                        <option value="">All Classes</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select></div>

                    {/* City */}
                    <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">City</label><Input
                        title="City" placeholder="City"
                        value={city}
                        onChange={(e) => {
                            setCity(e.target.value);
                            applyFilters();
                        }}
                        className="w-40"
                    />
                    </div>

                    {/* State */}
                    <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">State</label><Input
                        title="State" placeholder="State"
                        value={state}
                        onChange={(e) => {
                            setState(e.target.value);
                            applyFilters();
                        }}
                        className="w-40"
                    />
                    </div>

                    {/* DOB */}
                    <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">DOB</label><Input
                        type="date"
                        value={dob}
                        onChange={(e) => {
                            setDob(e.target.value);
                            applyFilters();
                        }}
                        className="w-40"
                    />
                    </div>

                    {/* Student Status */}
                    <div className="flex min-w-44 flex-col gap-1"><label className="text-sm font-medium">Student Status</label><select title="Select"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            applyFilters();
                        }}
                        className="rounded-md border border-input bg-background p-2 text-sm"
                    >
                        <option value="">All Student Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select></div>

                    {/* From Date */}
                    <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">From Date</label><Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => {
                            setFromDate(e.target.value);
                            applyFilters();
                        }}
                        className="w-40"
                    />
                    </div>

                    {/* To Date */}
                    <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">To Date</label><Input
                        type="date"
                        value={toDate}
                        onChange={(e) => {
                            setToDate(e.target.value);
                            applyFilters();
                        }}
                        className="w-40"
                    />
                    </div>
                    </div>
                    <div className="mt-3">
                        <Button type="button" variant="outline" onClick={() => router.get(index().url)}>
                            Clear Filters
                        </Button>
                    </div>
                </div>

                {/* ───────────────────────────────── TABLE ───────────────────────────────── */}
                <Card className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Forced</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {feedbacks.data.length > 0 ? (
                                feedbacks.data.map((item: any, index: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {(feedbacks.current_page - 1) * feedbacks.per_page + (index + 1)}
                                        </TableCell>

                                        <TableCell>{item.student?.user?.name || '—'}</TableCell>

                                        <TableCell>{item.rating}</TableCell>

                                        <TableCell>
                                            {item.forced_by_admin ? (
                                                <Badge variant="destructive">Yes</Badge>
                                            ) : (
                                                <Badge> No </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell>{item.created_at}</TableCell>

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
                                                        <Link href={edit({ feedback: item.id }).url}>Edit</Link>
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
                                                                <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(item.id)}
                                                                    disabled={processing}
                                                                    className="bg-red-600 text-white hover:bg-red-700"
                                                                >
                                                                    {processing ? 'Deleting...' : 'Confirm'}
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
                                    <TableCell colSpan={6} className="py-4 text-center text-muted-foreground">
                                        No feedbacks found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {feedbacks.total > feedbacks.per_page && (
                        <div className="flex justify-end space-x-2 p-4">
                            {feedbacks.links.map((link: any, idx: number) =>
                                link.url ? (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
                                        onClick={() => router.visit(link.url, { preserveScroll: true })}
                                        size="sm"
                                    >
                                        {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                    </Button>
                                ) : null,
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}



