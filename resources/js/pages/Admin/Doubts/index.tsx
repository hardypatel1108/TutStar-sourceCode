import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { dashboard } from '@/routes/admin/';
import { index } from '@/routes/admin/doubts';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Doubts', href: index().url },
];

type DoubtItem = {
    id: number;
    question: string;
    status: 'open' | 'answered' | 'closed' | string;
    attachment?: string | null;
    uploaded_time_formatted?: string | null;
    student?: {
        student_uid?: string | null;
        user?: { name?: string | null };
    };
    teacher?: {
        user?: { name?: string | null };
    };
    session?: {
        topic?: string | null;
        batch_id?: number | null;
        batch?: { name?: string | null };
        subject?: { name?: string | null };
        class_date_formatted?: string | null;
        status?: string | null;
    };
};

export default function DoubtsIndex() {
    const { doubts, filters, batches, subjects, teachers } = usePage().props as {
        doubts: any;
        filters: any;
        batches: { id: number; name: string }[];
        subjects: { id: number; name: string }[];
        teachers: { id: number; user?: { name?: string } }[];
    };

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [batch, setBatch] = useState(filters?.batch || '');
    const [subject, setSubject] = useState(filters?.subject || '');
    const [teacher, setTeacher] = useState(filters?.teacher || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    const applyFilters = (newFilters: Record<string, string> = {}) => {
        router.get(
            index().url,
            {
                search,
                status,
                batch,
                subject,
                teacher,
                start_date: startDate,
                end_date: endDate,
                ...newFilters,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const truncate = (text?: string | null, length = 25) => {
        if (!text) return '-';
        return text.length > length ? `${text.slice(0, length)}...` : text;
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Doubts" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Doubts</h1>
                </div>

                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine doubts list</p>
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                        <div className="flex min-w-64 flex-col gap-1">

                            <Input
                                title="Search by question, U.Id, student, topic..." placeholder="Search by question, U.Id, student, topic..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    applyFilters({ search: e.target.value });
                                }}
                                className="w-64"
                            />
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">

                            <select title="Select"
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    applyFilters({ status: e.target.value });
                                }}
                                className="rounded-md border border-input bg-background p-2 text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="open">Open</option>
                                <option value="answered">Answered</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">

                            <select title="Select"
                                value={batch}
                                onChange={(e) => {
                                    setBatch(e.target.value);
                                    applyFilters({ batch: e.target.value });
                                }}
                                className="rounded-md border border-input bg-background p-2 text-sm"
                            >
                                <option value="">All Batches</option>
                                {batches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">

                            <select title="Select"
                                value={subject}
                                onChange={(e) => {
                                    setSubject(e.target.value);
                                    applyFilters({ subject: e.target.value });
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
                                value={teacher}
                                onChange={(e) => {
                                    setTeacher(e.target.value);
                                    applyFilters({ teacher: e.target.value });
                                }}
                                className="rounded-md border border-input bg-background p-2 text-sm"
                            >
                                <option value="">All Teachers</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.user?.name || '-'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex min-w-40 flex-col gap-1">

                        <Input
                            type="date"
                            title="Start Date" placeholder="Start Date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                applyFilters({ start_date: e.target.value });
                            }}
                        />
                    </div>

                        <div className="flex min-w-40 flex-col gap-1">

                        <Input
                            type="date"
                            title="End Date" placeholder="End Date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                applyFilters({ end_date: e.target.value });
                            }}
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
                                <TableHead>U.Id</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Batch ID</TableHead>
                                <TableHead>Topic</TableHead>
                                <TableHead>Question</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Class Date</TableHead>
                                <TableHead>Uploaded Time</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {doubts.data.length > 0 ? (
                                doubts.data.map((doubt: DoubtItem, idx: number) => (
                                    <TableRow key={doubt.id}>
                                        <TableCell>{(doubts.current_page - 1) * doubts.per_page + (idx + 1)}</TableCell>
                                        <TableCell>{doubt.student?.student_uid || '-'}</TableCell>
                                        <TableCell>{doubt.student?.user?.name || '-'}</TableCell>
                                        <TableCell>
                                            {doubt.session?.batch_id || '-'}
                                            {doubt.session?.batch?.name ? ` (${doubt.session.batch.name})` : ''}
                                        </TableCell>
                                        <TableCell>{doubt.session?.topic || '-'}</TableCell>
                                        <TableCell className="font-medium">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button type="button" className="text-left text-sm text-primary underline-offset-4 hover:underline">
                                                        {truncate(doubt.question, 25)}
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-lg">
                                                    <DialogHeader>
                                                        <DialogTitle>Full Question</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 text-sm">
                                                        <p className="leading-relaxed text-foreground">{doubt.question}</p>
                                                        {doubt.attachment && (
                                                            <Button asChild variant="outline">
                                                                <a href={`/storage/${doubt.attachment}`} target="_blank" rel="noopener noreferrer">
                                                                    View Attachment
                                                                </a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                        <TableCell>{doubt.session?.subject?.name || '-'}</TableCell>
                                        <TableCell>{doubt.teacher?.user?.name || '-'}</TableCell>
                                        <TableCell>{doubt.session?.class_date_formatted || '-'}</TableCell>
                                        <TableCell>{doubt.uploaded_time_formatted || '-'}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    doubt.status === 'open'
                                                        ? 'default'
                                                        : doubt.status === 'answered'
                                                          ? 'secondary'
                                                          : 'destructive'
                                                }
                                            >
                                                {doubt.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11} className="p-3 text-center text-muted-foreground">
                                        No doubts found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {doubts.total > doubts.per_page && (
                        <div className="mt-4 flex justify-end gap-2">
                            {doubts.links.map(
                                (link: any, i: number) =>
                                    link.url && (
                                        <Button
                                            key={i}
                                            size="sm"
                                            variant={link.active ? 'default' : 'outline'}
                                            onClick={() => router.visit(link.url, { preserveScroll: true })}
                                        >
                                            {link.label.replace('&laquo;', '<<').replace('&raquo;', '>>')}
                                        </Button>
                                    ),
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}


