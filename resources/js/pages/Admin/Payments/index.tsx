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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { dashboard } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/payments';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Payments', href: index().url },
];

export default function PaymentsIndex() {
    const { payments, filters, paymentStats, classes = [], subjects = [], plans = [] } = usePage().props as {
        payments: any;
        filters: any;
        paymentStats: {
            confirmed_total: number;
            confirmed_last_30_days: number;
            confirmed_last_7_days: number;
            confirmed_filtered_total: number;
        };
        classes: Array<{ id: number; name: string }>;
        subjects: Array<{ id: number; name: string }>;
        plans: Array<{ id: number; title: string }>;
    };
    console.log(payments);
    // Local state (matching your filters from controller)
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [gateway, setGateway] = useState(filters.gateway || '');
    const [student, setStudent] = useState(filters.student || '');
    const [plan, setPlan] = useState(filters.plan || '');
    const [classId, setClassId] = useState(filters.class_id || '');
    const [subjectId, setSubjectId] = useState(filters.subject_id || '');
    const [month, setMonth] = useState(filters.month || '');
    const [createdBy, setCreatedBy] = useState(filters.created_by || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState('');

    const { delete: deletePayment, processing } = useForm();

    const handleFilterChange = (field: string, value: string) => {
        const params = {
            search,
            status,
            gateway,
            student,
            plan,
            class_id: classId,
            subject_id: subjectId,
            month,
            created_by: createdBy,
            from_date: fromDate,
            to_date: toDate,
        };

        params[field] = value;

        router.get(index().url, params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number) => {
        deletePayment(destroy({ payment: id }).url, { preserveScroll: true });
    };

    const truncateNote = (value: string) => {
        if (!value) return '-';
        return value.length > 20 ? `${value.slice(0, 20)}...` : value;
    };

    const formatAmount = (amount: number | string) => {
        const value = Number(amount ?? 0);
        return `INR ${value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
                    <Link href={create().url}>
                        <Button>Add Payment</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <Card className="p-4">
                        <div className="text-xs text-muted-foreground">Confirmed Received (All Time)</div>
                        <div className="mt-1 text-xl font-semibold">{formatAmount(paymentStats?.confirmed_total ?? 0)}</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-xs text-muted-foreground">Confirmed Received (Last 30 Days)</div>
                        <div className="mt-1 text-xl font-semibold">{formatAmount(paymentStats?.confirmed_last_30_days ?? 0)}</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-xs text-muted-foreground">Confirmed Received (Last 7 Days)</div>
                        <div className="mt-1 text-xl font-semibold">{formatAmount(paymentStats?.confirmed_last_7_days ?? 0)}</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-xs text-muted-foreground">Confirmed Received (Filtered)</div>
                        <div className="mt-1 text-xl font-semibold">{formatAmount(paymentStats?.confirmed_filtered_total ?? 0)}</div>
                    </Card>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine payments list</p>

                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                    {/* Search */}
                        <div className="flex min-w-64 flex-col gap-1">

                            <Input
                        title="Search by student name, U.Id, txn ID or note" placeholder="Search by student name, U.Id, txn ID or note"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            handleFilterChange('search', e.target.value);
                        }}
                        className="w-64"
                    />
                        </div>

                    {/* Status */}
                        <div className="flex min-w-40 flex-col gap-1"><select title="Select"
                        className="rounded-md border p-2 text-sm"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            handleFilterChange('status', e.target.value);
                        }}
                    >
                        <option value="">Status</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                        </select></div>

                    {/* Gateway */}
                        <div className="flex min-w-40 flex-col gap-1"><select title="Select"
                        className="rounded-md border p-2 text-sm"
                        value={gateway}
                        onChange={(e) => {
                            setGateway(e.target.value);
                            handleFilterChange('gateway', e.target.value);
                        }}
                    >
                        <option value="">Gateway</option>
                        <option value="phonepe">PhonePe</option>
                        <option value="manual">Manual</option>
                        </select></div>

                    {/* Student */}
                        <div className="flex min-w-48 flex-col gap-1">

                            <Input
                        title="Student name" placeholder="Student name"
                        value={student}
                        onChange={(e) => {
                            setStudent(e.target.value);
                            handleFilterChange('student', e.target.value);
                        }}
                        className="w-48"
                    />
                        </div>

                    <div className="flex min-w-40 flex-col gap-1">

                        <Input
                            type="month"
                            title="Month" placeholder="Month"
                            value={month}
                            onChange={(e) => {
                                setMonth(e.target.value);
                                handleFilterChange('month', e.target.value);
                            }}
                        />
                    </div>

                    <div className="flex min-w-40 flex-col gap-1">

                        <select title="Select"
                            className="rounded-md border p-2 text-sm"
                            value={classId}
                            onChange={(e) => {
                                setClassId(e.target.value);
                                handleFilterChange('class_id', e.target.value);
                            }}
                        >
                            <option value="">Class</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex min-w-40 flex-col gap-1">

                        <select title="Select"
                            className="rounded-md border p-2 text-sm"
                            value={subjectId}
                            onChange={(e) => {
                                setSubjectId(e.target.value);
                                handleFilterChange('subject_id', e.target.value);
                            }}
                        >
                            <option value="">Subject</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Plan */}
                    <div className="flex min-w-40 flex-col gap-1">

                        <select title="Select"
                            className="rounded-md border p-2 text-sm"
                            value={plan}
                            onChange={(e) => {
                                setPlan(e.target.value);
                                handleFilterChange('plan', e.target.value);
                            }}
                        >
                            <option value="">Plan</option>
                            {plans.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Creator */}
                        <div className="flex min-w-40 flex-col gap-1">

                            <Input
                        title="Created By (Admin ID)" placeholder="Created By (Admin ID)"
                        value={createdBy}
                        onChange={(e) => {
                            setCreatedBy(e.target.value);
                            handleFilterChange('created_by', e.target.value);
                        }}
                        className="w-40"
                    />
                        </div>

                    {/* Dates */}
                        <div className="flex min-w-40 flex-col gap-1"><Input
                        type="date"
                        title="From Date" placeholder="From Date"
                        value={fromDate}
                        onChange={(e) => {
                            setFromDate(e.target.value);
                            handleFilterChange('from_date', e.target.value);
                        }}
                    /></div>

                        <div className="flex min-w-40 flex-col gap-1"><Input
                        type="date"
                        title="To Date" placeholder="To Date"
                        value={toDate}
                        onChange={(e) => {
                            setToDate(e.target.value);
                            handleFilterChange('to_date', e.target.value);
                        }}
                    /></div>
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
                                <TableHead>U.Id &gt; Student(F) Section</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Plan Type &amp; Name</TableHead>
                                <TableHead>Payment Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Kind</TableHead>
                                <TableHead>Txn ID</TableHead>
                                <TableHead>Note</TableHead>
                                {/* <TableHead>Created By</TableHead> */}
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {payments.data.length > 0 ? (
                                payments.data.map((payment: any, idx: number) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{(payments.current_page - 1) * payments.per_page + (idx + 1)}</TableCell>

                                        <TableCell>
                                            {payment.student_uid ? (
                                                <Link href={`/admin/students?search=${encodeURIComponent(payment.student_uid)}`} className="text-primary hover:underline">
                                                    {payment.student_uid}
                                                </Link>
                                            ) : (
                                                '-'
                                            )}{' '}
                                            &gt; {payment.student_display || '-'}
                                        </TableCell>
                                        <TableCell>{payment.display_class || '-'}</TableCell>
                                        <TableCell>{payment.display_subjects?.length ? payment.display_subjects.join(', ') : '-'}</TableCell>
                                        <TableCell>{payment.display_plan_type_name || '-'}</TableCell>
                                        <TableCell className="capitalize">{payment.display_payment_method || 'other'}</TableCell>

                                        <TableCell>INR {payment.amount}</TableCell>

                                        <TableCell>
                                            <Badge
                                                variant={
                                                    payment.payment_kind === 'extend'
                                                        ? 'success'
                                                        : payment.payment_kind === 'renew'
                                                          ? 'secondary'
                                                          : 'outline'
                                                }
                                                className="capitalize"
                                            >
                                                {payment.payment_kind || 'new'}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>{payment.gateway_txn_id || '-'}</TableCell>

                                        <TableCell>
                                            {payment.note ? (
                                                <button
                                                    type="button"
                                                    className="text-left text-sm text-primary hover:underline"
                                                    onClick={() => {
                                                        setSelectedNote(payment.note);
                                                        setNoteDialogOpen(true);
                                                    }}
                                                >
                                                    {truncateNote(payment.note)}
                                                </button>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant={
                                                    payment.status === 'completed'
                                                        ? 'success'
                                                        : payment.status === 'failed'
                                                          ? 'destructive'
                                                          : 'secondary'
                                                }
                                            >
                                                {payment.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>{payment.created_at_formatted}</TableCell>

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
                                                        <Link href={edit({ payment: payment.id }).url}>Edit</Link>
                                                    </DropdownMenuItem>

                                                    {/* Delete */}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>

                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Payment?</AlertDialogTitle>
                                                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(payment.id)}
                                                                    className="bg-red-600 text-white"
                                                                    disabled={processing}
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
                                    <TableCell colSpan={13} className="py-4 text-center text-muted-foreground">
                                        No payments found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {payments.total > payments.per_page && (
                        <div className="flex justify-end gap-2 p-4">
                            {payments.links.map((link: any, idx: number) =>
                                link.url ? (
                                    <Button
                                        key={idx}
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        onClick={() => router.visit(link.url, { preserveScroll: true })}
                                    >
                                        {link.label.replace('&laquo;', 'Â«').replace('&raquo;', 'Â»')}
                                    </Button>
                                ) : null,
                            )}
                        </div>
                    )}
                </Card>
            </div>
            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Payment Note</DialogTitle>
                    </DialogHeader>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{selectedNote || '-'}</p>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}








