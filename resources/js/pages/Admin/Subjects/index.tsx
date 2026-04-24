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
import { create, destroy, edit, index } from '@/routes/admin/subjects';
import { create as createSubjectFeatures } from '@/routes/admin/subjects/features';
import { create as createSubjectOverviews } from '@/routes/admin/subjects/overviews';
import { create as createSubjectSyllabus } from '@/routes/admin/subjects/syllabus';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Subjects', href: index().url },
];

export default function Index() {
    const { subjects, filters, classes, boards, plans } = usePage().props as any;

    // Filters
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [classId, setClassId] = useState(filters.class || '');
    const [boardId, setBoardId] = useState(filters.board || '');
    const [batchStatus, setBatchStatus] = useState(filters.batch_status || '');
    const [sessionStatus, setSessionStatus] = useState(filters.session_status || '');
    const [planId, setPlanId] = useState(filters.plan || '');

    const { delete: deleteSubject, processing } = useForm();

    const handleFilterChange = (key: string, value: string) => {
        const params = {
            search,
            status,
            class: classId,
            board: boardId,
            batch_status: batchStatus,
            session_status: sessionStatus,
            plan: planId,
        };
        params[key] = value;
        router.get(index().url, params, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        deleteSubject(destroy({ subject: id }).url, { preserveScroll: true });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Subjects" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Subjects</h1>
                    <Link href={create().url}>
                        <Button>Add Subject</Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine subjects list</p>

                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                        <div className="flex min-w-64 flex-col gap-1">

                            <Input
                                title="Search by name or code..." placeholder="Search by name or code..."
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
                                className="rounded-md border p-2 text-sm"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">

                            <select title="Select"
                                value={classId}
                                onChange={(e) => {
                                    setClassId(e.target.value);
                                    handleFilterChange('class', e.target.value);
                                }}
                                className="rounded-md border p-2 text-sm"
                            >
                                <option value="">All Classes</option>
                                {classes.map((c: any) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">

                            <select title="Select"
                                value={boardId}
                                onChange={(e) => {
                                    setBoardId(e.target.value);
                                    handleFilterChange('board', e.target.value);
                                }}
                                className="rounded-md border p-2 text-sm"
                            >
                                <option value="">All Boards</option>
                                {boards.map((b: any) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">

                            <select title="Select"
                                value={batchStatus}
                                onChange={(e) => {
                                    setBatchStatus(e.target.value);
                                    handleFilterChange('batch_status', e.target.value);
                                }}
                                className="rounded-md border p-2 text-sm"
                            >
                                <option value="">All Batch Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">

                            <select title="Select"
                                value={sessionStatus}
                                onChange={(e) => {
                                    setSessionStatus(e.target.value);
                                    handleFilterChange('session_status', e.target.value);
                                }}
                                className="rounded-md border p-2 text-sm"
                            >
                                <option value="">All Session Status</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">

                            <select title="Select"
                                value={planId}
                                onChange={(e) => {
                                    setPlanId(e.target.value);
                                    handleFilterChange('plan', e.target.value);
                                }}
                                className="rounded-md border p-2 text-sm"
                            >
                                <option value="">All Plans</option>
                                {plans.map((p: any) => (
                                    <option key={p.id} value={p.id}>
                                        {p.title}
                                    </option>
                                ))}
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
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Board</TableHead>
                                <TableHead>Batches</TableHead>
                                <TableHead>Class Sessions</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {subjects.data.length > 0 ? (
                                subjects.data.map((sub: any, index: number) => (
                                    <TableRow key={sub.id}>
                                        <TableCell>{(subjects.current_page - 1) * subjects.per_page + (index + 1)}</TableCell>
                                        <TableCell>{sub.name}</TableCell>
                                        <TableCell>{sub.code || '-'}</TableCell>
                                        <TableCell>{sub.clazz?.name || '—'}</TableCell>
                                        <TableCell>{sub.clazz?.board_id || '—'}</TableCell>
                                        <TableCell>{sub.batches.length}</TableCell>
                                        <TableCell>{sub.classSessions?.length || 0}</TableCell>
                                        <TableCell>
                                            <Badge variant={sub.status === 'active' ? 'success' : 'destructive'}>
                                                {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
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
                                                        <Link href={createSubjectOverviews({ subject: sub.id })}>Manage Overviews</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={createSubjectFeatures({ subject: sub.id })}>Manage Features</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={createSubjectSyllabus({ subject: sub.id })}>Manage Syllabus</Link>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem asChild>
                                                        <Link href={edit({ subject: sub.id }).url}>Edit</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/subjects/${sub.id}/copy`}>Copy</Link>
                                                    </DropdownMenuItem>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>

                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                                                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                                            </AlertDialogHeader>

                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(sub.id)}
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
                                    <TableCell colSpan={9} className="py-4 text-center text-muted-foreground">
                                        No subjects found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {subjects.total > subjects.per_page && (
                        <div className="flex justify-end space-x-2 p-4">
                            {subjects.links.map((link: any, idx: number) =>
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



