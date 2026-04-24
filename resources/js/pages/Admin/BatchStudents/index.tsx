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
import { dashboard as dashboardIndex } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/batchStudents';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboardIndex().url },
    { title: 'Batch Students', href: index().url },
];

export default function Index() {
    const { batchStudents, batches, classes, subjects, plans, filters } = usePage().props as {
        batchStudents: any;
        batches: { id: number; batch_code: string }[];
        classes: { id: number; name: string }[];
        subjects: { id: number; name: string }[];
        plans: { id: number; title: string }[];
        filters: any;
    };

    const [batchId, setBatchId] = useState(filters.batch || '');
    const [status, setStatus] = useState(filters.status || '');
    const [classId, setClassId] = useState(filters.class_id || '');
    const [subjectId, setSubjectId] = useState(filters.subject_id || '');
    const [planId, setPlanId] = useState(filters.plan_id || '');
    const [expiringInDays, setExpiringInDays] = useState(filters.expiring_in_days || '');
    const [search, setSearch] = useState(filters.search || '');

    const { delete: deleteRecord, processing } = useForm();

    const handleFilterChange = (type: string, value: string) => {
        const params: Record<string, string> = {
            batch: batchId,
            status,
            class_id: classId,
            subject_id: subjectId,
            plan_id: planId,
            expiring_in_days: expiringInDays,
            search,
        };

        params[type] = value;
        router.get(index().url, params, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        deleteRecord(destroy({ batch_student: id }).url, { preserveScroll: true });
    };

    const rowClassName = (tag: string | null | undefined) => {
        if (tag === 'today') return 'bg-red-50 hover:bg-red-100';
        if (tag === 'in_1_day') return 'bg-orange-50 hover:bg-orange-100';
        if (tag === 'in_2_days' || tag === 'in_5_days') return 'bg-amber-50 hover:bg-amber-100';
        return '';
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Batch Students" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Batch Students</h1>
                    <Link href={create().url}>
                        <Button>Add Student in batch</Button>
                    </Link>
                </div>

                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine batch student allocations</p>
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                        <div className="flex min-w-48 flex-col gap-1">

                            <select title="Select"
                                value={batchId}
                                onChange={(e) => {
                                    setBatchId(e.target.value);
                                    handleFilterChange('batch', e.target.value);
                                }}
                                className="rounded-md border border-input bg-background p-2 text-sm"
                            >
                                <option value="">All Batches</option>
                                {batches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.batch_code}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">

                            <select title="Select"
                                value={classId}
                                onChange={(e) => {
                                    setClassId(e.target.value);
                                    handleFilterChange('class_id', e.target.value);
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

                        <div className="flex min-w-40 flex-col gap-1">

                            <select title="Select"
                                value={subjectId}
                                onChange={(e) => {
                                    setSubjectId(e.target.value);
                                    handleFilterChange('subject_id', e.target.value);
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

                        <div className="flex min-w-40 flex-col gap-1">

                            <select title="Select"
                                value={planId}
                                onChange={(e) => {
                                    setPlanId(e.target.value);
                                    handleFilterChange('plan_id', e.target.value);
                                }}
                                className="rounded-md border border-input bg-background p-2 text-sm"
                            >
                                <option value="">All Plans</option>
                                {plans.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.title}
                                    </option>
                                ))}
                            </select>
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
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="left">Left</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">

                            <select title="Select"
                                value={expiringInDays}
                                onChange={(e) => {
                                    setExpiringInDays(e.target.value);
                                    handleFilterChange('expiring_in_days', e.target.value);
                                }}
                                className="rounded-md border border-input bg-background p-2 text-sm"
                            >
                                <option value="">Any</option>
                                <option value="5">Within 5 days</option>
                                <option value="2">Within 2 days</option>
                                <option value="1">Within 1 day</option>
                                <option value="0">Today</option>
                            </select>
                        </div>

                        <div className="flex min-w-60 flex-col gap-1">

                            <Input
                                type="text"
                                title="Search student name, U.Id, batch" placeholder="Search student name, U.Id, batch"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    handleFilterChange('search', e.target.value);
                                }}
                                className="w-60"
                            />
                        </div>

                        <div className="mt-3">
                            <Button type="button" variant="outline" onClick={() => router.get(index().url)}>
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </div>

                <Card className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Batch</TableHead>
                                <TableHead>U.Id</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Subj/s Enrolled</TableHead>
                                <TableHead>Plans</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Expiry Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {batchStudents.data.length > 0 ? (
                                batchStudents.data.map((item: any, rowIndex: number) => (
                                    <TableRow key={item.id} className={rowClassName(item.expiry_tag)}>
                                        <TableCell>{(batchStudents.current_page - 1) * batchStudents.per_page + (rowIndex + 1)}</TableCell>
                                        <TableCell>{item.batch?.batch_code || '-'}</TableCell>
                                        <TableCell>{item.student_uid || '-'}</TableCell>
                                        <TableCell>{item.class_name || '-'}</TableCell>
                                        <TableCell>{item.student?.user?.name || '-'}</TableCell>
                                        <TableCell>{item.subjects_enrolled_csv || '-'}</TableCell>
                                        <TableCell>{item.plans_csv || '-'}</TableCell>
                                        <TableCell>{item.teacher_name || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>{item.status || '-'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {item.expiry_date_formatted || '-'}
                                            {typeof item.expires_in_days === 'number' && item.expires_in_days >= 0 ? (
                                                <div className="text-xs text-muted-foreground">{Math.floor(Number(item.expires_in_days))} day(s) left</div>
                                            ) : null}
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
                                                        <Link href={edit({ batch_student: item.id }).url}>Edit</Link>
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
                                                                <AlertDialogTitle>Delete Allocation</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this student allocation? This action cannot be undone.
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
                                    <TableCell colSpan={11} className="py-4 text-center text-muted-foreground">
                                        No batch students found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {batchStudents.total > batchStudents.per_page && (
                        <div className="flex justify-end space-x-2 p-4">
                            {batchStudents.links.map((link: any, idx: number) =>
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
                </Card>
            </div>
        </AdminLayout>
    );
}


