import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import TeacherLayout from '@/layouts/teacher-layout';
import { dashboard } from '@/routes/teacher/';
import { index } from '@/routes/teacher/allotted-batches';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Batches', href: index().url },
];

export default function BatchesIndex() {
    const { batches, filters, classes, subjects, plans } = usePage().props as {
        batches: any;
        filters: any;
        classes: any[];
        subjects: any[];
        plans: any[];
    };

    // FORM STATES
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [clazz, setClazz] = useState(filters?.class || '');
    const [subject, setSubject] = useState(filters?.subject || '');
    const [plan, setPlan] = useState(filters?.plan || '');

    const applyFilters = (extra: any = {}) => {
        router.get(
            index().url,
            {
                search,
                status,
                class: clazz,
                subject,
                plan,
                ...extra,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Batches" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Batches</h1>
                </div>

                {/* Filters */}
                <Card className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3 lg:grid-cols-6">
                    <Input
                        placeholder="Search by batch code..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            applyFilters({ search: e.target.value });
                        }}
                    />

                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            applyFilters({ status: e.target.value });
                        }}
                        className="rounded-md border p-2"
                    >
                        <option value="all">All Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="completed">Completed</option>
                    </select>

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
                            <option value={c.id} key={c.id}>
                                {c.name}
                            </option>
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
                            <option value={s.id} key={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={plan}
                        onChange={(e) => {
                            setPlan(e.target.value);
                            applyFilters({ plan: e.target.value });
                        }}
                        className="rounded-md border p-2"
                    >
                        <option value="">All Plans</option>
                        {plans.map((p) => (
                            <option value={p.id} key={p.id}>
                                {p.title}
                            </option>
                        ))}
                    </select>
                </Card>

                {/* Table */}
                <Card className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Batch Code</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {batches.data.length > 0 ? (
                                batches.data.map((batch: any, i: number) => (
                                    <TableRow key={batch.id}>
                                        <TableCell>{(batches.current_page - 1) * batches.per_page + (i + 1)}</TableCell>
                                        <TableCell className="font-medium">{batch.batch_code}</TableCell>
                                        <TableCell>{batch.plan?.title ?? '—'}</TableCell>
                                        <TableCell>{batch.clazz?.name ?? '—'}</TableCell>
                                        <TableCell>{batch.subject?.name ?? '—'}</TableCell>
                                        <TableCell>{batch.students_count} / {batch.students_limit}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    batch.status === 'active'
                                                        ? 'success'
                                                        : batch.status === 'upcoming'
                                                          ? 'default'
                                                          : batch.status === 'completed'
                                                            ? 'secondary'
                                                            : 'destructive'
                                                }
                                            >
                                                {batch.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(batch.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="p-3 text-center">
                                        No batches found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {batches.total > batches.per_page && (
                        <div className="mt-4 flex justify-end gap-2">
                            {batches.links.map((link: any, idx: number) =>
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

//  <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:size-12 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
//             <Avatar>
//               <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
//               <AvatarFallback>CN</AvatarFallback>
//             </Avatar>
//             <Avatar>
//               <AvatarImage
//                 src="https://github.com/maxleiter.png"
//                 alt="@maxleiter"
//               />
//               <AvatarFallback>LR</AvatarFallback>
//             </Avatar>
//             <Avatar>
//               <AvatarImage
//                 src="https://github.com/evilrabbit.png"
//                 alt="@evilrabbit"
//               />
//               <AvatarFallback>ER</AvatarFallback>
//             </Avatar>
//           </div>
