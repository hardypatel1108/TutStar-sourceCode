import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StudentLayout from '@/layouts/studentLayout';
import { markAllRead, markRead } from '@/routes/notifications';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Search, Video } from 'lucide-react';
import { useState } from 'react';

type NotificationItem = {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at_formatted: string | null;
    payload: {
        subject?: string | null;
        teacher?: string | null;
        chapter?: string | null;
        next_date?: string | null;
        action_text?: string | null;
        action_url?: string | null;
        priority?: string | null;
    };
};

type NotificationPage = {
    data: NotificationItem[];
    current_page: number;
    last_page: number;
    total: number;
};

type Props = {
    classNotifications: NotificationPage;
    homeworkNotifications: NotificationPage;
    filters: {
        read?: string;
        search?: string;
    };
    meta: {
        unread_count: number;
        class_total: number;
        homework_total: number;
    };
};

function NotificationSection({
    title,
    icon: Icon,
    color,
    notifications,
    onPrev,
    onNext,
    onMarkRead,
}: {
    title: string;
    icon: typeof Video;
    color: string;
    notifications: NotificationPage;
    onPrev: () => void;
    onNext: () => void;
    onMarkRead: (id: number) => void;
}) {
    return (
        <Card className={`border-0 bg-gradient-to-r ${color} shadow`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-black">
                        <Icon className="h-4 w-4" />
                        {title}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-white/80 text-black">
                        Total: {notifications.total}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="rounded-b-2xl bg-white p-3 sm:p-4">
                <div className="space-y-3">
                    {notifications.data.length === 0 && <div className="rounded-md border border-dashed p-4 text-sm text-gray-500">No notifications found.</div>}
                    {notifications.data.map((item) => (
                        <div
                            key={item.id}
                            className={`rounded-xl border p-3 transition ${item.is_read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50/40'}`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-semibold text-gray-900">{item.title || title}</p>
                                        <Badge variant="outline" className="text-[10px]">
                                            {item.type}
                                        </Badge>
                                        {item.payload?.priority && (
                                            <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                                                {item.payload.priority}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{item.message}</p>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        <span>{item.created_at_formatted ?? '-'}</span>
                                        {item.payload?.subject && <span>Subject: {item.payload.subject}</span>}
                                        {item.payload?.teacher && <span>Teacher: {item.payload.teacher}</span>}
                                        {item.payload?.chapter && <span>Chapter: {item.payload.chapter}</span>}
                                        {item.payload?.next_date && <span>Next Date: {item.payload.next_date}</span>}
                                        {item.is_read ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Read
                                            </span>
                                        ) : (
                                            <span className="font-semibold text-blue-600">Unread</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!item.is_read && (
                                        <Button size="sm" variant="outline" onClick={() => onMarkRead(item.id)}>
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
                    ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>
                        Page {notifications.current_page} of {notifications.last_page}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" disabled={notifications.current_page <= 1} onClick={onPrev}>
                            Previous
                        </Button>
                        <Button size="sm" variant="outline" disabled={notifications.current_page >= notifications.last_page} onClick={onNext}>
                            Next
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Notifications() {
    const { classNotifications, homeworkNotifications, filters, meta } = usePage<Props>().props;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [read, setRead] = useState(filters?.read ?? 'unread');

    const applyFilters = (next?: { class_page?: number; homework_page?: number }) => {
        router.get(
            '/notifications',
            {
                search,
                read,
                class_page: 1,
                homework_page: 1,
                ...next,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setRead('unread');
        router.get('/notifications', { read: 'unread' }, { preserveState: true, preserveScroll: true });
    };

    const setReadFilter = (value: string) => {
        setRead(value);
        router.get(
            '/notifications',
            {
                search,
                read: value,
                class_page: 1,
                homework_page: 1,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const markOneRead = (id: number) => {
        router.post(markRead({ notification: id }).url, {}, { preserveScroll: true });
    };

    return (
        <StudentLayout>
            <Head title="Notifications" />
            <div className="flex flex-col gap-4 pb-6 sm:p-4">
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>Class and homework updates</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">Unread: {meta?.unread_count ?? 0}</Badge>
                                <Button size="sm" variant="outline" onClick={() => router.post(markAllRead().url, {}, { preserveScroll: true })}>
                                    Mark All Read
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-2 flex flex-wrap items-end gap-2">
                            <div className="flex min-w-48 flex-col gap-1">
                                <label className="text-xs font-medium text-gray-600">Search</label>
                                <div className="relative">
                                    <Search className="absolute top-2 left-2 h-4 w-4 text-gray-400" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search title/message"
                                        className="w-full rounded-md border border-gray-300 py-1.5 pr-2 pl-8 text-sm"
                                    />
                                </div>
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
                    </CardContent>
                </Card>

                <NotificationSection
                    title="Class Notifications"
                    icon={Video}
                    color="from-[#95CBFF] to-[#D0B5FF]"
                    notifications={classNotifications}
                    onMarkRead={markOneRead}
                    onPrev={() => applyFilters({ class_page: classNotifications.current_page - 1, homework_page: homeworkNotifications.current_page })}
                    onNext={() => applyFilters({ class_page: classNotifications.current_page + 1, homework_page: homeworkNotifications.current_page })}
                />

                <NotificationSection
                    title="Homework Notifications"
                    icon={BookOpen}
                    color="from-[#FFD7A8] to-[#FFC2E0]"
                    notifications={homeworkNotifications}
                    onMarkRead={markOneRead}
                    onPrev={() => applyFilters({ homework_page: homeworkNotifications.current_page - 1, class_page: classNotifications.current_page })}
                    onNext={() => applyFilters({ homework_page: homeworkNotifications.current_page + 1, class_page: classNotifications.current_page })}
                />
            </div>
        </StudentLayout>
    );
}
