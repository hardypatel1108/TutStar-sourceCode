import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

type BreakdownItem = {
    status: string;
    total: number;
};

type Analytics = {
    generated_at: string;
    kpis: {
        students_total: number;
        teachers_total: number;
        batches_total: number;
        active_batches: number;
        sessions_today: number;
        upcoming_sessions: number;
        completed_sessions_30_days: number;
        open_doubts: number;
        pending_enrollments: number;
        homeworks_30_days: number;
        active_subscriptions: number;
        payments_this_month: number;
        payments_count_this_month: number;
    };
    sessions_by_day: Array<{
        date: string;
        label: string;
        total: number;
    }>;
    revenue_trend: Array<{
        month_key: string;
        month_label: string;
        amount: number;
        payments_count: number;
    }>;
    top_teachers: Array<{
        id: number;
        name: string;
        sessions_next_7_days: number;
        completed_sessions_30_days: number;
        homeworks_30_days: number;
    }>;
    top_batches: Array<{
        id: number;
        batch_code: string;
        class_name: string;
        subject_name: string;
        teacher_name: string;
        students_limit: number;
        current_students_count: number;
        upcoming_sessions_count: number;
        occupancy_percent: number;
    }>;
    class_distribution: Array<{
        id: number;
        name: string;
        students_count: number;
    }>;
    session_status_breakdown: BreakdownItem[];
    payment_status_breakdown: BreakdownItem[];
    batch_status_breakdown: BreakdownItem[];
    doubt_status_breakdown: BreakdownItem[];
    monthly_activity: Array<{
        month_key: string;
        month_label: string;
        sessions_completed: number;
        homeworks_created: number;
        doubts_raised: number;
    }>;
    enrollment_flow: {
        completed_payments: number;
        unresolved_pending: number;
        completed_payments_missing_downstream: number;
        expired_but_active_batch_allocations: number;
        active_batch_without_subscription: number;
    };
};

type DashboardProps = {
    analytics?: Analytics;
    filters?: {
        range: string;
        board: string;
        class: string;
        teacher: string;
    };
    boards?: Array<{ id: number; name: string }>;
    classes?: Array<{ id: number; name: string; board_id: number }>;
    teachers?: Array<{ id: number; name: string }>;
};

