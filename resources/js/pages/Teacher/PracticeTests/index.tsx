import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TeacherLayout from '@/layouts/teacher-layout';
import { dashboard } from '@/routes/teacher/';
import { create, edit, index } from '@/routes/teacher/practiceTests';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Practice Tests', href: index().url },
];

export default function PracticeTestsIndex() {
    const { practicetests, filters, subjects, batches } = usePage().props as {
        practicetests: any;
        filters: any;
        subjects: any[];
        batches: any[];
    };

    const truncate = (text: string, length = 25) => (text.length > length ? text.slice(0, length) + '…' : text);

    const [search, setSearch] = useState(filters?.search || '');
    const [subject, setSubject] = useState(filters?.subject || '');
    const [batch, setBatch] = useState(filters?.batch || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    const applyFilters = (extra: any = {}) => {
        router.get(
            index().url,
            {
                search,
                subject,
                batch,
                date_from: dateFrom,
                date_to: dateTo,
                ...extra,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Practice Tests" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Practice Tests</h1>
                    <Link href={create().url}>
                        <Button>Add</Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3 lg:grid-cols-5">
                    <Input
                        placeholder="Search title or description..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            applyFilters({ search: e.target.value });
                        }}
                    />

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

                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            applyFilters({ date_from: e.target.value });
                        }}
                    />

                    <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                            setDateTo(e.target.value);
                            applyFilters({ date_to: e.target.value });
                        }}
                    />
                </Card>

                {/* Table */}
                <Card className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Board</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Batch</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {practicetests?.data?.length ? (
                                practicetests.data.map((pt: any, i: number) => {
                                    const batch = pt.batch;
                                    const clazz = batch?.clazz;
                                    const board = clazz?.board;
                                    const subject = batch?.subject;

                                    return (
                                        <TableRow key={pt.id}>
                                            <TableCell>{(practicetests.current_page - 1) * practicetests.per_page + i + 1}</TableCell>

                                            <TableCell>{board?.name ?? '—'}</TableCell>
                                            <TableCell>{clazz?.name ?? '—'}</TableCell>
                                            <TableCell>{subject?.name ?? '—'}</TableCell>
                                            <TableCell>{batch?.batch_code ?? '—'}</TableCell>

                                            <TableCell className="font-medium">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <button className="text-blue-600 hover:underline">{truncate(pt.title)}</button>
                                                    </DialogTrigger>

                                                    <DialogContent className="max-w-lg">
                                                        <DialogHeader>
                                                            <DialogTitle>Practice Test Details</DialogTitle>
                                                        </DialogHeader>

                                                        <div className="space-y-3 text-sm">
                                                            <p>
                                                                <strong>Title:</strong> {pt.title}
                                                            </p>
                                                            {pt.description && <p>{pt.description}</p>}
                                                            {pt.due_date_formatted && <p>{pt.due_date_formatted}</p>}
                                                            {pt.attachment && (
                                                                <Button asChild variant="outline" size="sm">
                                                                    <a href={`/storage/${pt.attachment}`} target="_blank" rel="noopener noreferrer">
                                                                        View Attachment
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>

                                            <TableCell className="text-right">
                                                {pt.can_edit ? (
                                                    <Link href={edit(pt.id).url}>
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
                                                                <AlertDialogDescription>{pt.edit_block_reason}</AlertDialogDescription>
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
                                    <TableCell colSpan={7} className="p-4 text-center">
                                        No practice tests found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </TeacherLayout>
    );
}
