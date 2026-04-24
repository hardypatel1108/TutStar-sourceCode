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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatTimeSlot } from '@/lib/time-slot';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { dashboard as dashboardindex } from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

import PendingEnrollmentController from '@/actions/App/Http/Controllers/Admin/PendingEnrollmentController';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboardindex().url },
    { title: 'Pending Enrollments', href: '/admin/pending-enrollments' },
];

interface PendingBatch {
    id: number;
    batch_code: string;
    subject?: { name?: string };
    time_slot?: string | null;
    created_at?: string | null;
    students_limit?: number | null;
    teacher_name?: string | null;
    teacher_email?: string | null;
    current_strength?: number;
    is_already_enrolled?: boolean;
    is_currently_active?: boolean;
    has_time_conflict?: boolean;
    conflicting_batches?: Array<{ id: number; batch_code: string; time_slot?: string | null }>;
}

interface Pending {
    id: number;
    student: {
        id: number;
        user: { name: string; email: string };
        clazz?: { name: string };
    };
    plan: {
        title: string;
        batches?: PendingBatch[];
    };
    checkout_plan?: { title: string };
    payment: { amount: number; created_at: string };
    student_active_batches?: Array<{
        id: number;
        batch_code: string;
        time_slot?: string | null;
        subject_name?: string | null;
        teacher_name?: string | null;
    }>;
}