const fallbackAnalytics: Analytics = {
    generated_at: '-',
    kpis: {
        students_total: 0,
        teachers_total: 0,
        batches_total: 0,
        active_batches: 0,
        sessions_today: 0,
        upcoming_sessions: 0,
        completed_sessions_30_days: 0,
        open_doubts: 0,
        pending_enrollments: 0,
        homeworks_30_days: 0,
        active_subscriptions: 0,
        payments_this_month: 0,
        payments_count_this_month: 0,
    },
    sessions_by_day: [],
    revenue_trend: [],
    top_teachers: [],
    top_batches: [],
    class_distribution: [],
    session_status_breakdown: [],
    payment_status_breakdown: [],
    batch_status_breakdown: [],
    doubt_status_breakdown: [],
    monthly_activity: [],
    enrollment_flow: {
        completed_payments: 0,
        unresolved_pending: 0,
        completed_payments_missing_downstream: 0,
        expired_but_active_batch_allocations: 0,
        active_batch_without_subscription: 0,
    },
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function getMaxValue(items: number[]): number {
    return Math.max(...items, 1);
}

function statusLabel(value: string): string {
    return value.replaceAll('_', ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}

function StatusDonutChart({ items }: { items: BreakdownItem[] }) {
    const colors = ['#2563eb', '#16a34a', '#f97316', '#dc2626', '#7c3aed', '#0891b2'];
    const [activeIndex, setActiveIndex] = useState(0);

    const total = Math.max(
        items.reduce((sum, item) => sum + item.total, 0),
        1,
    );
    const radius = 64;
    const stroke = 26;
    const circumference = 2 * Math.PI * radius;

    let runningOffset = 0;
    const segments = items.map((item, index) => {
        const pct = item.total / total;
        const length = pct * circumference;
        const segment = {
            ...item,
            color: colors[index % colors.length],
            strokeDasharray: `${length} ${Math.max(circumference - length, 0)}`,
            strokeDashoffset: -runningOffset,
            percent: Math.round(pct * 100),
        };
        runningOffset += length;
        return segment;
    });

    const active = segments[activeIndex] ?? null;

    return (
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <div className="flex items-center justify-center">
                <svg viewBox="0 0 180 180" className="h-44 w-44 -rotate-90">
                    <circle cx="90" cy="90" r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
                    {segments.map((segment, index) => (
                        <circle
                            key={`${segment.status}-${index}`}
                            cx="90"
                            cy="90"
                            r={radius}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={segment.strokeDasharray}
                            strokeDashoffset={segment.strokeDashoffset}
                            className="cursor-pointer transition-all duration-300"
                            style={{ opacity: index === activeIndex ? 1 : 0.7, transformOrigin: '90px 90px' }}
                            onMouseEnter={() => setActiveIndex(index)}
                        />
                    ))}
                </svg>
                <div className="absolute text-center">
                    <div className="text-xs text-muted-foreground">Selected</div>
                    <div className="text-sm font-semibold">{active ? statusLabel(active.status) : '-'}</div>
                    <div className="text-lg font-bold">{active ? active.total : 0}</div>
                </div>
            </div>
            <div className="space-y-2">
                {segments.map((item, index) => (
                    <button
                        key={`${item.status}-${index}`}
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`flex w-full items-center justify-between rounded-md border p-2 text-left transition ${
                            index === activeIndex ? 'border-primary bg-accent/50' : ''
                        }`}
                    >
                        <span className="flex items-center gap-2 text-sm">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                            {statusLabel(item.status)}
                        </span>
                        <span className="text-sm font-semibold">
                            {item.total} ({item.percent}%)
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function VerticalBarChart({
    items,
    color,
}: {
    items: Array<{ label: string; value: number; hint?: string }>;
    color: string;
}) {
    const max = getMaxValue(items.map((item) => item.value));

    return (
        <div className="space-y-2">
            <div className="grid h-52 grid-cols-6 items-end gap-2">
                {items.map((item) => {
                    const height = Math.max((item.value / max) * 100, item.value > 0 ? 8 : 2);
                    return (
                        <div key={item.label} className="group flex h-full flex-col items-center justify-end gap-2">
                            <div
                                title={item.hint ?? `${item.label}: ${item.value}`}
                                className="w-full rounded-t-md transition-all duration-700 group-hover:brightness-110"
                                style={{ height: `${height}%`, backgroundColor: color }}
                            />
                            <div className="text-[11px] text-muted-foreground">{item.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function LineAreaChart({
    items,
    color,
    valueFormatter,
}: {
    items: Array<{ label: string; value: number }>;
    color: string;
    valueFormatter?: (value: number) => string;
}) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const width = 520;
    const height = 220;
    const padding = 24;
    const max = getMaxValue(items.map((item) => item.value));

    const points = items.map((item, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(items.length - 1, 1);
        const y = height - padding - (item.value / max) * (height - padding * 2);
        return { ...item, x, y };
    });

    const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? width - padding} ${height - padding} L ${points[0]?.x ?? padding} ${
        height - padding
    } Z`;
    const active = activeIndex === null ? null : points[activeIndex];

    return (
        <div className="space-y-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
                <path d={areaPath} fill={color} fillOpacity={0.2} />
                <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
                {points.map((point, index) => (
                    <circle
                        key={`${point.label}-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r={activeIndex === index ? 6 : 4}
                        fill={color}
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setActiveIndex(index)}
                    />
                ))}
            </svg>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{active ? active.label : items[items.length - 1]?.label}</span>
                <span className="font-semibold text-foreground">
                    {valueFormatter ? valueFormatter(active ? active.value : items[items.length - 1]?.value ?? 0) : active?.value ?? items[items.length - 1]?.value}
                </span>
            </div>
        </div>
    );
}

function StackedBarChart({
    rows,
}: {
    rows: Array<{
        label: string;
        sessions: number;
        homeworks: number;
        doubts: number;
    }>;
}) {
    const max = getMaxValue(rows.map((row) => row.sessions + row.homeworks + row.doubts));

    return (
        <div className="space-y-3">
            {rows.map((row) => {
                const sessionsPct = ((row.sessions / max) * 100).toFixed(2);
                const homeworksPct = ((row.homeworks / max) * 100).toFixed(2);
                const doubtsPct = ((row.doubts / max) * 100).toFixed(2);

                return (
                    <div key={row.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className="font-medium">{row.sessions + row.homeworks + row.doubts}</span>
                        </div>
                        <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                            <div className="transition-all duration-700" style={{ width: `${sessionsPct}%`, backgroundColor: '#2563eb' }} />
                            <div className="transition-all duration-700" style={{ width: `${homeworksPct}%`, backgroundColor: '#16a34a' }} />
                            <div className="transition-all duration-700" style={{ width: `${doubtsPct}%`, backgroundColor: '#f97316' }} />
                        </div>
                    </div>
                );
            })}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    Sessions
                </span>
                <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    Homework
                </span>
                <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    Doubts
                </span>
            </div>
        </div>
    );
}

export default function Dashboard({ analytics, filters, boards, classes, teachers }: DashboardProps) {
    const safeAnalytics = analytics ?? fallbackAnalytics;
    const safeFilters = filters ?? { range: '30d', board: '', class: '', teacher: '' };
    const safeBoards = boards ?? [];
    const safeClasses = classes ?? [];
    const safeTeachers = teachers ?? [];

    const {
        kpis,
        sessions_by_day,
        revenue_trend,
        top_teachers,
        top_batches,
        class_distribution,
        session_status_breakdown,
        payment_status_breakdown,
        batch_status_breakdown,
        doubt_status_breakdown,
        monthly_activity,
        enrollment_flow,
    } = safeAnalytics;

    const [donutMode, setDonutMode] = useState<'sessions' | 'payments' | 'batches' | 'doubts'>('sessions');
    const [range, setRange] = useState(safeFilters.range || '30d');
    const [boardId, setBoardId] = useState(safeFilters.board || '');
    const [classId, setClassId] = useState(safeFilters.class || '');
    const [teacherId, setTeacherId] = useState(safeFilters.teacher || '');

    const donutData = useMemo(() => {
        if (donutMode === 'sessions') return session_status_breakdown;
        if (donutMode === 'payments') return payment_status_breakdown;
        if (donutMode === 'batches') return batch_status_breakdown;
        return doubt_status_breakdown;
    }, [batch_status_breakdown, donutMode, doubt_status_breakdown, payment_status_breakdown, session_status_breakdown]);

    const classDistMax = getMaxValue(class_distribution.map((item) => item.students_count));

    const applyFilters = (next: Partial<{ range: string; board: string; class: string; teacher: string }> = {}) => {
        const params = {
            range,
            board: boardId,
            class: classId,
            teacher: teacherId,
            ...next,
        };

        router.get('/admin/dashboard', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setRange('30d');
        setBoardId('');
        setClassId('');
        setTeacherId('');
        router.get(
            '/admin/dashboard',
            { range: '30d', board: '', class: '', teacher: '' },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h1 className="text-xl font-semibold">Admin Analytics</h1>
                    <Badge variant="secondary">Updated: {safeAnalytics.generated_at}</Badge>
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Refine dashboard analytics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-end gap-2">
                            <div className="flex min-w-40 flex-col gap-1">

                                <select title="Select"
                                    value={range}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setRange(value);
                                        applyFilters({ range: value });
                                    }}
                                    className="rounded-md border border-input bg-background p-2 text-sm"
                                >
                                    <option value="7d">Last 7 Days</option>
                                    <option value="30d">Last 30 Days</option>
                                    <option value="90d">Last 90 Days</option>
                                    <option value="180d">Last 180 Days</option>
                                </select>
                            </div>

                            <div className="flex min-w-40 flex-col gap-1">

                                <select title="Select"
                                    value={boardId}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setBoardId(value);
                                        setClassId('');
                                        applyFilters({ board: value, class: '' });
                                    }}
                                    className="rounded-md border border-input bg-background p-2 text-sm"
                                >
                                    <option value="">All Boards</option>
                                    {safeBoards.map((board) => (
                                        <option key={board.id} value={board.id}>
                                            {board.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex min-w-40 flex-col gap-1">

                                <select title="Select"
                                    value={classId}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setClassId(value);
                                        applyFilters({ class: value });
                                    }}
                                    className="rounded-md border border-input bg-background p-2 text-sm"
                                >
                                    <option value="">All Classes</option>
                                    {safeClasses.map((clazz) => (
                                        <option key={clazz.id} value={clazz.id}>
                                            {clazz.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex min-w-48 flex-col gap-1">

                                <select title="Select"
                                    value={teacherId}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setTeacherId(value);
                                        applyFilters({ teacher: value });
                                    }}
                                    className="rounded-md border border-input bg-background p-2 text-sm"
                                >
                                    <option value="">All Teachers</option>
                                    {safeTeachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex min-w-32 flex-col gap-1">
                                <label className="text-sm font-medium opacity-0">Clear</label>
                                <Button type="button" variant="outline" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Total Students</CardDescription>
                            <CardTitle>{kpis.students_total}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">Active subs: {kpis.active_subscriptions}</CardContent>
                    </Card>
                    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Total Teachers</CardDescription>
                            <CardTitle>{kpis.teachers_total}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">Open doubts: {kpis.open_doubts}</CardContent>
                    </Card>
                    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Batches</CardDescription>
                            <CardTitle>
                                {kpis.active_batches} <span className="text-sm font-normal text-muted-foreground">active / {kpis.batches_total} total</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">Pending enrollments: {kpis.pending_enrollments}</CardContent>
                    </Card>
                    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Revenue This Month</CardDescription>
                            <CardTitle>{formatCurrency(kpis.payments_this_month)}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Completed payments: {kpis.payments_count_this_month}
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-dashed">
                    <CardHeader className="pb-2">
                        <CardTitle>Enrollment Flow Health</CardTitle>
                        <CardDescription>Payment to pending to subscription to batch consistency</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">Completed Payments</div>
                                <div className="text-xl font-semibold">{enrollment_flow.completed_payments}</div>
                            </div>
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">Unresolved Pending</div>
                                <div className="text-xl font-semibold">{enrollment_flow.unresolved_pending}</div>
                            </div>
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">Missing Downstream</div>
                                <div className="text-xl font-semibold">{enrollment_flow.completed_payments_missing_downstream}</div>
                            </div>
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">Expired But Active</div>
                                <div className="text-xl font-semibold">{enrollment_flow.expired_but_active_batch_allocations}</div>
                            </div>
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">Active Without Subscription</div>
                                <div className="text-xl font-semibold">{enrollment_flow.active_batch_without_subscription}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Mix (Pie/Donut)</CardTitle>
                            <CardDescription>Interactive breakdown by module</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant={donutMode === 'sessions' ? 'default' : 'outline'} onClick={() => setDonutMode('sessions')}>
                                    Sessions
                                </Button>
                                <Button size="sm" variant={donutMode === 'payments' ? 'default' : 'outline'} onClick={() => setDonutMode('payments')}>
                                    Payments
                                </Button>
                                <Button size="sm" variant={donutMode === 'batches' ? 'default' : 'outline'} onClick={() => setDonutMode('batches')}>
                                    Batches
                                </Button>
                                <Button size="sm" variant={donutMode === 'doubts' ? 'default' : 'outline'} onClick={() => setDonutMode('doubts')}>
                                    Doubts
                                </Button>
                            </div>
                            <StatusDonutChart items={donutData} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sessions Next 7 Days (Bar)</CardTitle>
                            <CardDescription>Daily class load</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VerticalBarChart
                                items={sessions_by_day.map((item) => ({ label: item.label, value: item.total, hint: `${item.date}: ${item.total}` }))}
                                color="#2563eb"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Trend (Line/Area)</CardTitle>
                            <CardDescription>Completed payments in last 6 months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LineAreaChart
                                items={revenue_trend.map((item) => ({ label: item.month_label, value: item.amount }))}
                                color="#16a34a"
                                valueFormatter={formatCurrency}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Academic Activity (Stacked)</CardTitle>
                            <CardDescription>Sessions + homework + doubts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StackedBarChart
                                rows={monthly_activity.map((item) => ({
                                    label: item.month_label,
                                    sessions: item.sessions_completed,
                                    homeworks: item.homeworks_created,
                                    doubts: item.doubts_raised,
                                }))}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <Card className="xl:col-span-1">
                        <CardHeader>
                            <CardTitle>Top Teachers</CardTitle>
                            <CardDescription>By upcoming sessions in next 7 days</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {top_teachers.length === 0 && <div className="text-sm text-muted-foreground">No teacher data found.</div>}
                            {top_teachers.map((teacher) => (
                                <div key={teacher.id} className="rounded-md border p-3 transition-all duration-300 hover:bg-accent/50">
                                    <div className="font-medium">{teacher.name}</div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        Upcoming: {teacher.sessions_next_7_days} | Completed(30d): {teacher.completed_sessions_30_days} | Homework(30d):{' '}
                                        {teacher.homeworks_30_days}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle>Top Batches By Occupancy</CardTitle>
                            <CardDescription>Current students vs batch limit</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {top_batches.length === 0 && <div className="text-sm text-muted-foreground">No batch data found.</div>}
                            {top_batches.map((batch) => (
                                <div key={batch.id} className="rounded-md border p-3 transition-all duration-300 hover:bg-accent/40">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="font-medium">{batch.batch_code}</div>
                                        <Badge variant="outline">{batch.occupancy_percent}% occupied</Badge>
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        {batch.class_name} | {batch.subject_name} | {batch.teacher_name}
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded bg-muted">
                                        <div
                                            className="h-full rounded bg-orange-500 transition-all duration-700"
                                            style={{ width: `${Math.max(batch.occupancy_percent, batch.occupancy_percent > 0 ? 4 : 0)}%` }}
                                        />
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        Students: {batch.current_students_count}/{batch.students_limit || '-'} | Upcoming Sessions: {batch.upcoming_sessions_count}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Class-wise Student Distribution</CardTitle>
                        <CardDescription>Top classes by student count</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {class_distribution.length === 0 && <div className="text-sm text-muted-foreground">No class data found.</div>}
                        {class_distribution.map((clazz) => (
                            <div key={clazz.id} className="flex items-center gap-3">
                                <div className="w-28 text-sm">{clazz.name}</div>
                                <div className="h-2 flex-1 overflow-hidden rounded bg-muted">
                                    <div
                                        className="h-full rounded bg-violet-500 transition-all duration-700"
                                        style={{ width: `${Math.max((clazz.students_count / classDistMax) * 100, clazz.students_count > 0 ? 6 : 0)}%` }}
                                    />
                                </div>
                                <div className="w-10 text-right text-sm">{clazz.students_count}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

