import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TeacherLayout from '@/layouts/teacher-layout';
import { dashboard } from '@/routes/teacher/';
import { create, edit, index } from '@/routes/teacher/homeworks';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Homeworks', href: index().url },
];

export default function HomeworksIndex() {
    const { homeworks, filters, boards, classes, subjects, batches, csessions, teacher } = usePage().props as {
        homeworks: any;
        filters: any;
        boards: any[];
        classes: any[];
        subjects: any[];
        batches: any[];
        csessions: any[];
        teacher: any | null;
    };
    const [selectedHomework, setSelectedHomework] = useState<any | null>(null);

    const truncate = (text: string, length = 25) => (text.length > length ? text.slice(0, length) + '…' : text);
    // FORM STATES
    const [search, setSearch] = useState(filters?.search || '');
    const [board, setBoard] = useState(filters?.board || '');
    const [clazz, setClazz] = useState(filters?.class || '');
    const [subject, setSubject] = useState(filters?.subject || '');
    const [batch, setBatch] = useState(filters?.batch || '');
    const [csession, setSession] = useState(filters?.csession || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    // Apply filters instantly
    const applyFilters = (extra: any = {}) => {
        router.get(
            index().url,
            {
                search,
                board,
                class: clazz,
                subject,
                batch,
                csession,
                date_from: dateFrom,
                date_to: dateTo,
                ...extra,
            },
            { preserveState: true, preserveScroll: true },
        );
    };
    console.log(homeworks);

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Homeworks" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Homeworks</h1>
                    <Link href={create().url}>
                        <Button>Add Home Work</Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3 lg:grid-cols-6">
                    {/* Search */}
                    <Input
                        placeholder="Search title, description, session or batch..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            applyFilters({ search: e.target.value });
                        }}
                    />

                    {/* Board */}
                    <select
                        value={board}
                        onChange={(e) => {
                            setBoard(e.target.value);
                            applyFilters({ board: e.target.value });
                        }}
                        className="rounded-md border p-2"
                    >
                        <option value="">All Boards</option>
                        {boards.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>

                    {/* Class */}
                    <select
                        value={clazz}
                        onChange={(e) => {
                            setClazz(e.target.value);
                            applyFilters({ class: e.target.value });
                        }}
                        className="rounded-md border p-2"
                    >
                        <option value="">All Classes</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    {/* Subject */}
                    <select
                        value={subject}
                        onChange={(e) => {
                            setSubject(e.target.value);
                            applyFilters({ subject: e.target.value });
                        }}
                        className="rounded-md border p-2"
                    >
                        <option value="">All Subjects</option>
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                    {/* Batch */}
                    <select
                        value={batch}
                        onChange={(e) => {
                            setBatch(e.target.value);
                            applyFilters({ batch: e.target.value });
                        }}
                        className="rounded-md border p-2"
                    >
                        <option value="">All Batches</option>
                        {batches.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.batch_code}
                            </option>
                        ))}
                    </select>

                    {/* Session */}
                    <select
                        value={csession}
                        onChange={(e) => {
                            setSession(e.target.value);
                            applyFilters({ csession: e.target.value });
                        }}
                        className="rounded-md border p-2"
                    >
                        <option value="">All Sessions</option>
                        {csessions.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.topic} — {new Date(s.class_date).toLocaleDateString()}
                            </option>
                        ))}
                    </select>

                    {/* Date From */}
                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            applyFilters({ date_from: e.target.value });
                        }}
                    />

                    {/* Date To */}
                    <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                            setDateTo(e.target.value);
                            applyFilters({ date_to: e.target.value });
                        }}
                    />
                </Card>

                {/* Homeworks Table */}
                <Card className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Board</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Batch</TableHead>
                                <TableHead>Session</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {homeworks && homeworks.data.length > 0 ? (
                                homeworks.data.map((hw: any, i: number) => {
                                    const session = hw.session || null;
                                    const batch = session?.batch || null;
                                    const clazz = batch?.clazz || null;
                                    const board = clazz?.board || null;
                                    const subject = session?.subject || null;

                                    return (
                                        <TableRow key={hw.id}>
                                            <TableCell>{(homeworks.current_page - 1) * homeworks.per_page + (i + 1)}</TableCell>

                                            <TableCell>{board?.name ?? '—'}</TableCell>
                                            <TableCell>{clazz?.name ?? '—'}</TableCell>
                                            <TableCell>{subject?.name ?? '—'}</TableCell>
                                            <TableCell>{batch?.batch_code ?? '—'}</TableCell>
                                            <TableCell>{session?.topic ?? '—'}</TableCell>
                                            <TableCell className="font-medium">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <button
                                                            onClick={() => setSelectedHomework(hw)}
                                                            className="text-left text-blue-600 hover:underline"
                                                        >
                                                            {truncate(hw.title, 25)}
                                                        </button>
                                                    </DialogTrigger>

                                                    <DialogContent className="max-w-lg">
                                                        <DialogHeader>
                                                            <DialogTitle>Homework Details</DialogTitle>
                                                        </DialogHeader>

                                                        <div className="space-y-4 text-sm">
                                                            {/* Full Title */}
                                                            <div>
                                                                <p className="text-xs text-gray-500">Title</p>
                                                                <p className="font-medium text-gray-900">{selectedHomework?.title}</p>
                                                            </div>

                                                            {/* Description */}
                                                            {selectedHomework?.description && (
                                                                <div>
                                                                    <p className="text-xs text-gray-500">Description</p>
                                                                    <p className="leading-relaxed text-gray-800">{selectedHomework.description}</p>
                                                                </div>
                                                            )}

                                                            {/* Attachment */}
                                                            {selectedHomework?.attachment && (
                                                                <Button asChild variant="outline" size="sm">
                                                                    <a
                                                                        href={`/storage/${selectedHomework.attachment}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        View Attachment
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                            <TableCell>{hw.due_date_formatted ? hw.due_date_formatted : '—'}</TableCell>
                                            <TableCell className="text-right">
                                                {hw.can_edit ? (
                                                    <Link href={edit(hw.id).url}>
                                                        <Button size="sm" variant="outline">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="outline">
                                                                Edit
                                                            </Button>
                                                        </AlertDialogTrigger>

                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Editing Not Allowed</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {hw.edit_block_reason ??
                                                                        'You can edit a homework only within 30 minutes of creation.'}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>

                                                            <AlertDialogFooter>
                                                                <AlertDialogAction>OK</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="p-3 text-center">
                                        No homeworks found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {homeworks && homeworks.total > homeworks.per_page && (
                        <div className="mt-4 flex justify-end gap-2">
                            {homeworks.links.map((link: any, idx: number) =>
                                link.url ? (
                                    <Button
                                        key={idx}
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        onClick={() => router.visit(link.url, { preserveScroll: true })}
                                    >
                                        {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                    </Button>
                                ) : null,
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </TeacherLayout>
    );
}