export default function Index() {
    const { pending, filters } = usePage().props as {
        pending: any;
        filters: { search?: string };
    };

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Pending | null>(null);

    const { put: resolveEnrollment, processing: resolving } = useForm();

    const handleResolve = (id: number) => {
        resolveEnrollment(`/admin/pending-enrollments/${id}/resolve`, { preserveScroll: true });
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get('/admin/pending-enrollments', { search: e.target.value }, { preserveState: true, preserveScroll: true });
    };

    const { data, setData } = useForm({
        batch_id: '',
        auto: false,
    });

    const [strengthSortDir, setStrengthSortDir] = useState<'asc' | 'desc'>('asc');
    const [createdSortDir, setCreatedSortDir] = useState<'asc' | 'desc'>('asc');

    const sortedBatches = useMemo(() => {
        const batches = [...(selected?.plan?.batches || [])];

        const getStrength = (batch: PendingBatch) => batch.current_strength ?? 0;
        const getCreatedAt = (batch: PendingBatch) => (batch.created_at ? new Date(batch.created_at).getTime() : 0);

        const strengthMultiplier = strengthSortDir === 'asc' ? 1 : -1;
        const createdMultiplier = createdSortDir === 'asc' ? 1 : -1;

        return batches.sort((a, b) => {
            const strengthDiff = (getStrength(a) - getStrength(b)) * strengthMultiplier;
            if (strengthDiff !== 0) {
                return strengthDiff;
            }

            const createdDiff = (getCreatedAt(a) - getCreatedAt(b)) * createdMultiplier;
            if (createdDiff !== 0) {
                return createdDiff;
            }

            return String(a.batch_code || '').localeCompare(String(b.batch_code || ''));
        });
    }, [selected?.plan?.batches, strengthSortDir, createdSortDir]);

    const selectedBatch = sortedBatches.find((batch) => String(batch.id) === String(data.batch_id));

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Pending Enrollments" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Pending Enrollments</h1>
                </div>

                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine pending enrollments</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex min-w-64 flex-col gap-1">

                            <Input
                                title="Search by student name or email..." placeholder="Search by student name or email..."
                                className="w-64"
                                defaultValue={filters.search || ''}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                    <div className="mt-3">
                        <Button type="button" variant="outline" onClick={() => router.get('/admin/pending-enrollments')}>
                            Clear Filters
                        </Button>
                    </div>
                </div>

                <Card className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Checkout Plan</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Paid At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {pending.data.length > 0 ? (
                                pending.data.map((item: Pending, index: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{(pending.current_page - 1) * pending.per_page + (index + 1)}</TableCell>
                                        <TableCell className="font-medium">
                                            {item.student?.user?.name}
                                            <br />
                                            <span className="text-xs text-muted-foreground">{item.student?.user?.email}</span>
                                        </TableCell>
                                        <TableCell>{item.student?.clazz?.name || '-'}</TableCell>
                                        <TableCell>{item.plan?.title}</TableCell>
                                        <TableCell>{item.checkout_plan?.title || '-'}</TableCell>
                                        <TableCell>Rs {item.payment?.amount}</TableCell>
                                        <TableCell>{item.payment?.created_at?.slice(0, 10)}</TableCell>

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
                                                        <Link href={`/admin/students/${item.student?.id}/edit`}>View Student</Link>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelected(item);
                                                            setData('batch_id', '');
                                                            setData('auto', false);
                                                            setOpen(true);
                                                        }}
                                                    >
                                                        Assign Batch
                                                    </DropdownMenuItem>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                Mark Resolved
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Mark Enrollment as Resolved</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This means student has been allocated to correct batch. Continue?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-green-600 text-white hover:bg-green-700"
                                                                    onClick={() => handleResolve(item.id)}
                                                                    disabled={resolving}
                                                                >
                                                                    {resolving ? 'Processing...' : 'Confirm'}
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
                                    <TableCell colSpan={8} className="py-4 text-center text-muted-foreground">
                                        No pending enrollments found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {pending.total > pending.per_page && (
                    <div className="flex justify-end space-x-2 p-4">
                        {pending.links.map((link: any, idx: number) =>
                            link.url ? (
                                <Button
                                    key={idx}
                                    variant={link.active ? 'default' : 'outline'}
                                    onClick={() => router.visit(link.url, { preserveScroll: true })}
                                    size="sm"
                                >
                                    {link.label.replace('&laquo;', '<<').replace('&raquo;', '>>')}
                                </Button>
                            ) : null,
                        )}
                    </div>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Batch</DialogTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {selected?.student?.user?.name} - {selected?.student?.user?.email}
                        </p>
                    </DialogHeader>

                    {selected && (
                        <Form
                            {...PendingEnrollmentController.assign.form({ pending: selected.id })}
                            disableWhileProcessing
                            onSuccess={() => setOpen(false)}
                            onSubmit={(e) => {
                                if (selectedBatch?.is_currently_active) {
                                    const confirmed = window.confirm(
                                        'This action will only extend the days in the existing active batch for this student. Do you want to continue?',
                                    );
                                    if (!confirmed) {
                                        e.preventDefault();
                                    }
                                }
                            }}
                            className="space-y-4"
                        >
                            {({ processing }) => (
                                <>
                                    <input type="hidden" name="batch_id" value={data.batch_id} />
                                    <input type="hidden" name="auto" value={data.auto ? 1 : 0} />

                                    <div className="rounded-md border bg-muted/30 p-3 text-sm">
                                        <p className="font-medium">Currently Active Batches</p>
                                        {selected.student_active_batches?.length ? (
                                            <ul className="mt-2 space-y-1 text-muted-foreground">
                                                {selected.student_active_batches.map((batch) => (
                                                    <li key={batch.id}>
                                                        {batch.batch_code}
                                                        {batch.subject_name ? ` - ${batch.subject_name}` : ''}
                                                        {batch.time_slot ? ` (${formatTimeSlot(batch.time_slot)})` : ''}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="mt-1 text-muted-foreground">No active batch currently.</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">

                                        <Select value={strengthSortDir} onValueChange={(value) => setStrengthSortDir(value as 'asc' | 'desc')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select strength order" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="asc">Current Strength (Low to High)</SelectItem>
                                                <SelectItem value="desc">Current Strength (High to Low)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">

                                        <Select value={createdSortDir} onValueChange={(value) => setCreatedSortDir(value as 'asc' | 'desc')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select created date order" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="asc">Batch Created Date (Oldest First)</SelectItem>
                                                <SelectItem value="desc">Batch Created Date (Newest First)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">

                                        <Select
                                            value={data.batch_id}
                                            onValueChange={(value) => {
                                                setData('batch_id', value);
                                                setData('auto', false);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select batch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sortedBatches.map((batch) => (
                                                    <SelectItem key={batch.id} value={String(batch.id)}>
                                                        {batch.batch_code} - {batch.subject?.name}
                                                        {` | Strength: ${batch.current_strength ?? 0}/${batch.students_limit ?? '-'}`}
                                                        {batch.teacher_name ? ` | ${batch.teacher_name}` : ''}
                                                        {batch.teacher_email ? ` (${batch.teacher_email})` : ''}
                                                        {batch.is_currently_active ? ' [Already Active]' : ''}
                                                        {!batch.is_currently_active && batch.is_already_enrolled ? ' [Previously Enrolled]' : ''}
                                                        {batch.has_time_conflict ? ' [Time Conflict]' : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedBatch && (
                                        <div className="rounded-md border bg-muted/30 p-3 text-sm">
                                            <p className="font-medium">Selected Batch Details</p>
                                            <div className="mt-2 space-y-1 text-muted-foreground">
                                                <p>
                                                    Batch: <span className="font-medium text-foreground">{selectedBatch.batch_code}</span>
                                                </p>
                                                <p>
                                                    Teacher:{' '}
                                                    <span className="font-medium text-foreground">
                                                        {selectedBatch.teacher_name || '-'}
                                                    </span>
                                                    {selectedBatch.teacher_email ? ` (${selectedBatch.teacher_email})` : ''}
                                                </p>
                                                <p>
                                                    Current Strength:{' '}
                                                    <span className="font-medium text-foreground">
                                                        {selectedBatch.current_strength ?? 0}
                                                        {selectedBatch.students_limit ? ` / ${selectedBatch.students_limit}` : ''}
                                                    </span>
                                                </p>
                                                <p>
                                                    Batch Timing:{' '}
                                                    <span className="font-medium text-foreground">
                                                        {selectedBatch.time_slot ? formatTimeSlot(selectedBatch.time_slot) : '-'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedBatch?.has_time_conflict && (
                                        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                                            Warning: selected batch time slot conflicts with active batch(es):{' '}
                                            {selectedBatch.conflicting_batches?.map((batch) => batch.batch_code).join(', ') ||
                                                'existing active batches'}
                                            .
                                        </div>
                                    )}

                                    {selectedBatch?.is_currently_active && (
                                        <div className="rounded-md border border-blue-300 bg-blue-50 p-3 text-sm text-blue-800">
                                            This student is already active in the selected batch
                                            {selectedBatch.time_slot ? ` (${formatTimeSlot(selectedBatch.time_slot)})` : ''}.
                                        </div>
                                    )}

                                    {!selectedBatch?.is_currently_active && selectedBatch?.is_already_enrolled && (
                                        <div className="rounded-md border border-sky-300 bg-sky-50 p-3 text-sm text-sky-800">
                                            Student was previously enrolled in this batch.
                                        </div>
                                    )}

                                    <DialogFooter>
                                        <Button type="submit" disabled={processing || !data.batch_id} className="w-full">
                                            {processing ? 'Assigning...' : 'Assign'}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}


