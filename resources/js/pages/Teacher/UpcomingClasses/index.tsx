import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import TeacherLayout from '@/layouts/teacher-layout';
import { dashboard } from '@/routes/teacher/';
import { index } from '@/routes/teacher/upcoming-classes';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Upcoming Classes', href: index().url },
];

export default function UpcomingClassesIndex() {
    const { sessions, filters, classes, subjects, batchesList, teacher } = usePage().props as {
        sessions: any;
        filters: any;
        classes: any[];
        subjects: any[];
        batchesList: any[];
        teacher: any | null;
    };

    const [search, setSearch] = useState(filters?.search || '');
    const [clazz, setClazz] = useState(filters?.class || '');
    const [subject, setSubject] = useState(filters?.subject || '');
    const [batch, setBatch] = useState(filters?.batch || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    const applyFilters = (extra: any = {}) => {
        router.get(
            index().url,
            {
                search,
                class: clazz,
                subject,
                batch,
                date_from: dateFrom,
                date_to: dateTo,
                ...extra,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Upcoming Classes" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <h1 className="text-2xl font-semibold tracking-tight">Upcoming Classes</h1>

                {/* Filters */}
                <Card className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3 lg:grid-cols-6">
                    <Input
                        placeholder="Search by topic or batch code..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            applyFilters({ search: e.target.value });
                        }}
                    />

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
                            <option value={c.id} key={c.id}>{c.name}</option>
                        ))}
                    </select>

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
                            <option value={s.id} key={s.id}>{s.name}</option>
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
                        {batchesList.map((b) => (
                            <option value={b.id} key={b.id}>{b.batch_code}</option>
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
                                <TableHead>Batch</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Topic</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {sessions.data.length > 0 ? (
                                sessions.data.map((s: any, i: number) => (
                                    <TableRow key={s.id}>
                                        <TableCell>{(sessions.current_page - 1) * sessions.per_page + (i + 1)}</TableCell>
                                        <TableCell>{s.batch?.batch_code ?? '—'}</TableCell>
                                        <TableCell>{s.batch?.clazz?.name ?? '—'}</TableCell>
                                        <TableCell>{s.subject?.name ?? '—'}</TableCell>
                                        <TableCell>{s.topic ?? '—'}</TableCell>
                                        <TableCell>{new Date(s.class_date).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="p-3 text-center">
                                        No upcoming classes found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {sessions.total > sessions.per_page && (
                        <div className="mt-4 flex justify-end gap-2">
                            {sessions.links.map((link: any, idx: number) =>
                                link.url ? (
                                    <Button
                                        key={idx}
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        onClick={() => router.visit(link.url, { preserveScroll: true })}
                                    >
                                        {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                    </Button>
                                ) : null
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </TeacherLayout>
    );
}
