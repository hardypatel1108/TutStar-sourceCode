import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { dashboard as dashboardindex } from '@/routes/admin';
import { index } from '@/routes/admin/practiceTests';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs = [
    { title: 'Dashboard', href: dashboardindex().url },
    { title: 'Practice Tests', href: index().url },
];

type PracticeTestItem = {
    id: number;
    title: string;
    due_date_formatted?: string | null;
    posted_time_formatted?: string | null;
    batch?: {
        id: number;
        name?: string;
        students_limit?: number;
        current_students_count?: number;
        clazz?: { id: number; name: string };
        subject?: { id: number; name: string };
        teacher?: { id: number; user?: { name?: string } };
    };
    related_session?: {
        topic?: string;
        status?: string;
        class_date_formatted?: string;
        class_time_range?: string;
        time_slot?: string;
        meeting?: { duration?: number; description?: string | null };
    };
};

export default function Index() {
    const { practiceTests, filters, teachers, batches, subjects } = usePage().props as {
        practiceTests: any;
        filters: any;
        teachers: { id: number; user?: { name?: string } }[];
        batches: { id: number; name: string }[];
        subjects: { id: number; name: string }[];
    };

    const [search, setSearch] = useState(filters.search || '');
    const [batchId, setBatchId] = useState(filters.batch || '');
    const [subjectId, setSubjectId] = useState(filters.subject || '');
    const [teacherId, setTeacherId] = useState(filters.teacher || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilterChange = (type: string, value: string) => {
        const params: Record<string, string> = {
            search,
            batch: batchId,
            subject: subjectId,
            teacher: teacherId,
            start_date: startDate,
            end_date: endDate,
        };
        params[type] = value;
        router.get(index().url, params, { preserveState: true, preserveScroll: true });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Practice Tests" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Practice Tests</h1>
                </div>

                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine practice tests</p>
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                        <div className="flex flex-col gap-1">

                            <Input
                                title="Search by practice test title..." placeholder="Search by practice test title..."
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
                                <TableHead>Practice Test</TableHead>
                                <TableHead>Batch</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Posted Time</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {practiceTests.data.length > 0 ? (
                                practiceTests.data.map((pt: PracticeTestItem, idx: number) => (
                                    <TableRow key={pt.id}>
                                        <TableCell>{(practiceTests.current_page - 1) * practiceTests.per_page + (idx + 1)}</TableCell>
                                        <TableCell className="font-medium">{pt.title || '-'}</TableCell>
                                        <TableCell>{pt.batch?.name || '-'}</TableCell>
                                        <TableCell>{pt.batch?.clazz?.name || '-'}</TableCell>
                                        <TableCell>{pt.batch?.subject?.name || '-'}</TableCell>
                                        <TableCell>{pt.batch?.teacher?.user?.name || '-'}</TableCell>
                                        <TableCell>{pt.due_date_formatted || '-'}</TableCell>
                                        <TableCell>{pt.posted_time_formatted || '-'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-4 text-center text-muted-foreground">
                                        No practice tests found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {practiceTests.total > practiceTests.per_page && (
                        <div className="flex justify-end space-x-2 p-4">
                            {practiceTests.links.map((link: any, idx: number) =>
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


