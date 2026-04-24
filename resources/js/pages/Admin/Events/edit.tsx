import EventController from '@/actions/App/Http/Controllers/Admin/EventController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { index as eventsIndex } from '@/routes/admin/events';
import type { BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatTimeSlot } from '@/lib/time-slot';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Events', href: '/admin/events' },
    { title: 'Edit Event', href: '/admin/events' },
];

export default function Edit() {
    const { event, batchOptions, selectedBatchIds: initialBatchIds } = usePage().props as {
        event: {
            id: number;
            title: string;
            description: string | null;
            event_image: string | null;

            zoom_meeting_id: string | null;
            zoom_join_url: string | null;
            zoom_start_url: string | null;
            zoom_recording_link: string | null;
            zoom_status: string;
            meeting_type: 'single' | 'recurring';
            recurrence: {
                repeat_interval?: number;
                weekly_days?: number[];
                end_date_time?: string;
            } | null;
            meeting?: {
                occurrences?: Array<{
                    id: number;
                    occurrence_id: string;
                    start_time: string;
                    duration: number;
                }>;
            };

            starts_at: string;
            ends_at: string;
            active: boolean;
        };
        batchOptions: Array<{
            id: number;
            batch_code: string;
            class_name: string | null;
            subject_name: string | null;
            teacher_name: string | null;
            time_slot: string | null;
            students_limit: number;
            current_students_count: number;
        }>;
        selectedBatchIds: number[];
    };
    const [meetingType, setMeetingType] = useState<'single' | 'recurring'>(event.meeting_type || 'single');
    const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>(initialBatchIds ?? []);
    const statusOptions = [
        { id: '1', name: 'Active' },
        { id: '0', name: 'Inactive' },
    ];

    const batchSelectOptions = useMemo(
        () =>
            batchOptions.map((batch) => ({
                value: batch.id,
                label: `${batch.batch_code} - ${batch.class_name ?? 'Class N/A'} - ${batch.subject_name ?? 'Subject N/A'}`,
            })),
        [batchOptions],
    );

    const selectedBatches = useMemo(
        () => batchOptions.filter((batch) => selectedBatchIds.includes(batch.id)),
        [batchOptions, selectedBatchIds],
    );

    const selectedWeeklyDays = useMemo(() => {
        const raw = event.recurrence?.weekly_days as unknown;

        if (Array.isArray(raw)) {
            return raw.map((day) => String(day));
        }

        if (typeof raw === 'string') {
            return raw
                .split(',')
                .map((day) => day.trim())
                .filter(Boolean);
        }

        return [] as string[];
    }, [event.recurrence?.weekly_days]);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Event" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Event</h1>

                    <Link href={eventsIndex().url}>
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form
                                {...EventController.update.form({ event: event.id })}
                                encType="multipart/form-data"
                                disableWhileProcessing
                                defaults={event}
                                className="flex flex-col gap-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        {errors.zoom && (
                                            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                                                {errors.zoom}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-6 rounded-xl border bg-slate-50/40 p-4 md:p-5">
                                            <div className="grid gap-2">
                                                <Label>Allowed Batches *</Label>
                                                <MultiSelect
                                                    options={batchSelectOptions}
                                                    value={selectedBatchIds}
                                                    onChange={setSelectedBatchIds}
                                                    placeholder="Select one or more batches"
                                                />
                                                {selectedBatchIds.map((batchId) => (
                                                    <input key={batchId} type="hidden" name="batch_ids[]" value={batchId} />
                                                ))}
                                                <p className="text-xs text-muted-foreground">Only selected batches will be able to see and join this event.</p>
                                                <InputError message={errors.batch_ids} />
                                                <InputError message={errors['batch_ids.0']} />
                                            </div>

                                            {selectedBatches.length > 0 && (
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    {selectedBatches.map((batch) => (
                                                        <div key={batch.id} className="rounded-lg border bg-white p-3 text-sm">
                                                            <p className="font-semibold">{batch.batch_code}</p>
                                                            <p className="text-muted-foreground">Class: {batch.class_name ?? '-'}</p>
                                                            <p className="text-muted-foreground">Subject: {batch.subject_name ?? '-'}</p>
                                                            <p className="text-muted-foreground">Teacher: {batch.teacher_name ?? '-'}</p>
                                                            <p className="text-muted-foreground">
                                                                Strength: {batch.current_students_count}/{batch.students_limit || 0}
                                                            </p>
                                                            <p className="text-muted-foreground">Time Slot: {formatTimeSlot(batch.time_slot)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Title */}
                                            <div className="grid gap-2">
                                                <Label>Event Title *</Label>
                                                <Input name="title" defaultValue={event.title} />
                                                <InputError message={errors.title} />
                                            </div>

                                            {/* Description */}
                                            <div className="grid gap-2">
                                                <Label>Description</Label>
                                                <Textarea name="description" defaultValue={event.description || ''} />
                                                <InputError message={errors.description} />
                                            </div>

                                            {/* Existing Image Preview */}
                                            {event.event_image && (
                                                <div className="grid gap-2">
                                                    <Label>Current Image</Label>
                                                    <img src={`/storage/${event.event_image}`} className="h-32 w-auto rounded border" />
                                                </div>
                                            )}

                                            {/* Upload New Image */}
                                            <div className="grid gap-2">
                                                <Label>Replace Image</Label>
                                                <Input type="file" name="event_image" accept="image/*" />
                                                <InputError message={errors.event_image} />
                                            </div>

                                            {/* Meeting Type */}
                                            <div className="grid gap-2">
                                                <Label>Meeting Type *</Label>
                                                <input type="hidden" name="meeting_type" value={meetingType} />
                                                <Select value={meetingType} onValueChange={(v) => setMeetingType(v as 'single' | 'recurring')}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select meeting type" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        <SelectItem value="single">Single</SelectItem>
                                                        <SelectItem value="recurring">Recurring</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.meeting_type} />
                                            </div>

                                            {/* Starts At */}
                                            <div className="grid gap-2">
                                                <Label>Starts At *</Label>
                                                <Input type="datetime-local" name="starts_at" defaultValue={event.starts_at_local ? event.starts_at_local.replace(' ', 'T').slice(0, 16) : ''} />
                                                <InputError message={errors.starts_at} />
                                            </div>

                                            {/* Ends At */}
                                            <div className="grid gap-2">
                                                <Label>Ends At *</Label>
                                                <Input type="datetime-local" name="ends_at" defaultValue={event.ends_at_local ? event.ends_at_local.replace(' ', 'T').slice(0, 16) : ''} />
                                                <InputError message={errors.ends_at} />
                                            </div>

                                            {meetingType === 'recurring' && (
                                                <>
                                                    <div className="grid gap-2">
                                                        <Label>Repeat every (weeks) *</Label>
                                                        <Input
                                                            name="recurrence[repeat_interval]"
                                                            type="number"
                                                            min={1}
                                                            defaultValue={event.recurrence?.repeat_interval || 1}
                                                        />
                                                        <InputError message={errors['recurrence.repeat_interval']} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label>Weekly Days *</Label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                                                <label key={day} className="flex items-center gap-2 text-sm">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="recurrence[weekly_days][]"
                                                                        value={String(day)}
                                                                        defaultChecked={selectedWeeklyDays.includes(String(day))}
                                                                    />
                                                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day - 1]}
                                                                </label>
                                                            ))}
                                                        </div>
                                                        <InputError message={errors['recurrence.weekly_days']} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label>Recurrence End Date *</Label>
                                                        <Input
                                                            type="datetime-local"
                                                            name="recurrence[end_date_time]"
                                                            defaultValue={event.recurrence?.end_date_time ? String(event.recurrence.end_date_time).replace(' ', 'T').slice(0, 16) : ''}
                                                        />
                                                        <InputError message={errors['recurrence.end_date_time']} />
                                                    </div>
                                                </>
                                            )}

                                            {/* Active */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="active">Active?</Label>

                                                <Select name="active" defaultValue={event.active ? '1' : '0'}>
                                                    <SelectTrigger id="active">
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map((s) => (
                                                            <SelectItem
                                                                key={s.id}
                                                                value={s.id} // send "active" or "inactive"
                                                            >
                                                                {s.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <InputError message={errors.active} />
                                            </div>
                                        </div>

                                        {meetingType === 'recurring' && Array.isArray(event.meeting?.occurrences) && event.meeting.occurrences.length > 0 && (
                                            <div className="grid gap-2">
                                                <Label>Recurring Occurrences (from Zoom)</Label>
                                                <div className="max-h-64 overflow-y-auto rounded border p-3 text-sm">
                                                    {event.meeting.occurrences.map((occ) => (
                                                        <div key={occ.id} className="mb-2 rounded border p-2">
                                                            <div><span className="text-muted-foreground">Occurrence ID:</span> {occ.occurrence_id}</div>
                                                            <div><span className="text-muted-foreground">Start:</span> {new Date(occ.start_time).toLocaleString()}</div>
                                                            <div><span className="text-muted-foreground">Duration:</span> {occ.duration} min</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit */}
                                        <div className="mt-6 text-center">
                                            <Button type="submit" className="w-fit">
                                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                                Update Event
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </div>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}


