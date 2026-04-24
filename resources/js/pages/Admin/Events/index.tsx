import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import AdminLayout from "@/layouts/admin-layout";
import { index, create, edit, destroy } from "@/routes/admin/events";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

export default function EventsIndex() {
    const { events, filters, batchOptions } = usePage().props as {
        events: any,
        filters: any,
        batchOptions: Array<{ id: number; batch_code: string }>,
    };

    // Local filter states
    const [search, setSearch] = useState(filters?.search ?? "");
    const [status, setStatus] = useState(filters?.status ?? "");
    const [zoomStatus, setZoomStatus] = useState(filters?.zoom_status ?? "");
    const [meetingType, setMeetingType] = useState(filters?.meeting_type ?? "");
    const [batchId, setBatchId] = useState(filters?.batch_id ?? "");
    const [startsFrom, setStartsFrom] = useState(filters?.starts_from ?? "");
    const [startsTo, setStartsTo] = useState(filters?.starts_to ?? "");
    const [endsFrom, setEndsFrom] = useState(filters?.ends_from ?? "");
    const [endsTo, setEndsTo] = useState(filters?.ends_to ?? "");
    const [rangeStart, setRangeStart] = useState(filters?.range_start ?? "");
    const [rangeEnd, setRangeEnd] = useState(filters?.range_end ?? "");
    const [withTrashed, setWithTrashed] = useState(filters?.with_trashed ?? false);

    const [sortBy, setSortBy] = useState(filters?.sort_by ?? "");
    const [sortDir, setSortDir] = useState(filters?.sort_dir ?? "desc");

    const { delete: deleteEvent, processing } = useForm();

    const truncateText = (value: string, limit = 20) => (value.length > limit ? `${value.slice(0, limit)}...` : value);

    const eventRows = events.data.flatMap((event: any) => {
        if (event.meeting_type === "recurring" && Array.isArray(event.occurrence_items) && event.occurrence_items.length > 0) {
            return event.occurrence_items.map((occ: any, idx: number) => ({
                ...event,
                _row_key: `${event.id}-${occ.occurrence_id}`,
                _occurrence: occ,
                _is_occurrence_row: true,
                _is_first_occurrence_row: idx === 0,
            }));
        }

        return [{
            ...event,
            _row_key: `${event.id}-single`,
            _occurrence: null,
            _is_occurrence_row: false,
            _is_first_occurrence_row: true,
        }];
    });

    const applyFilters = () => {
        router.get(
            index().url,
            {
                search,
                status,
                zoom_status: zoomStatus,
                meeting_type: meetingType,
                batch_id: batchId,
                starts_from: startsFrom,
                starts_to: startsTo,
                ends_from: endsFrom,
                ends_to: endsTo,
                range_start: rangeStart,
                range_end: rangeEnd,
                with_trashed: withTrashed ? 1 : 0,
                sort_by: sortBy,
                sort_dir: sortDir,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (id: number) => {
        deleteEvent(destroy({ event: id }).url, {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout>
            <Head title="Events" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Events</h1>

                    <Link href={create().url}>
                        <Button>Add Event</Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="space-y-3 p-3">
                    <div className="mb-1">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine events list</p>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            title="Search"
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 w-64"
                        />

                        <select
                            title="Status"
                            className="h-9 w-36 rounded-md border p-2 text-sm"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>

                        <select
                            title="Zoom Status"
                            className="h-9 w-36 rounded-md border p-2 text-sm"
                            value={zoomStatus}
                            onChange={(e) => setZoomStatus(e.target.value)}
                        >
                            <option value="">Zoom Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="started">Started</option>
                            <option value="ended">Ended</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                            title="Meeting Type"
                            className="h-9 w-36 rounded-md border p-2 text-sm"
                            value={meetingType}
                            onChange={(e) => setMeetingType(e.target.value)}
                        >
                            <option value="">Meeting Type</option>
                            <option value="single">Single</option>
                            <option value="recurring">Recurring</option>
                        </select>

                        <select
                            title="Batch"
                            className="h-9 w-36 rounded-md border p-2 text-sm"
                            value={batchId}
                            onChange={(e) => setBatchId(e.target.value)}
                        >
                            <option value="">Batch</option>
                            {batchOptions.map((batch) => (
                                <option key={batch.id} value={String(batch.id)}>
                                    {batch.batch_code}
                                </option>
                            ))}
                        </select>

                        <Input type="date" title="Starts From" placeholder="Starts From" value={startsFrom} onChange={(e) => setStartsFrom(e.target.value)} className="h-9 w-40" />
                        <Input type="date" title="Starts To" placeholder="Starts To" value={startsTo} onChange={(e) => setStartsTo(e.target.value)} className="h-9 w-40" />
                        <Input type="date" title="Ends From" placeholder="Ends From" value={endsFrom} onChange={(e) => setEndsFrom(e.target.value)} className="h-9 w-40" />
                        <Input type="date" title="Ends To" placeholder="Ends To" value={endsTo} onChange={(e) => setEndsTo(e.target.value)} className="h-9 w-40" />
                        <Input type="date" title="Range Start" placeholder="Range Start" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="h-9 w-40" />
                        <Input type="date" title="Range End" placeholder="Range End" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="h-9 w-40" />

                        <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
                            <Checkbox checked={withTrashed} onCheckedChange={(val) => setWithTrashed(Boolean(val))} />
                            <span>With Trashed</span>
                        </div>

                        <select
                            title="Sort By"
                            className="h-9 w-36 rounded-md border p-2 text-sm"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="">Sort By</option>
                            <option value="title">Title</option>
                            <option value="starts_at">Starts At</option>
                            <option value="ends_at">Ends At</option>
                        </select>

                        <select
                            title="Sort Direction"
                            className="h-9 w-28 rounded-md border p-2 text-sm"
                            value={sortDir}
                            onChange={(e) => setSortDir(e.target.value)}
                        >
                            <option value="desc">DESC</option>
                            <option value="asc">ASC</option>
                        </select>

                        <Button onClick={applyFilters}>Apply</Button>
                        <Button type="button" variant="outline" onClick={() => router.get(index().url)}>
                            Clear Filters
                        </Button>
                    </div>
                </Card>

                {/* Events Table */}
                <Card className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Batches</TableHead>
                                <TableHead>Occurrence</TableHead>
                                <TableHead>Zoom Status</TableHead>
                                <TableHead>Occurrences</TableHead>
                                <TableHead>Starts</TableHead>
                                <TableHead>Ends</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {eventRows.length > 0 ? (
                                eventRows.map((event: any, index: number) => (
                                    <TableRow key={event._row_key}>
                                        <TableCell>
                                            {(events.current_page - 1) * events.per_page + index + 1}
                                        </TableCell>

                                        <TableCell>{event.title}</TableCell>
                                        <TableCell>
                                            {Array.isArray(event.batch_codes) && event.batch_codes.length > 0 ? (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button type="button" className="max-w-[220px] truncate text-left text-sm text-blue-600 hover:underline">
                                                            {truncateText(event.batch_codes.join(', '), 20)}
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Linked Batches</AlertDialogTitle>
                                                            <AlertDialogDescription asChild>
                                                                <div className="max-h-64 space-y-1 overflow-y-auto text-sm text-foreground">
                                                                    {event.batch_codes.map((code: string, idx: number) => (
                                                                        <p key={`${event.id}-batch-${idx}`}>{code}</p>
                                                                    ))}
                                                                </div>
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Close</AlertDialogCancel>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {event._occurrence ? event._occurrence.start_time_formatted : '-'}
                                        </TableCell>
                                        <TableCell>{event.zoom_status}</TableCell>
                                        <TableCell>{event.meeting_type === 'recurring' ? (event.occurrences_count ?? 0) : '-'}</TableCell>
                                        <TableCell>{event.starts_at_formatted}</TableCell>
                                        <TableCell>{event.ends_at_formatted}</TableCell>

                                        <TableCell>
                                            <Badge variant={event.active == 1 ? "success" : "destructive"}>
                                                {event.active == 1 ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem asChild>
                                                        <Link href={edit({ event: event.id }).url}>Edit</Link>
                                                    </DropdownMenuItem>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-red-600">
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>

                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this event?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-red-600 text-white"
                                                                    onClick={() => handleDelete(event.id)}
                                                                >
                                                                    {processing ? "Deleting..." : "Confirm"}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-4">
                                        No events found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {events.total > events.per_page && (
                        <div className="flex justify-end space-x-2 p-4">
                            {events.links.map((link: any, idx: number) =>
                                link.url ? (
                                    <Button
                                        key={idx}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => router.visit(link.url, { preserveScroll: true })}
                                    >
                                        {link.label.replace("&laquo;", "«").replace("&raquo;", "»")}
                                    </Button>
                                ) : null
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}













