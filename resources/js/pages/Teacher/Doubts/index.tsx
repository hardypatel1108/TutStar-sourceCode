import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import TeacherLayout from '@/layouts/teacher-layout';
import { dashboard } from '@/routes/teacher/';
import { index, update as updateDoubt } from '@/routes/teacher/doubts';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Doubts', href: index().url },
];

export default function DoubtsIndex() {
    const pageProps = usePage().props as Record<string, unknown>;

    const doubts = (pageProps.doubts as any) ?? {
        data: [],
        current_page: 1,
        per_page: 10,
        total: 0,
        links: [],
    };

    const filters = (pageProps.filters && typeof pageProps.filters === 'object' ? pageProps.filters : {}) as any;
    const classes = (Array.isArray(pageProps.classes) ? pageProps.classes : []) as any[];
    const csessions = (Array.isArray(pageProps.csessions) ? pageProps.csessions : []) as any[];
    const students = (Array.isArray(pageProps.students) ? pageProps.students : []) as any[];

    const filterString = (key: string, fallback = ''): string => {
        const value = filters?.[key];
        return typeof value === 'string' ? value : fallback;
    };

    const [selectedDoubt, setSelectedDoubt] = useState<any | null>(null);
    // FORM STATES
    const [search, setSearch] = useState(filterString('search'));
    const [status, setStatus] = useState(filterString('status', 'all'));
    const [clazz, setClazz] = useState(filterString('class'));
    const [csession, setCSession] = useState(filterString('csession'));
    const [student, setStudent] = useState(filterString('student'));
    const [dateFrom, setDateFrom] = useState(filterString('date_from'));
    const [dateTo, setDateTo] = useState(filterString('date_to'));
    const [urgency, setUrgency] = useState(filterString('urgency', 'all'));
    const [sort, setSort] = useState(filterString('sort', 'latest'));

    const updateStatus = (id: number, nextStatus: 'open' | 'answered' | 'closed') => {
        router.put(
            updateDoubt({ doubt: id }).url,
            { status: nextStatus },
            { preserveScroll: true, preserveState: true },
        );
    };

    // Apply filters instantly
    const applyFilters = (extra: any = {}) => {
        router.get(
            index().url,
            {
                search,
                status,
                class: clazz,
                csession,
                student,
                date_from: dateFrom,
                date_to: dateTo,
                urgency,
                sort,
                ...extra,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const slaStyle = (bucket?: string) => {
        if (bucket === 'critical') return 'bg-rose-100 text-rose-700';
        if (bucket === 'high') return 'bg-amber-100 text-amber-700';
        if (bucket === 'medium') return 'bg-blue-100 text-blue-700';
        if (bucket === 'low') return 'bg-emerald-100 text-emerald-700';
        return 'bg-slate-100 text-slate-700';
    };

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Doubts" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Doubts</h1>
                </div>

                {/* Filters */}
                <Card className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3 lg:grid-cols-6">
                    {/* Search */}
                    <Input
                        placeholder="Search question..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            applyFilters({ search: e.target.value });
                        }}
                    />

                    {/* Status */}
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            applyFilters({ status: e.target.value });
                        }}
                        className="rounded-md border p-2"
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="answered">Answered</option>
                        <option value="closed">Closed</option>
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
                            <option value={c.id} key={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    {/* Session */}
                    <select
                        value={csession}
                        onChange={(e) => {
                            setCSession(e.target.value);
                            applyFilters({ csession: e.target.value });
                        }}
                        className="rounded-md border p-2"
                    >
                        <option value="">All Sessions</option>
                        {csessions.map((s) => (
                            <option value={s.id} key={s.id}>
                                {s.topic}
                            </option>
                        ))}
                    </select>

                    {/* Student */}
                    <select
                        value={student}
                        onChange={(e) => {
                            setStudent(e.target.value);
                            applyFilters({ student: e.target.value });
                        }}
                        className="rounded-md border p-2"
                    >
                        <option value="">All Students</option>
                        {students.map((st) => (
                            <option value={st.id} key={st.id}>
                                {st.user?.name}
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

                    <select
                        value={urgency}
                        onChange={(e) => {
                            setUrgency(e.target.value);
                            applyFilters({ urgency: e.target.value });
                        }}
                        className="rounded-md border p-2"
                    >
                        <option value="all">All Urgency</option>
                        <option value="critical">Critical (&gt;=24h)</option>
                        <option value="high">High (8-24h)</option>
                        <option value="medium">Medium (2-8h)</option>
                        <option value="low">Low (&lt;2h)</option>
                    </select>

                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            applyFilters({ sort: e.target.value });
                        }}
                        className="rounded-md border p-2"
                    >
                        <option value="latest">Sort: Latest</option>
                        <option value="urgency">Sort: Urgency</option>
                    </select>
                </Card>

                {/* Table */}
                <Card className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Question</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Session</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>SLA</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {(doubts?.data ?? []).length > 0 ? (
                                (doubts?.data ?? []).map((d: any, i: number) => (
                                    <TableRow key={d.id}>
                                        <TableCell>{(doubts.current_page - 1) * doubts.per_page + (i + 1)}</TableCell>
                                        <TableCell className="font-medium">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button onClick={() => setSelectedDoubt(d)} className="text-left text-blue-600 hover:underline">
                                                        {d.question.length > 40 ? d.question.slice(0, 40) + '…' : d.question}
                                                    </button>
                                                </DialogTrigger>

                                                <DialogContent className="max-w-lg">
                                                    <DialogHeader>
                                                        <DialogTitle>Doubt Details</DialogTitle>
                                                    </DialogHeader>

                                                    <div className="space-y-4 text-sm">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Question</p>
                                                            <p className="leading-relaxed">{selectedDoubt?.question}</p>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-gray-500">Student</p>
                                                            <p>{selectedDoubt?.student?.user?.name}</p>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-gray-500">Session</p>
                                                            <p>{selectedDoubt?.session?.topic}</p>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-gray-500">Status</p>
                                                            <Badge>{selectedDoubt?.status}</Badge>
                                                        </div>

                                                        {selectedDoubt?.attachment && (
                                                            <Button asChild variant="outline" size="sm">
                                                                <a
                                                                    href={`/storage/${selectedDoubt.attachment}`}
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
                                        <TableCell>{d.student?.user?.name}</TableCell>
                                        <TableCell>{d.session?.topic}</TableCell>
                                        <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge className={slaStyle(d.sla_bucket)}>
                                                {d.sla_bucket === 'none' ? '-' : `${d.sla_bucket} (${d.sla_age_hours ?? 0}h)`}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={d.status === 'open' ? 'default' : d.status === 'answered' ? 'success' : 'destructive'}>
                                                {d.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <select
                                                value={d.status}
                                                onChange={(e) => updateStatus(d.id, e.target.value as 'open' | 'answered' | 'closed')}
                                                className="rounded-md border p-2 text-sm"
                                            >
                                                <option value="open">Open</option>
                                                <option value="answered">Answered</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="p-3 text-center">
                                        No doubts found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {(doubts?.total ?? 0) > (doubts?.per_page ?? 10) && (
                        <div className="mt-4 flex justify-end gap-2">
                            {(doubts?.links ?? []).map((link: any, idx: number) =>
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
