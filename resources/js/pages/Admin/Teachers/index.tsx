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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

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
import { create, destroy, edit, index } from '@/routes/admin/teachers';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Teachers', href: index().url },
];

export default function Index() {
    const { teachers, filters, classes, batchStatuses, sessionStatuses, doubtStatuses } = usePage().props as any;
    const getInitials = useInitials();
    const [search, setSearch] = useState(filters.search || '');
    const [classId, setClassId] = useState(filters.class || '');
    const [batchStatus, setBatchStatus] = useState(filters.batch_status || '');
    const [subjectId, setSubjectId] = useState(filters.subject || '');
    const [sessionStatus, setSessionStatus] = useState(filters.session_status || '');
    const [sessionFrom, setSessionFrom] = useState(filters.session_from || '');
    const [sessionTo, setSessionTo] = useState(filters.session_to || '');
    const [homeworkFrom, setHomeworkFrom] = useState(filters.homework_due_from || '');
    const [homeworkTo, setHomeworkTo] = useState(filters.homework_due_to || '');
    const [doubtStatus, setDoubtStatus] = useState(filters.doubt_status || '');

    const { delete: deleteTeacher, processing } = useForm();

    const handleFilterChange = (key: string, value: string) => {
        const params = {
            search,
            class: classId,
            batch_status: batchStatus,
            subject: subjectId,
            session_status: sessionStatus,
            session_from: sessionFrom,
            session_to: sessionTo,
            homework_due_from: homeworkFrom,
            homework_due_to: homeworkTo,
            doubt_status: doubtStatus,
        };
        params[key] = value;
        router.get(index().url, params, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        deleteTeacher(destroy({ teacher: id }).url, { preserveScroll: true });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Teachers" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Teachers</h1>
                    <Link href={create().url}>
                        <Button>Add Teacher</Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine teachers list</p>

                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                        <div className="flex min-w-64 flex-col gap-1">

                            <Input
                                title="Search by name or email..." placeholder="Search by name or email..."
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
                                value={batchStatus}
                                onChange={(e) => {
                                    setBatchStatus(e.target.value);
                                    handleFilterChange('batch_status', e.target.value);
                                }}
                                className="rounded-md border p-2 text-sm"
                            >
                                <option value="">All Batch Status</option>
                                {batchStatuses.map((s: any) => (
                                    <option key={s} value={s}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">

                            <select title="Select"
                                value={subjectId}
                                onChange={(e) => {
                                    setSubjectId(e.target.value);
                                    handleFilterChange('subject', e.target.value);
                                }}
                                className="rounded-md border p-2 text-sm"
                            >
                                <option value="">All Subjects</option>
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
                                {sessionStatuses.map((s: any) => (
                                    <option key={s} value={s}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">

                            <select title="Select"
                                value={doubtStatus}
                                onChange={(e) => {
                                    setDoubtStatus(e.target.value);
                                    handleFilterChange('doubt_status', e.target.value);
                                }}
                                className="rounded-md border p-2 text-sm"
                            >
                                <option value="">All Doubt Status</option>
                                {doubtStatuses.map((s: any) => (
                                    <option key={s} value={s}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">

                            <Input
                                type="date"
                                value={sessionFrom}
                                onChange={(e) => {
                                    setSessionFrom(e.target.value);
                                    handleFilterChange('session_from', e.target.value);
                                }}
                                className="rounded-md border p-2 text-sm"
                            />
                        </div>
                        <div className="flex min-w-40 flex-col gap-1">

                            <Input
                                type="date"
                                value={sessionTo}
                                onChange={(e) => {
                                    setSessionTo(e.target.value);
                                    handleFilterChange('session_to', e.target.value);
                                }}
                                className="rounded-md border p-2 text-sm"
                            />
                        </div>
                        <div className="flex min-w-40 flex-col gap-1">

                            <Input
                                type="date"
                                value={homeworkFrom}
                                onChange={(e) => {
                                    setHomeworkFrom(e.target.value);
                                    handleFilterChange('homework_due_from', e.target.value);
                                }}
                                className="rounded-md border p-2 text-sm"
                            />
                        </div>
                        <div className="flex min-w-40 flex-col gap-1">

                            <Input
                                type="date"
                                value={homeworkTo}
                                onChange={(e) => {
                                    setHomeworkTo(e.target.value);
                                    handleFilterChange('homework_due_to', e.target.value);
                                }}
                                className="rounded-md border p-2 text-sm"
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
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Batches</TableHead>
                                <TableHead>Sessions</TableHead>
                                <TableHead>Homeworks</TableHead>
                                <TableHead>Practice Tests</TableHead>
                                <TableHead>Doubts</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {teachers.data.length > 0 ? (
                                teachers.data.map((teacher: any, index: number) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell>{(teachers.current_page - 1) * teachers.per_page + (index + 1)}</TableCell>
                                        <TableCell>
                                            {' '}
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                                                    {teacher?.user.profile_image ? (
                                                        <AvatarImage src={`/storage/${teacher?.user.profile_image}`} alt={teacher?.user.name} />
                                                    ) : (
                                                        <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                            {getInitials(teacher?.user.name)}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>

                                                <span className="leading-none font-medium">{teacher.user?.name || '—'}</span>
                                            </div>
                                            {/* {teacher.user.name} */}
                                        </TableCell>
                                        <TableCell>{teacher.user.email}</TableCell>
                                        <TableCell>{teacher.batches?.length || '-'}</TableCell>
                                        <TableCell>{teacher.classSessions?.length || '-'}</TableCell>
                                        <TableCell>{teacher.homeworks?.length || '-'}</TableCell>
                                        <TableCell>{teacher.practiceTests?.length || '-'}</TableCell>
                                        <TableCell>{teacher.doubts?.length || '-'}</TableCell>
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
                                                        <Link href={edit({ teacher: teacher.id }).url}>Edit</Link>
                                                    </DropdownMenuItem>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>

                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
                                                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                                            </AlertDialogHeader>

                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(teacher.id)}
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
                                    <TableCell colSpan={10} className="py-4 text-center text-muted-foreground">
                                        No teachers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {teachers.total > teachers.per_page && (
                        <div className="flex justify-end space-x-2 p-4">
                            {teachers.links.map((link: any, idx: number) =>
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



