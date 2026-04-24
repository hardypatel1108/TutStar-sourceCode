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
import { formatTimeSlot, TIME_SLOT_OPTIONS } from '@/lib/time-slot';
import AdminLayout from '@/layouts/admin-layout';
import { dashboard as dashboardindex } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/batches';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface Batch {
    id: number;
    batch_code: string;
    status: string;
    time_slot?: string | null;
    plan?: { title: string };
    clazz?: { name: string; board?: { name: string } };
    subject?: { name: string };
    teacher?: { user?: { name: string } };
    students_limit?: number;
    current_students_count?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboardindex().url },
    { title: 'Batches', href: index().url },
];

export default function Index() {
    const { batches, filters, classes, subjects, teachers, plans, boards } = usePage().props as {
        batches: any;
        filters: any;
        classes: { id: number; name: string }[];
        subjects: { id: number; name: string }[];
        teachers: { id: number; name: string }[];
        plans: { id: number; name: string }[];
        boards: { id: number; name: string }[];
    };

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [classId, setClassId] = useState(filters.class || '');
    const [subjectId, setSubjectId] = useState(filters.subject || '');
    const [teacherId, setTeacherId] = useState(filters.teacher || '');
    const [planId, setPlanId] = useState(filters.plan || '');
    const [boardId, setBoardId] = useState(filters.board || '');
    const [timeSlot, setTimeSlot] = useState(filters.time_slot || '');
    const [strength, setStrength] = useState(filters.strength || '');
    const { delete: deleteBatch, processing } = useForm();

    const handleFilterChange = (type: string, value: string) => {
        const params = {
            search,
            status,
            class: classId,
            subject: subjectId,
            teacher: teacherId,
            plan: planId,
            board: boardId,
            time_slot: timeSlot,
            strength,
        };
        params[type] = value;
        router.get(index().url, params, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        deleteBatch(destroy({ batch: id }).url, { preserveScroll: true });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Batches" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Batches</h1>
                    <Link href={create().url}>
                        <Button>Add Batch</Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine batches list</p>

                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                    <div className="flex flex-col gap-1">

                        <Input
                            title="Search by batch code or teacher..." placeholder="Search by batch code or teacher..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                handleFilterChange('search', e.target.value);
                            }}
                            className="w-64"
                        />
                    </div>

                    <div className="flex flex-col gap-1">

                        <select title="Select"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                handleFilterChange('status', e.target.value);
                            }}
                            className="rounded-md border border-input bg-background p-2 text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">

                        <select title="Select"
                            value={classId}
                            onChange={(e) => {
                                setClassId(e.target.value);
                                handleFilterChange('class', e.target.value);
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

                    <div className="flex flex-col gap-1">

                        <select title="Select"
                            value={subjectId}
                            onChange={(e) => {
                                setSubjectId(e.target.value);
                                handleFilterChange('subject', e.target.value);
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

                    <div className="flex flex-col gap-1">

                        <select title="Select"
                            value={teacherId}
                            onChange={(e) => {
                                setTeacherId(e.target.value);
                                handleFilterChange('teacher', e.target.value);
                            }}
                            className="rounded-md border border-input bg-background p-2 text-sm"
                        >
                            <option value="">All Teachers</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">

                        <select title="Select"
                            value={planId}
                            onChange={(e) => {
                                setPlanId(e.target.value);
                                handleFilterChange('plan', e.target.value);
                            }}
                            className="rounded-md border border-input bg-background p-2 text-sm"
                        >
                            <option value="">All Plans</option>
                            {plans.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">

                        <select title="Select"
                            value={boardId}
                            onChange={(e) => {
                                setBoardId(e.target.value);
                                handleFilterChange('board', e.target.value);
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

                    <div className="flex flex-col gap-1">

                        <select title="Select"
                            value={timeSlot}
                            onChange={(e) => {
                                setTimeSlot(e.target.value);
                                handleFilterChange('time_slot', e.target.value);
                            }}
                            className="rounded-md border border-input bg-background p-2 text-sm"
                        >
                            <option value="">All Time Slots</option>
                            {TIME_SLOT_OPTIONS.map((slot) => (
                                <option key={slot.id} value={slot.id}>
                                    {slot.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">

                        <select title="Select"
                            value={strength}
                            onChange={(e) => {
                                setStrength(e.target.value);
                                handleFilterChange('strength', e.target.value);
                            }}
                            className="rounded-md border border-input bg-background p-2 text-sm"
                        >
                            <option value="">All Batch Strength</option>
                            <option value="lt10">{'<10'}</option>
                            <option value="10_15">10-15</option>
                            <option value="15_20">15-20</option>
                            <option value="gt20">{'>20'}</option>
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
                                <TableHead>Batch Code</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Board</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Time Slot</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {batches.data.length > 0 ? (
                                batches.data.map((batch: Batch, index: number) => {
                                    return (
                                        <TableRow key={batch.id}>
                                            <TableCell>{(batches.current_page - 1) * batches.per_page + (index + 1)}</TableCell>
                                            <TableCell className="font-medium">
                                                <Link
                                                    href={`/admin/class-sessions?batch=${batch.id}`}
                                                    className="text-primary underline-offset-4 hover:underline"
                                                >
                                                    {batch.batch_code}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{batch.clazz?.name || '—'}</TableCell>
                                            <TableCell>{batch.clazz?.board?.name || '—'}</TableCell>
                                            <TableCell>{batch.subject?.name || '—'}</TableCell>
                                            <TableCell>{batch.plan?.title || '—'}</TableCell>
                                            <TableCell>{batch.teacher?.user?.name || '-'}</TableCell>
                                            <TableCell>{formatTimeSlot(batch.time_slot)}</TableCell>
                                            <TableCell>{`${batch.current_students_count ?? 0} / ${batch.students_limit ?? 0}`}</TableCell>
                                            <TableCell>
                                                <Badge variant={batch.status === 'active' ? 'success' : 'destructive'}>
                                                    {batch.status === 'active' ? 'Active' : 'Inactive'}
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
                                                            <Link href={edit({ batch: batch.id }).url}>Edit</Link>
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
                                                                    <AlertDialogTitle>Delete Batch</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete this batch? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(batch.id)}
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
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-4 text-center text-muted-foreground">
                                        No batches found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {batches.total > batches.per_page && (
                        <div className="flex justify-end space-x-2 p-4">
                            {batches.links.map((link: any, idx: number) =>
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





