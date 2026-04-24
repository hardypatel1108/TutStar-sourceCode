import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TeacherLayout from '@/layouts/teacher-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { BookOpenCheck, CalendarDays, CheckCircle2, CircleHelp, Layers3, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type BreakdownItem = { status: string; total: number };
type ScheduleItem = { day: string; label: string; total: number };
type BatchStrengthItem = {
    id: number;
    batch_code: string;
    class_name?: string | null;
    subject_name?: string | null;
    students_limit: number;
    current_students_count: number;
};
type RecentSessionItem = {
    id: number;
    topic: string;
    status: string;
    class_date_formatted?: string | null;
    batch_code?: string | null;
    subject_name?: string | null;
};
type RecentDoubtItem = {
    id: number;
    question: string;
    student_name?: string | null;
    subject_name?: string | null;
    created_at_formatted?: string | null;
};
type TodaySessionItem = {
    id: number;
    topic: string;
    status: string;
    batch_code?: string | null;
    subject_name?: string | null;
    class_date_formatted?: string | null;
    is_live_window: boolean;
    start_class_url?: string | null;
};
type NextSessionItem = {
    id: number;
    topic: string;
    batch_code?: string | null;
    subject_name?: string | null;
    class_date_formatted?: string | null;
    starts_in_text: string;
    start_class_url?: string | null;
} | null;

