import ClassSessionController from '@/actions/App/Http/Controllers/Admin/ClassSessionController';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { Form, Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { formatTimeSlot, getTimeRangeForSlot } from '@/lib/time-slot';

const weekDays = [
    { id: '1', label: 'Monday' },
    { id: '2', label: 'Tuesday' },
    { id: '3', label: 'Wednesday' },
    { id: '4', label: 'Thursday' },
    { id: '5', label: 'Friday' },
    { id: '6', label: 'Saturday' },
    { id: '7', label: 'Sunday' },
];

export default function Edit({ session, meeting, batch, occurrences = [] }) {
    const isRecurring = meeting.meeting_type === 'recurring';
    const canOverrideOccurrenceTopic = isRecurring && Boolean(session?.occurrence_id);

    const [weeklyDays, setWeeklyDays] = useState<string[]>(Array.isArray(meeting.recurrence?.weekly_days) ? meeting.recurrence.weekly_days : []);

    const initialClassDate = isRecurring ? meeting.start_time : session.class_date;
    const [classDate, setClassDate] = useState(initialClassDate ? initialClassDate.replace(' ', 'T').slice(0, 16) : '');
    const [resolvedBatchTimeSlot, setResolvedBatchTimeSlot] = useState<string | null>(batch?.time_slot ?? null);
    const [topicScope, setTopicScope] = useState<'series' | 'occurrence' | 'all_occurrences'>(
        canOverrideOccurrenceTopic ? 'occurrence' : 'series',
    );
    const confirmMismatchInputRef = useRef<HTMLInputElement | null>(null);
    const skipNextConfirmRef = useRef(false);

    const toMinutes = (time: string): number | null => {
        const [h, m] = time.split(':').map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return null;
        return (h * 60) + m;
    };

    const isSelectedTimeInBatchSlot = (dateTimeValue: string, slot?: string | null): boolean => {
        if (!dateTimeValue || !slot) return true;
        const date = new Date(dateTimeValue);
        if (Number.isNaN(date.getTime())) return true;

        const range = getTimeRangeForSlot(slot);
        if (!range) return true;

        const selectedMinutes = (date.getHours() * 60) + date.getMinutes();
        const fromMinutes = toMinutes(range.from);
        const toMinutesValue = toMinutes(range.to);
        if (fromMinutes === null || toMinutesValue === null) return true;

        if (fromMinutes === toMinutesValue) return true;
        if (fromMinutes < toMinutesValue) {
            return selectedMinutes >= fromMinutes && selectedMinutes < toMinutesValue;
        }
        return selectedMinutes >= fromMinutes || selectedMinutes < toMinutesValue;
    };

    const effectiveBatchTimeSlot = resolvedBatchTimeSlot ?? batch?.time_slot ?? null;
    const batchTimeSlotLabel = formatTimeSlot(effectiveBatchTimeSlot, 'Not configured in batch');
    const hasTimeSlotMismatch = Boolean(classDate && effectiveBatchTimeSlot && !isSelectedTimeInBatchSlot(classDate, effectiveBatchTimeSlot));

    useEffect(() => {
        if (confirmMismatchInputRef.current) {
            confirmMismatchInputRef.current.value = '0';
        }
    }, [effectiveBatchTimeSlot, classDate]);

    useEffect(() => {
        setResolvedBatchTimeSlot(batch?.time_slot ?? null);
    }, [batch?.id, batch?.time_slot]);

    useEffect(() => {
        if (batch?.time_slot || !batch?.id) return;

        let isCancelled = false;
        fetch(`/admin/class-sessions/batch/${batch.id}/data`)
            .then((res) => (res.ok ? res.json() : null))
            .then((json) => {
                if (isCancelled) return;
                const slot = json?.batch?.time_slot ?? null;
                if (slot) {
                    setResolvedBatchTimeSlot(slot);
                }
            })
            .catch(() => {
                // no-op fallback; UI keeps current value
            });

        return () => {
            isCancelled = true;
        };
    }, [batch?.id, batch?.time_slot]);

    return (
        <AdminLayout>
            <Head title="Edit Class Session" />

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Class Session</h1>
                    <Link href="/admin/class-sessions">
                        <Button variant="outline">Back</Button>
                    </Link>
                </div>

                <Card className="p-6">
                    <Form
                        {...ClassSessionController.update.form(session.id)}
                    >
                        {({ processing, errors }) => {
                            const requiresMismatchConfirmation = hasTimeSlotMismatch || Boolean(errors.confirm_mismatch);

                            return (
                            <>
                                <input ref={confirmMismatchInputRef} type="hidden" name="confirm_mismatch" defaultValue="0" />

                                <div className="mb-4 rounded-lg border bg-muted/20 p-4">
                                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Zoom Editable Fields</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        You can edit only Zoom-supported fields: topic, start time, duration, and recurrence.
                                    </p>
                                </div>

                                <div className="mb-4 rounded border p-3 text-sm">
                                    <p className="text-muted-foreground">Batch</p>
                                    <p className="font-medium">{batch?.name || '-'}</p>
                                    <p className="mt-2 text-muted-foreground">Batch Time Slot</p>
                                    <p className="font-medium">{batchTimeSlotLabel}</p>
                                    <p className="mt-2 text-muted-foreground">Batch Strength</p>
                                    <p className="font-medium">
                                        {batch?.current_students_count ?? 0}/{batch?.students_limit ?? '-'}
                                    </p>
                                </div>

                                <Label>Topic</Label>
                                <Input name="topic" defaultValue={session.topic} />

                                {canOverrideOccurrenceTopic && (
                                    <div className="my-3 rounded border p-3 text-sm">
                                        <p className="mb-2 font-medium">Topic Scope</p>
                                        <div className="flex flex-wrap gap-3">
                                            <label className="inline-flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="topic_scope"
                                                    value="series"
                                                    checked={topicScope === 'series'}
                                                    onChange={() => setTopicScope('series')}
                                                />
                                                Series Topic (Zoom + all default occurrences)
                                            </label>
                                            <label className="inline-flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="topic_scope"
                                                    value="occurrence"
                                                    checked={topicScope === 'occurrence'}
                                                    onChange={() => setTopicScope('occurrence')}
                                                />
                                                This Occurrence Only (local)
                                            </label>
                                            <label className="inline-flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="topic_scope"
                                                    value="all_occurrences"
                                                    checked={topicScope === 'all_occurrences'}
                                                    onChange={() => setTopicScope('all_occurrences')}
                                                />
                                                All Occurrences (local, one shot)
                                            </label>
                                        </div>
                                        {topicScope === 'occurrence' && (
                                            <p className="mt-2 text-muted-foreground">
                                                Only this class session topic will change in panel. Zoom recurring meeting topic stays unchanged.
                                            </p>
                                        )}
                                        {topicScope === 'all_occurrences' && (
                                            <p className="mt-2 text-muted-foreground">
                                                Set topics for all occurrences below and submit once. If you also change date/time/recurrence, Zoom series and local occurrences are updated too.
                                            </p>
                                        )}
                                    </div>
                                )}
                                {!canOverrideOccurrenceTopic && (
                                    <input type="hidden" name="topic_scope" value="series" />
                                )}

                                {isRecurring && topicScope === 'all_occurrences' && (
                                    <div className="my-3 rounded border p-3 text-sm">
                                        <p className="mb-2 font-medium">Occurrence Topics (One Shot)</p>
                                        <div className="space-y-2">
                                            {occurrences.map((occ: any) => (
                                                <div key={occ.occurrence_id} className="grid grid-cols-1 gap-2 md:grid-cols-[260px_1fr] md:items-center">
                                                    <p className="text-muted-foreground">
                                                        {new Date(occ.class_date).toLocaleString()}
                                                    </p>
                                                    <Input
                                                        name="occurrence_topics[]"
                                                        defaultValue={occ.topic || session.topic}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* {!isRecurring && ( */}
                                <>
                                    <Label>Class Time</Label>
                                    <Input type="datetime-local" name="class_date" value={classDate} onChange={(e) => setClassDate(e.target.value)} />
                                </>
                                {/* )} */}

                                {requiresMismatchConfirmation && (
                                    <div className="my-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                                        Warning: selected class time is outside batch time slot ({formatTimeSlot(effectiveBatchTimeSlot)}). You need to confirm before save.
                                    </div>
                                )}
                                {errors.confirm_mismatch && <p className="my-2 text-sm text-red-600">{errors.confirm_mismatch}</p>}

                                {isRecurring && (
                                    <>
                                        <Label>Repeat Interval (weeks)</Label>
                                        <Input type="number" name="recurrence[repeat_interval]" defaultValue={meeting.recurrence.repeat_interval} />

                                        <div className="grid gap-2">
                                            <Label>Weekly Days *</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {weekDays.map((day) => {
                                                    const selected = weeklyDays.includes(day.id);
                                                    return (
                                                        <button
                                                            key={day.id}
                                                            type="button"
                                                            className={`rounded-md border px-3 py-1.5 text-sm ${selected ? 'border-primary bg-primary/10 text-primary' : 'border-input bg-background'}`}
                                                            onClick={() => {
                                                                setWeeklyDays((prev) =>
                                                                    prev.includes(day.id) ? prev.filter((item) => item !== day.id) : [...prev, day.id],
                                                                );
                                                            }}
                                                        >
                                                            {day.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {weeklyDays.map((d) => (
                                            <input key={d} type="hidden" name="recurrence[weekly_days][]" value={d} />
                                        ))}

                                        <Label>End Date</Label>
                                        <Input type="datetime-local" name="recurrence[end_date_time]" defaultValue={meeting.recurrence.end_date_time} />
                                    </>
                                )}

                                <Label>Duration (minutes)</Label>
                                <Input type="number" name="duration" defaultValue={meeting.duration ?? 60} />

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    onClick={(e) => {
                                        if (!confirmMismatchInputRef.current) return;

                                        if (skipNextConfirmRef.current) {
                                            skipNextConfirmRef.current = false;
                                            return;
                                        }

                                        confirmMismatchInputRef.current.value = '0';

                                        if (topicScope === 'occurrence') return;
                                        if (!hasTimeSlotMismatch) return;

                                        const ok = window.confirm(
                                            `Selected class time is outside batch time slot (${formatTimeSlot(effectiveBatchTimeSlot)}). Do you want to continue?`,
                                        );

                                        if (!ok) {
                                            e.preventDefault();
                                            return;
                                        }

                                        e.preventDefault();
                                        confirmMismatchInputRef.current.value = '1';
                                        skipNextConfirmRef.current = true;
                                        e.currentTarget.form?.requestSubmit();
                                    }}
                                >
                                    Update Session
                                </Button>
                            </>
                        )}}
                    </Form>
                </Card>
            </div>
        </AdminLayout>
    );
}

