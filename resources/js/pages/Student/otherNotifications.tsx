import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StudentLayout from '@/layouts/studentLayout';
import { markRead } from '@/routes/notifications';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    BellRing,
    CalendarClock,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    Megaphone,
    MessageSquareWarning,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';

type NotificationItem = {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    read_at: string | null;
    created_at: string | null;
    created_at_formatted: string | null;
    payload: {
        action_text?: string | null;
        action_url?: string | null;
        priority?: string | null;
        icon?: string | null;
        amount?: number | null;
        payment_id?: number | null;
        due_date?: string | null;
        days_left?: number | null;
        batch_name?: string | null;
    };
};

type Props = {
    notifications: {
        data: NotificationItem[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    filters: {
        type?: string;
        read?: string;
        search?: string;
    };
    meta: {
        unread_count: number;
        type_counts: Array<{ type: string; total: number }>;
    };
};

const typeMeta: Record<string, { label: string; color: string; icon: typeof Sparkles }> = {
    payment: { label: 'Payment', color: 'bg-emerald-500', icon: CircleDollarSign },
    event: { label: 'Event', color: 'bg-fuchsia-500', icon: CalendarClock },
    system: { label: 'System', color: 'bg-sky-500', icon: BellRing },
    custom: { label: 'Custom', color: 'bg-orange-500', icon: Sparkles },
    cron: { label: 'Reminder', color: 'bg-indigo-500', icon: Clock3 },
    newuser: { label: 'Welcome', color: 'bg-blue-600', icon: Megaphone },
};

const priorityMeta: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function OtherNotifications() {
    const { notifications, filters, meta } = usePage<Props>().props;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [read, setRead] = useState(filters?.read ?? 'unread');

    const applyFilters = (next?: { search?: string; read?: string; type?: string }) => {
        const payload = {
            search,
            read,
            ...next,
        };

        router.get('/other-notifications', payload, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setRead('unread');
        router.get('/other-notifications', { read: 'unread' }, { preserveState: true, preserveScroll: true });
    };

    const setReadFilter = (value: string) => {
        setRead(value);
        router.get(
            '/other-notifications',
            {
                search,
                read: value,
                page: 1,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const markOneRead = (notificationId: number) => {
        router.post(markRead({ notification: notificationId }).url, {}, { preserveScroll: true });
    };

    const markAllRead = () => {
        router.post('/other-notifications/read', {}, { preserveScroll: true });
    };

    const goPrev = () => {
        if ((notifications?.current_page ?? 1) > 1) {
            router.get(
                '/other-notifications',
                {
                    search,
                    read,
                    page: (notifications?.current_page ?? 1) - 1,
                },
                { preserveState: true, preserveScroll: true },
            );
        }
    };

    const goNext = () => {
        if ((notifications?.current_page ?? 1) < (notifications?.last_page ?? 1)) {
            router.get(
                '/other-notifications',
                {
                    search,
                    read,
                    page: (notifications?.current_page ?? 1) + 1,
                },
                { preserveState: true, preserveScroll: true },
            );
        }
    };

    return (
        <StudentLayout>
            <Head title="Other Notifications" />
            <div className="flex flex-col gap-4 pb-6 sm:p-4">
                <Card className="border-0 bg-gradient-to-r from-[#95CBFF] to-[#D0B5FF] shadow">
                    <CardHeader className="rounded-t-2xl bg-transparent pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-black">Other Notifications</CardTitle>
                                <CardDescription className="text-black/70">
                                    Alerts, payments, reminders, and system updates
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-white/80 text-black">
                                    Unread: {meta?.unread_count ?? 0}
                                </Badge>
                                <Button size="sm" variant="outline" onClick={markAllRead}>
                                    Mark All Read
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="rounded-b-2xl bg-white p-3 sm:p-4">
                        <div className="mb-3 flex flex-wrap items-end gap-2">
                            <div className="flex min-w-48 flex-col gap-1">
                                <label className="text-xs font-medium text-gray-600">Search</label>
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search title or message"
                                    className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-600">Read Status</label>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant={read === 'unread' ? 'default' : 'outline'}
                                        onClick={() => setReadFilter('unread')}
                                    >
                                        Unread
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={read === 'read' ? 'default' : 'outline'}
                                        onClick={() => setReadFilter('read')}
                                    >
                                        Read
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={read === 'all' ? 'default' : 'outline'}
                                        onClick={() => setReadFilter('all')}
                                    >
                                        All
                                    </Button>
                                </div>
                            </div>
                            <Button size="sm" onClick={() => applyFilters()}>
                                Apply
                            </Button>
                            <Button size="sm" variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {notifications?.data?.length === 0 && (
                                <div className="rounded-md border border-dashed p-5 text-center text-sm text-gray-500">No notifications found.</div>
                            )}

                            {notifications?.data?.map((item) => {
                                const currentTypeMeta = typeMeta[item.type] ?? { label: item.type, color: 'bg-gray-500', icon: MessageSquareWarning };
                                const IconComp = currentTypeMeta.icon;
                                const priorityClass = priorityMeta[item.payload?.priority ?? ''] ?? 'bg-gray-100 text-gray-700 border-gray-200';

                                return (
                                    <div
                                        key={item.id}
                                        className={`rounded-xl border p-3 transition ${item.is_read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50/40'}`}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div className="flex min-w-0 items-start gap-2">
                                                <div className={`mt-0.5 rounded-full p-1.5 text-white ${currentTypeMeta.color}`}>
                                                    <IconComp className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="truncate text-sm font-semibold text-gray-900">{item.title ?? 'Notification'}</p>
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {currentTypeMeta.label}
                                                        </Badge>
                                                        {item.payload?.priority && (
                                                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${priorityClass}`}>
                                                                {item.payload.priority}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                        <span>{item.created_at_formatted ?? '-'}</span>
                                                        {item.payload?.batch_name && <span>Batch: {item.payload.batch_name}</span>}
                                                        {item.payload?.due_date && <span>Due: {item.payload.due_date}</span>}
                                                        {item.payload?.amount && <span>Amount: INR {item.payload.amount}</span>}
                                                        {!item.is_read && <span className="font-semibold text-blue-600">Unread</span>}
                                                        {item.is_read && (
                                                            <span className="inline-flex items-center gap-1 text-emerald-600">
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                Read
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!item.is_read && (
                                                    <Button size="sm" variant="outline" onClick={() => markOneRead(item.id)}>
                                                        Mark Read
                                                    </Button>
                                                )}
                                                {item.payload?.action_url && (
                                                    <Link href={item.payload.action_url}>
                                                        <Button size="sm">{item.payload?.action_text ?? 'Open'}</Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-gray-500">
                            <span>
                                Page {notifications?.current_page ?? 1} of {notifications?.last_page ?? 1} | Total {notifications?.total ?? 0}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" disabled={(notifications?.current_page ?? 1) <= 1} onClick={goPrev}>
                                    Previous
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={(notifications?.current_page ?? 1) >= (notifications?.last_page ?? 1)}
                                    onClick={goNext}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
