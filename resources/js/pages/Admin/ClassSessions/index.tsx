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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTimeSlotStyle } from '@/lib/time-slot';
import AdminLayout from '@/layouts/admin-layout';
import { dashboard as dashboardindex } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/classSessions';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface Session {
    id: number;
    topic: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    batch?: { id: number; name: string; students_limit?: number; clazz?: { id: number; name: string }; current_students_count?: number };
    subject?: { id: number; name: string };
    teacher?: { id: number; user?: { name: string } };
    meeting?: { id: number; duration?: number; description?: string | null };
    class_date: string;
    class_date_formatted: string;
    class_time_range?: string;
    time_slot?: string;
    has_homework?: boolean;
    is_started?: boolean;
    is_ended?: boolean;
    start_class_url?: string | null;
    recording_url?: string | null;
    occurrence_id?: string | null;
    meeting_type?: 'single' | 'recurring';
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboardindex().url },
    { title: 'Class Sessions', href: index().url },
];

export default function Index() {
    const { sessions, filters, batches, subjects, teachers } = usePage().props as {
        sessions: any;
        filters: any;
        batches: { id: number; name: string }[];
        subjects: { id: number; name: string }[];
        teachers: { id: number; user: { name: string } }[];
    };

    const [search, setSearch] = useState(filters.search || '');
    const [view, setView] = useState(filters.view || 'upcoming');
    const [status, setStatus] = useState(filters.status || 'all');
    const [batchId, setBatchId] = useState(filters.batch || 'all');
    const [subjectId, setSubjectId] = useState(filters.subject || 'all');
    const [teacherId, setTeacherId] = useState(filters.teacher || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const { delete: deleteSession, processing } = useForm();

    const handleFilterChange = (type: string, value: string) => {
        const params = {
            search,
            view,
            status,
            batch: batchId,
            subject: subjectId,
            teacher: teacherId,
            start_date: startDate,
            end_date: endDate,
        };
        params[type] = value;
        router.get(index().url, params, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (id: number, deleteScope: 'occurrence' | 'series' = 'occurrence') => {
        const baseUrl = destroy({ class_session: id }).url;
        const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}delete_scope=${deleteScope}`;
        deleteSession(url, {
            preserveScroll: true,
        });
    };

    const truncateInstruction = (text?: string | null) => {
        if (!text) return '-';
        return text.length > 20 ? `${text.slice(0, 20)}..` : text;
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Class Sessions" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Class Sessions</h1>
                    <Link href={create().url}>
                        <Button>Add Session</Button>
                    </Link>
                </div>
                {/* Filters */}
                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine class sessions</p>

                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                    <div className="flex flex-col gap-1">

                        <Input
                            title="Search by topic..." placeholder="Search by topic..."
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
                            <option value="all">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="rescheduled">Rescheduled</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">

                        <select title="Select"
                            value={batchId}
                            onChange={(e) => {
                                setBatchId(e.target.value);
                                handleFilterChange('batch', e.target.value);
                            }}
                            className="rounded-md border border-input bg-background p-2 text-sm"
                        >
                            <option value="all">All Batches</option>
                            {batches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
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
                            <option value="all">All Subjects</option>
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
                            <option value="all">All Teachers</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.user?.name || '-'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">

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

                    <div className="flex flex-col gap-1">

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

                    <div className="flex flex-col gap-1">

                        <Button
                            type="button"
                            variant={view === 'upcoming' ? 'default' : 'outline'}
                            onClick={() => {
                                const nextView = view === 'upcoming' ? 'all' : 'upcoming';
                                setView(nextView);
                                handleFilterChange('view', nextView);
                            }}
                        >
                            {view === 'upcoming' ? 'Show All Classes' : 'Show Upcoming Only'}
                        </Button>
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
                                <TableHead>Topic</TableHead>
                                <TableHead>Batch</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Session Time</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Teacher Instruction</TableHead>
                                <TableHead>Homework</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {sessions.data.length > 0 ? (
                                sessions.data.map((session: Session, index: number) => (
                                    <TableRow key={session.id}>
                                        <TableCell>{(sessions.current_page - 1) * sessions.per_page + (index + 1)}</TableCell>
                                        <TableCell className="font-medium">{session.topic}</TableCell>
                                        <TableCell>{session.batch?.name || '-'} </TableCell>
                                        <TableCell>{session.batch?.clazz?.name || '-'}</TableCell>
                                        <TableCell>
                                            {session.batch
                                                ? `${session.batch.current_students_count ?? 0} / ${session.batch.students_limit ?? 0}`
                                                : '-'}
                                        </TableCell>
                                        <TableCell>{session.subject?.name || '-'}</TableCell>
                                        <TableCell>{session.teacher?.user?.name || '—'}</TableCell>
                                        <TableCell>{session.class_date_formatted || '-'}</TableCell>
                                        <TableCell>
                                            {session.class_time_range ? (
                                                <>
                                                    <Badge variant="outline" className={getTimeSlotStyle(session.time_slot).className}>
                                                        {session.class_time_range}
                                                    </Badge>
                                                </>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell>{session.meeting?.duration ? `${session.meeting.duration} min` : '-'}</TableCell>
                                        <TableCell>
                                            {session.meeting?.description ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <button type="button" className="text-left text-sm text-primary underline-offset-4 hover:underline">
                                                            {truncateInstruction(session.meeting.description)}
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-lg">
                                                        <DialogHeader>
                                                            <DialogTitle>Teacher Instruction</DialogTitle>
                                                        </DialogHeader>
                                                        <p className="whitespace-pre-wrap text-sm">{session.meeting.description}</p>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {session.has_homework ? (
                                                <span className="font-semibold text-emerald-600" title="Homework sent">
                                                    ✓
                                                </span>
                                            ) : (
                                                <span className="font-semibold text-rose-600" title="Homework not sent">
                                                    ✗
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    session.status === 'scheduled'
                                                        ? 'default'
                                                        : session.status === 'completed'
                                                          ? 'secondary'
                                                          : 'destructive'
                                                }
                                            >
                                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
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
                                                    {session.is_started && session.start_class_url && (
                                                        <DropdownMenuItem asChild>
                                                            <a href={session.start_class_url} target="_blank" rel="noreferrer">
                                                                Start Class
                                                            </a>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {session.is_ended && session.recording_url && (
                                                        <DropdownMenuItem asChild>
                                                            <a href={session.recording_url} target="_blank" rel="noreferrer">
                                                                View Recording
                                                            </a>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem asChild>
                                                        <Link href={edit({ class_session: session.id }).url}>Edit</Link>
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600"
                                                                onSelect={(e) => e.preventDefault()}
                                                            >
                                                                Delete Occurrence
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Occurrence</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this occurrence? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(session.id, 'occurrence')}
                                                                    disabled={processing}
                                                                    className="bg-red-600 text-white hover:bg-red-700"
                                                                >
                                                                    {processing ? 'Deleting...' : 'Confirm'}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    {session.meeting_type === 'recurring' && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem
                                                                    className="text-red-700 focus:text-red-700"
                                                                    onSelect={(e) => e.preventDefault()}
                                                                >
                                                                    Delete Entire Meeting
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Entire Recurring Meeting</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will delete the full recurring series from both your platform and Zoom.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(session.id, 'series')}
                                                                        disabled={processing}
                                                                        className="bg-red-700 text-white hover:bg-red-800"
                                                                    >
                                                                        {processing ? 'Deleting...' : 'Delete Entire Meeting'}
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={14} className="py-4 text-center text-muted-foreground">
                                        No sessions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {sessions.total > sessions.per_page && (
                        <div className="flex justify-end space-x-2 p-4">
                            {sessions.links.map((link: any, idx: number) =>
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







