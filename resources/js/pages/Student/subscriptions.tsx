import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudentLayout from '@/layouts/studentLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

type SubscriptionItem = {
    id: number;
    status: string;
    plan: {
        id: number | null;
        title: string | null;
    };
    start_at_formatted: string | null;
    end_at_formatted: string | null;
    days_left: number | null;
    auto_renew: boolean;
    price_paid: number;
    renew_url: string | null;
};

type Props = {
    subscriptions: SubscriptionItem[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        status?: string;
        search?: string;
    };
};

export default function StudentSubscriptions() {
    const { subscriptions, pagination, filters } = usePage<Props>().props;

    const [status, setStatus] = useState(filters.status ?? '');
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = () => {
        router.get(
            '/my-subscriptions',
            { status, search },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearFilters = () => {
        setStatus('');
        setSearch('');
        router.get('/my-subscriptions', {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <StudentLayout>
            <Head title="My Subscriptions" />

            <div className="flex flex-col gap-4 pb-6 sm:px-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>My Subscriptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex min-w-40 flex-col gap-1">
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="rounded-md border border-input bg-background p-2 text-sm"
                                >
                                    <option value="">All</option>
                                    <option value="active">Active</option>
                                    <option value="expired">Expired</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="flex min-w-56 flex-col gap-1">
                                <label className="text-sm font-medium">Search Plan</label>
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="rounded-md border border-input bg-background p-2 text-sm"
                                    placeholder="Plan title"
                                />
                            </div>
                            <Button type="button" onClick={applyFilters}>
                                Apply
                            </Button>
                            <Button type="button" variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-3">
                    {subscriptions.length === 0 && <Card><CardContent className="py-6 text-sm text-muted-foreground">No subscriptions found.</CardContent></Card>}

                    {subscriptions.map((item) => (
                        <Card key={item.id}>
                            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                                <div className="space-y-1">
                                    <div className="text-sm font-semibold">{item.plan?.title ?? 'Plan'}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Start: {item.start_at_formatted ?? '-'} | End: {item.end_at_formatted ?? '-'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Paid: INR {Math.round(item.price_paid)}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={item.status === 'active' ? 'default' : 'outline'}>{item.status}</Badge>
                                    <Badge variant="secondary">Days Left: {wholeDays(item.days_left)}</Badge>
                                    {item.renew_url && (
                                        <Link href={item.renew_url}>
                                            <Button size="sm">Renew / Extend</Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-xs text-muted-foreground">
                    Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
                </div>
            </div>
        </StudentLayout>
    );
}
    const wholeDays = (value: number | null) => {
        if (value === null || Number.isNaN(value)) return '-';
        return Math.trunc(value);
    };
