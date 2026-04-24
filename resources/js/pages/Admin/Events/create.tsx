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
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatTimeSlot } from '@/lib/time-slot';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Events', href: '/admin/events' },
    { title: 'Create Event', href: '/admin/events/create' },
];

export default function Create() {
    const { batchOptions } = usePage().props as {
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
    };

    const [meetingType, setMeetingType] = useState<'single' | 'recurring'>('single');
    const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);
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

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Event" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Add Event</h1>

                    <Link href={eventsIndex().url}>
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-4">
                    <div className="flex justify-center p-3">
                        <div className="w-full max-w-xl p-6">
                            <Form
                                {...EventController.store.form()}
                                encType="multipart/form-data"
                                resetOnSuccess
                                disableWhileProcessing
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
                                                <Label htmlFor="title">Event Title *</Label>
                                                <Input id="title" name="title" required />
                                                <InputError message={errors.title} />
                                            </div>

                                            {/* Description */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea id="description" name="description" rows={4} />
                                                <InputError message={errors.description} />
                                            </div>

                                            {/* Image */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="event_image">Event Image</Label>
                                                <Input id="event_image" name="event_image" type="file" accept="image/*" />
                                                <InputError message={errors.event_image} />
                                            </div>

                                            {/* Meeting Type */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="meeting_type">Meeting Type *</Label>
                                                <input type="hidden" name="meeting_type" value={meetingType} />

                                                <Select value={meetingType} onValueChange={(v) => setMeetingType(v as 'single' | 'recurring')}>
                                                    <SelectTrigger id="meeting_type">
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
                                                <Label htmlFor="starts_at">Starts At *</Label>
                                                <Input id="starts_at" name="starts_at" type="datetime-local" required />
                                                <InputError message={errors.starts_at} />
                                            </div>

                                            {/* Ends At */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="ends_at">Ends At *</Label>
                                                <Input id="ends_at" name="ends_at" type="datetime-local" required />
                                                <InputError message={errors.ends_at} />
                                            </div>

                                            {meetingType === 'recurring' && (
                                                <>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="recurrence_interval">Repeat every (weeks) *</Label>
                                                        <Input id="recurrence_interval" name="recurrence[repeat_interval]" type="number" min={1} defaultValue={1} />
                                                        <InputError message={errors['recurrence.repeat_interval']} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="recurrence_days">Weekly Days *</Label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="recurrence[weekly_days][]" value="1" /> Monday</label>
                                                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="recurrence[weekly_days][]" value="2" /> Tuesday</label>
                                                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="recurrence[weekly_days][]" value="3" /> Wednesday</label>
                                                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="recurrence[weekly_days][]" value="4" /> Thursday</label>
                                                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="recurrence[weekly_days][]" value="5" /> Friday</label>
                                                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="recurrence[weekly_days][]" value="6" /> Saturday</label>
                                                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="recurrence[weekly_days][]" value="7" /> Sunday</label>
                                                        </div>
                                                        <InputError message={errors['recurrence.weekly_days']} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="recurrence_end_date_time">Recurrence End Date *</Label>
                                                        <Input id="recurrence_end_date_time" name="recurrence[end_date_time]" type="datetime-local" />
                                                        <InputError message={errors['recurrence.end_date_time']} />
                                                    </div>
                                                </>
                                            )}

                                            {/* Active */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="active">Active?</Label>

                                                <Select name="active">
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

                                        {/* Submit */}
                                        <div className="mt-6 text-center">
                                            <Button type="submit" className="mt-2 w-fit max-w-md">
                                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                Create Event
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


