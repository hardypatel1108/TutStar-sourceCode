import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import TeacherLayout from '@/layouts/teacher-layout';
import { dashboard } from '@/routes/teacher';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';

type NotificationItem = {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at_formatted?: string | null;
    payload?: {
        action_text?: string | null;
        action_url?: string | null;
        priority?: string | null;
        batch_name?: string | null;
        topic?: string | null;
        session_at?: string | null;
        student_name?: string | null;
    };
};

type Props = {
    notifications: {
        data: NotificationItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        type?: string;
        read?: string;
        search?: string;
    };
    meta: {
        unread_count: number;
        type_counts: { type: string; total: number }[];
        trigger_map: { action: string; notification: string; type: string }[];
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Notifications', href: '/teacher/notifications' },
];

export default function TeacherNotificationsIndex() {
    const { notifications, filters, meta } = usePage<Props>().props;

    const applyFilters = (extra: Record<string, string | number>) => {
        const payload = {
            type: filters?.type ?? 'all',
            read: filters?.read ?? 'all',
            search: filters?.search ?? '',
            ...extra,
        };

        router.get('/teacher/notifications', payload, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        router.get('/teacher/notifications', {}, { preserveState: true, preserveScroll: true });
    };

    const markAllRead = () => {
        router.post('/teacher/notifications/read', {}, { preserveScroll: true });
    };

    const markRead = (id: number) => {
        router.post(`/teacher/notifications/${id}/read`, {}, { preserveScroll: true });
    };

    const typeColor = (type: string) => {
        if (type === 'class') return 'bg-indigo-100 text-indigo-700';
        if (type === 'homework') return 'bg-emerald-100 text-emerald-700';
        if (type === 'event') return 'bg-amber-100 text-amber-700';
        if (type === 'custom') return 'bg-blue-100 text-blue-700';
        if (type === 'payment') return 'bg-rose-100 text-rose-700';
        return 'bg-slate-100 text-slate-700';
    };

    const readColor = (isRead: boolean) => (isRead ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700');

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher Notifications" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Unread: {meta?.unread_count ?? 0}</CardDescription>
                        </div>
                        <Button size="sm" variant="outline" onClick={markAllRead}>
                            Mark All Read
                        </Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-4">
                        <div>
                            <div className="mb-1 text-xs font-medium text-slate-500">Search</div>
                            <Input
                                defaultValue={filters?.search ?? ''}
                                placeholder="Search title/message"
                                onBlur={(e) => applyFilters({ search: e.target.value, page: 1 })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') applyFilters({ search: (e.target as HTMLInputElement).value, page: 1 });
                                }}
                            />
                        </div>

                        <div>
                            <div className="mb-1 text-xs font-medium text-slate-500">Type</div>
                            <select
                                className="w-full rounded-md border p-2"
                                value={filters?.type ?? 'all'}
                                onChange={(e) => applyFilters({ type: e.target.value, page: 1 })}
                            >
                                <option value="all">All Types</option>
                                {meta?.type_counts?.map((t) => (
                                    <option key={t.type} value={t.type}>
                                        {t.type} ({t.total})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="mb-1 text-xs font-medium text-slate-500">Read Status</div>
                            <select
                                className="w-full rounded-md border p-2"
                                value={filters?.read ?? 'all'}
                                onChange={(e) => applyFilters({ read: e.target.value, page: 1 })}
                            >
                                <option value="all">All</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <Button className="w-full" variant="secondary" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Action Trigger Matrix</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {meta?.trigger_map?.map((item, idx) => (
                            <div key={`${item.action}-${idx}`} className="rounded border p-3">
                                <div className="font-medium">{item.action}</div>
                                <div className="mt-1 text-slate-600">{item.notification}</div>
                                <Badge className={`mt-2 ${typeColor(item.type)}`}>{item.type}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>All Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {notifications?.data?.length === 0 && (
                            <div className="rounded border border-dashed p-4 text-center text-sm text-slate-500">No notifications found.</div>
                        )}

                        {notifications?.data?.map((n) => (
                            <div key={n.id} className={`rounded border p-4 ${n.is_read ? 'bg-white' : 'bg-emerald-50/40'}`}>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className={typeColor(n.type)}>{n.type}</Badge>
                                    <Badge className={readColor(n.is_read)}>{n.is_read ? 'Read' : 'Unread'}</Badge>
                                    <span className="text-xs text-slate-500">{n.created_at_formatted ?? '-'}</span>
                                </div>
                                <div className="mt-2 font-semibold">{n.title}</div>
                                <div className="mt-1 text-sm text-slate-700">{n.message}</div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {n.payload?.action_url && (
                                        <Button size="sm" variant="outline" onClick={() => router.visit(n.payload?.action_url ?? '#')}>
                                            {n.payload?.action_text ?? 'Open'}
                                        </Button>
                                    )}
                                    {!n.is_read && (
                                        <Button size="sm" variant="secondary" onClick={() => markRead(n.id)}>
                                            Mark Read
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {notifications?.last_page > 1 && (
                            <div className="flex items-center justify-between pt-2 text-sm">
                                <div>
                                    Page {notifications.current_page} of {notifications.last_page} | Total {notifications.total}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={notifications.current_page <= 1}
                                        onClick={() => applyFilters({ page: notifications.current_page - 1 })}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={notifications.current_page >= notifications.last_page}
                                        onClick={() => applyFilters({ page: notifications.current_page + 1 })}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TeacherLayout>
    );
}