export default function Dashboard() {
    const pageProps = usePage().props as any;
    const teacher = pageProps?.teacher ?? { id: 0, name: null };
    const filters = (pageProps?.filters ?? { period_days: 30, period_options: [7, 30, 90] }) as { period_days: number; period_options: number[] };
    const kpis = (pageProps?.kpis ?? {
        total_batches: 0,
        active_batches: 0,
        sessions_today: 0,
        upcoming_sessions_7_days: 0,
        completed_sessions_30_days: 0,
        homeworks_30_days: 0,
        open_doubts: 0,
    }) as {
        total_batches: number;
        active_batches: number;
        sessions_today: number;
        upcoming_sessions_7_days: number;
        completed_sessions_30_days: number;
        homeworks_30_days: number;
        open_doubts: number;
    };
    const session_status_breakdown = (pageProps?.session_status_breakdown ?? []) as BreakdownItem[];
    const upcoming_7_day_schedule = (pageProps?.upcoming_7_day_schedule ?? []) as ScheduleItem[];
    const batch_strength = (pageProps?.batch_strength ?? []) as BatchStrengthItem[];
    const recent_sessions = (pageProps?.recent_sessions ?? []) as RecentSessionItem[];
    const recent_doubts = (pageProps?.recent_doubts ?? []) as RecentDoubtItem[];
    const today_focus = (pageProps?.today_focus ?? { today_sessions: [], next_session: null }) as {
        today_sessions: TodaySessionItem[];
        next_session: NextSessionItem;
    };
    const action_queue = (pageProps?.action_queue ?? {
        homework_pending_count: 0,
        open_doubt_sla_count: 0,
        recording_pending_count: 0,
        sla_hours: 8,
        homework_pending_items: [],
        open_doubt_sla_items: [],
        recording_pending_items: [],
    }) as {
        homework_pending_count: number;
        open_doubt_sla_count: number;
        recording_pending_count: number;
        sla_hours: number;
        homework_pending_items: Array<{ id: number; topic: string; batch_code?: string | null; subject_name?: string | null; class_date_formatted?: string | null }>;
        open_doubt_sla_items: Array<{ id: number; question: string; student_name?: string | null; subject_name?: string | null; age_hours: number; created_at_formatted?: string | null }>;
        recording_pending_items: Array<{ id: number; topic: string; batch_code?: string | null; subject_name?: string | null; class_date_formatted?: string | null }>;
    };
    const periodDays = Number(filters?.period_days || 30);

    const maxSchedule = Math.max(...(upcoming_7_day_schedule.map((d) => d.total) || [1]), 1);

    const statusColor = (status: string) => {
        if (status === 'completed') return 'bg-emerald-100 text-emerald-700';
        if (status === 'scheduled' || status === 'rescheduled') return 'bg-sky-100 text-sky-700';
        if (status === 'cancelled') return 'bg-rose-100 text-rose-700';
        return 'bg-slate-100 text-slate-700';
    };

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="rounded-2xl border bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-5">
                    <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">Teacher Analytics Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-600">{teacher?.name ? `Welcome, ${teacher.name}.` : 'Welcome.'} These metrics are only for your batches, sessions, doubts, and homework.</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-600">Window:</span>
                        {(filters?.period_options || [7, 30, 90]).map((days) => (
                            <button
                                key={days}
                                type="button"
                                onClick={() => router.get('/teacher/dashboard', { period_days: days }, { preserveScroll: true, preserveState: true })}
                                className={`rounded-lg border px-3 py-1 text-xs font-medium transition ${
                                    periodDays === days ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                Last {days} days
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
                    <Card><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">Total Batches</p><Layers3 className="h-4 w-4 text-slate-600" /></div><p className="mt-1 text-2xl font-semibold">{kpis.total_batches}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">Active Batches</p><Users className="h-4 w-4 text-emerald-600" /></div><p className="mt-1 text-2xl font-semibold">{kpis.active_batches}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">Sessions Today</p><CalendarDays className="h-4 w-4 text-blue-600" /></div><p className="mt-1 text-2xl font-semibold">{kpis.sessions_today}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">Upcoming (7d)</p><CalendarDays className="h-4 w-4 text-violet-600" /></div><p className="mt-1 text-2xl font-semibold">{kpis.upcoming_sessions_7_days}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">Completed ({periodDays}d)</p><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div><p className="mt-1 text-2xl font-semibold">{kpis.completed_sessions_30_days}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">Homework ({periodDays}d)</p><BookOpenCheck className="h-4 w-4 text-indigo-600" /></div><p className="mt-1 text-2xl font-semibold">{kpis.homeworks_30_days}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">Open Doubts ({periodDays}d)</p><CircleHelp className="h-4 w-4 text-amber-600" /></div><p className="mt-1 text-2xl font-semibold">{kpis.open_doubts}</p></CardContent></Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Today Focus</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {today_focus?.next_session ? (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                    <p className="text-sm font-semibold text-blue-900">{today_focus.next_session.topic}</p>
                                    <p className="text-xs text-blue-700">
                                        {today_focus.next_session.batch_code || '-'} | {today_focus.next_session.subject_name || '-'}
                                    </p>
                                    <p className="mt-1 text-xs text-blue-700">Starts In: {today_focus.next_session.starts_in_text}</p>
                                    <p className="text-xs text-blue-700">{today_focus.next_session.class_date_formatted || '-'}</p>
                                    {today_focus.next_session.start_class_url && (
                                        <Button asChild size="sm" className="mt-2">
                                            <a href={today_focus.next_session.start_class_url} target="_blank" rel="noreferrer">
                                                Start Class
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No upcoming class found.</p>
                            )}

                            <div className="space-y-2">
                                <p className="text-xs font-medium text-slate-600">Today's Sessions</p>
                                {today_focus?.today_sessions?.length ? (
                                    today_focus.today_sessions.map((s) => (
                                        <div key={s.id} className="rounded-lg border p-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-medium text-slate-800">{s.topic}</p>
                                                <Badge className={statusColor(s.status)}>{s.status}</Badge>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {s.batch_code || '-'} | {s.subject_name || '-'}
                                            </p>
                                            <p className="text-xs text-slate-500">{s.class_date_formatted || '-'}</p>
                                            {s.is_live_window && s.start_class_url && (
                                                <Button asChild size="sm" variant="outline" className="mt-2">
                                                    <a href={s.start_class_url} target="_blank" rel="noreferrer">
                                                        Start Now
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">No sessions today.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Pending Action Queue</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="rounded-md border bg-slate-50 p-2 text-center">
                                    <p className="text-xs text-slate-500">Homework</p>
                                    <p className="text-lg font-semibold text-slate-800">{action_queue.homework_pending_count}</p>
                                </div>
                                <div className="rounded-md border bg-amber-50 p-2 text-center">
                                    <p className="text-xs text-amber-700">Open Doubts ({action_queue.sla_hours}h+)</p>
                                    <p className="text-lg font-semibold text-amber-800">{action_queue.open_doubt_sla_count}</p>
                                </div>
                                <div className="rounded-md border bg-rose-50 p-2 text-center">
                                    <p className="text-xs text-rose-700">Missing Recording</p>
                                    <p className="text-lg font-semibold text-rose-800">{action_queue.recording_pending_count}</p>
                                </div>
                            </div>

                            {!!action_queue.homework_pending_items?.length && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-600">Homework Pending</p>
                                    {action_queue.homework_pending_items.map((item) => (
                                        <p key={`h-${item.id}`} className="text-xs text-slate-600">
                                            {item.topic} ({item.batch_code || '-'}) - {item.class_date_formatted || '-'}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {!!action_queue.open_doubt_sla_items?.length && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-600">Overdue Doubts</p>
                                    {action_queue.open_doubt_sla_items.map((item) => (
                                        <p key={`d-${item.id}`} className="text-xs text-slate-600">
                                            {item.student_name || '-'} ({item.subject_name || '-'}) - {item.age_hours}h
                                        </p>
                                    ))}
                                </div>
                            )}

                            {!!action_queue.recording_pending_items?.length && (
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-600">Recording Pending</p>
                                    {action_queue.recording_pending_items.map((item) => (
                                        <p key={`r-${item.id}`} className="text-xs text-slate-600">
                                            {item.topic} ({item.batch_code || '-'}) - {item.class_date_formatted || '-'}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Upcoming Sessions: Next 7 Days</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {upcoming_7_day_schedule.length === 0 && <p className="text-sm text-slate-500">No upcoming sessions in next 7 days.</p>}
                            {upcoming_7_day_schedule.map((item) => (
                                <div key={item.day} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-slate-700">{item.label}</span>
                                        <span className="text-slate-500">{item.total}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-100">
                                        <div className="h-2 rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${(item.total / maxSchedule) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Session Status Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {session_status_breakdown.length === 0 && <p className="text-sm text-slate-500">No sessions available.</p>}
                            {session_status_breakdown.map((row) => (
                                <div key={row.status} className="flex items-center justify-between rounded-lg border p-2">
                                    <Badge className={statusColor(row.status)}>{row.status}</Badge>
                                    <span className="text-sm font-semibold text-slate-700">{row.total}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Top Batch Strength</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {batch_strength.length === 0 && <p className="text-sm text-slate-500">No batches found.</p>}
                            {batch_strength.map((batch) => (
                                <div key={batch.id} className="rounded-lg border p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-slate-800">{batch.batch_code}</p>
                                        <p className="text-sm text-slate-600">
                                            {batch.current_students_count}
                                            {batch.students_limit > 0 ? ` / ${batch.students_limit}` : ''}
                                        </p>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {batch.class_name || '-'} | {batch.subject_name || '-'}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Recent Open Doubts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recent_doubts.length === 0 && <p className="text-sm text-slate-500">No open doubts.</p>}
                            {recent_doubts.map((doubt) => (
                                <div key={doubt.id} className="rounded-lg border p-3">
                                    <p className="line-clamp-2 text-sm font-medium text-slate-800">{doubt.question}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {doubt.student_name || '-'} | {doubt.subject_name || '-'}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">{doubt.created_at_formatted || '-'}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Recent Sessions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {recent_sessions.length === 0 && <p className="text-sm text-slate-500">No sessions found.</p>}
                        {recent_sessions.map((session) => (
                            <div key={session.id} className="flex flex-col justify-between gap-2 rounded-lg border p-3 md:flex-row md:items-center">
                                <div>
                                    <p className="font-medium text-slate-800">{session.topic || '-'}</p>
                                    <p className="text-xs text-slate-500">
                                        {session.batch_code || '-'} | {session.subject_name || '-'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500">{session.class_date_formatted || '-'}</span>
                                    <Badge className={statusColor(session.status)}>{session.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </TeacherLayout>
    );
}
