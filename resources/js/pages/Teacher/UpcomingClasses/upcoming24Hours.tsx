import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import TeacherLayout from '@/layouts/teacher-layout';
import { dashboard, todayClasses } from '@/routes/teacher';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Today Classes', href: todayClasses().url },
];

export default function Upcoming24HoursIndex() {
    const { sessions } = usePage().props as {
        sessions: any;
    };
    console.log(sessions);
    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Today Classes" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <h1 className="text-2xl font-semibold tracking-tight">Today Classes</h1>

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
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {sessions.data.length > 0 ? (
                                sessions.data.map((s: any, i: number) => (
                                    <TableRow key={s.id}>
                                        <TableCell>{(sessions.current_page - 1) * sessions.per_page + (i + 1)}</TableCell>

                                        <TableCell>{s.batch?.batch_code ?? '—'}</TableCell>
                                        <TableCell>{s.clazz?.name ?? '—'}</TableCell>
                                        <TableCell>{s.subject?.name ?? '—'}</TableCell>
                                        <TableCell>{s.topic ?? '—'}</TableCell>
                                        <TableCell>{new Date(s.class_date).toLocaleString()}</TableCell>

                                        <TableCell>
                                            <Badge>{s.status ?? 'Scheduled'}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="p-3 text-center">
                                        No classes today.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
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
                                ) : null,
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </TeacherLayout>
    );
}
