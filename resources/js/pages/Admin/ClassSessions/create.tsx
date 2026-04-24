import ClassSessionController from '@/actions/App/Http/Controllers/Admin/ClassSessionController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Form, Head, Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { formatTimeSlot, getTimeRangeForSlot } from '@/lib/time-slot';
import { useEffect, useRef, useState } from 'react';

type SimpleItem = {
    id: number;
    name: string;
};

const weekDays = [
    { id: '1', label: 'Monday' },
    { id: '2', label: 'Tuesday' },
    { id: '3', label: 'Wednesday' },
    { id: '4', label: 'Thursday' },
    { id: '5', label: 'Friday' },
    { id: '6', label: 'Saturday' },
    { id: '7', label: 'Sunday' },
];

export default function Create({ batches }) {
    const [meetingType, setMeetingType] = useState<'single' | 'recurring'>('single');

    const [batchId, setBatchId] = useState('');
    const [batchTimeSlot, setBatchTimeSlot] = useState<string | null>(null);
    const [board, setBoard] = useState<SimpleItem | null>(null);
    const [clazz, setClazz] = useState<SimpleItem | null>(null);
    const [subject, setSubject] = useState<SimpleItem | null>(null);
    const [teacher, setTeacher] = useState<SimpleItem | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [batchStrength, setBatchStrength] = useState<{ current: number; limit: number | null } | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [weeklyDays, setWeeklyDays] = useState<string[]>([]);
    const [classDate, setClassDate] = useState('');
    const [batchIssue, setBatchIssue] = useState<string | null>(null);
    const confirmMismatchInputRef = useRef<HTMLInputElement | null>(null);

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
        // Overnight range (e.g. 21:00-05:00)
        return selectedMinutes >= fromMinutes || selectedMinutes < toMinutesValue;
    };

    const fetchBatchData = async (nextBatchId: string) => {
        if (!nextBatchId) {
            setBatchTimeSlot(null);
            setBatchStrength(null);
            setBoard(null);
            setClazz(null);
            setSubject(null);
            setTeacher(null);
            setStudents([]);
            setSelectedStudents([]);
            setBatchIssue(null);
            return;
        }

        const res = await fetch(`/admin/class-sessions/batch/${nextBatchId}/data`);
        const json = await res.json();

        setBatchTimeSlot(json.batch?.time_slot ?? null);
        setBatchStrength({
            current: Number(json.batch?.current_students_count ?? 0),
            limit: json.batch?.students_limit ?? null,
        });
        setBoard(json.board ?? null);
        setClazz(json.class ?? null);
        setSubject(json.subject ?? null);
        setTeacher(json.teacher ?? null);
        setStudents(json.students ?? []);
        setSelectedStudents([]);

        if (!json.subject?.id || !json.teacher?.id) {
            setBatchIssue('Selected batch is missing subject/teacher. Please update the batch first.');
        } else {
            setBatchIssue(null);
        }
    };

    const batchTimeSlotLabel = formatTimeSlot(batchTimeSlot, 'Not configured in batch');
    const handleBatchChange = async (value: string) => {
        setBatchId(value);
        await fetchBatchData(value);
    };
    const hasAnyDetails = board?.name || clazz?.name || subject?.name || teacher?.name || batchTimeSlot || batchStrength;
    const hasTimeSlotMismatch = Boolean(classDate && batchTimeSlot && !isSelectedTimeInBatchSlot(classDate, batchTimeSlot));

    useEffect(() => {
        if (confirmMismatchInputRef.current) {
            confirmMismatchInputRef.current.value = '0';
        }
    }, [batchTimeSlot, classDate]);

    return (
        <AdminLayout>
            <Head title="Create Class Session" />

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Add Class Session</h1>
                    <Link href="/admin/class-sessions">
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-6">
                    <Form
                        {...ClassSessionController.store.form()}
                        className="flex flex-col gap-6"
                        resetOnSuccess
                        disableWhileProcessing
                    >
                        {({ processing, errors }) => (
                            <>
                                {errors.zoom && (
                                    <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                                        {errors.zoom}
                                    </div>
                                )}

                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Batch Context</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">Pick a batch first. Subject, teacher and students are auto-loaded.</p>
                                </div>

                                {/* Batch */}
                                <div className="grid gap-2">
                                    <Label>
                                        Batch <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={batchId} onValueChange={handleBatchChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {batches.map((b) => (
                                                <SelectItem key={b.id} value={String(b.id)}>
                                                    {b.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.batch_id} />
                                    {batchIssue && (
                                        <p className="text-sm text-red-600">{batchIssue}</p>
                                    )}
                                </div>

                                {/* Hidden IDs */}
                                <input type="hidden" name="batch_id" value={batchId} />
                                <input type="hidden" name="subject_id" value={subject?.id ?? ''} />
                                <input type="hidden" name="teacher_id" value={teacher?.id ?? ''} />
                                <input type="hidden" name="meeting_type" value={meetingType} />
                                <input ref={confirmMismatchInputRef} type="hidden" name="confirm_mismatch" defaultValue="0" />

                                {/* Batch Info */}
                                {hasAnyDetails && (
                                    <div className="grid grid-cols-2 gap-4 rounded border p-4 text-sm">
                                        {board && (
                                            <div>
                                                <p className="text-muted-foreground">Board</p>
                                                <p className="font-medium">{board.name}</p>
                                            </div>
                                        )}
                                        {clazz && (
                                            <div>
                                                <p className="text-muted-foreground">Class</p>
                                                <p className="font-medium">{clazz.name}</p>
                                            </div>
                                        )}
                                        {subject && (
                                            <div>
                                                <p className="text-muted-foreground">Subject</p>
                                                <p className="font-medium">{subject.name}</p>
                                            </div>
                                        )}
                                        {teacher && (
                                            <div>
                                                <p className="text-muted-foreground">Teacher</p>
                                                <p className="font-medium">{teacher.name}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-muted-foreground">Batch Time Slot</p>
                                            <p className="font-medium">{batchTimeSlotLabel}</p>
                                        </div>
                                        {batchStrength && (
                                            <div>
                                                <p className="text-muted-foreground">Batch Strength</p>
                                                <p className="font-medium">
                                                    {batchStrength.current}/{batchStrength.limit ?? '-'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Topic */}
                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Session Details</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">Set topic, type, date/time and recurrence options.</p>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Topic *</Label>
                                    <Input name="topic" />
                                    <InputError message={errors.topic} />
                                </div>

                                {/* Description */}
                                <div className="grid gap-2">
                                    <Label>Instructions</Label>
                                    <Textarea name="description" rows={3} />
                                </div>

                                {/* Meeting Type */}
                                <div className="grid gap-2">
                                    <Label>Meeting Type *</Label>
                                    <Select
                                        value={meetingType}
                                        onValueChange={(v) => setMeetingType(v as 'single' | 'recurring')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">Single</SelectItem>
                                            <SelectItem value="recurring">Recurring</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Single */}
                                {/* {meetingType === 'single' && ( */}
                                    <div className="grid gap-2">
                                        <Label>Class Date & Time *</Label>
                                        <Input
                                            type="datetime-local"
                                            name="class_date"
                                            value={classDate}
                                            onChange={(e) => setClassDate(e.target.value)}
                                        />
                                        <InputError message={errors.class_date} />
                                    </div>
                                {/* )} */}

                                {hasTimeSlotMismatch && (
                                    <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                                        Warning: selected class time is outside batch time slot ({formatTimeSlot(batchTimeSlot)}). You need to confirm before save.
                                    </div>
                                )}
                                <InputError message={errors.confirm_mismatch} />

                                {/* Recurring */}
                                {meetingType === 'recurring' && (
                                    <div className="space-y-4 rounded border p-4">
                                        <input type="hidden" name="recurrence[type]" value="2" />

                                        <div className="grid gap-2">
                                            <Label>Repeat every (weeks)</Label>
                                            <Input type="number" min={1} name="recurrence[repeat_interval]" defaultValue={1} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Days</Label>
                                            <MultiSelect
                                                options={weekDays.map((d) => ({
                                                    value: d.id,
                                                    label: d.label,
                                                }))}
                                                value={weeklyDays}
                                                onChange={setWeeklyDays}
                                                placeholder="Select days"
                                            />
                                            {weeklyDays.map((d) => (
                                                <input key={d} type="hidden" name="recurrence[weekly_days][]" value={d} />
                                            ))}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>End Date *</Label>
                                            <Input type="datetime-local" name="recurrence[end_date_time]" />
                                        </div>
                                    </div>
                                )}

                                {/* Duration */}
                                <div className="grid gap-2">
                                    <Label>Duration (minutes) *</Label>
                                    <Input type="number" min={1} name="duration" defaultValue={60} />
                                </div>

                                {/* Participants */}
                                <div className="grid gap-2">
                                    <Label>Participants</Label>
                                    <MultiSelect
                                        options={students.map((s) => ({
                                            value: s.id,
                                            label: `${s.name} (${s.email})`,
                                        }))}
                                        value={selectedStudents}
                                        onChange={setSelectedStudents}
                                    />
                                </div>

                                {selectedStudents.map((id) => (
                                    <input key={id} type="hidden" name="participant_ids[]" value={id} />
                                ))}

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    className="w-fit"
                                    disabled={!!batchIssue}
                                    onClick={(e) => {
                                        if (!confirmMismatchInputRef.current) return;
                                        confirmMismatchInputRef.current.value = '0';

                                        if (!hasTimeSlotMismatch) return;

                                        const ok = window.confirm(
                                            `Selected class time is outside batch time slot (${formatTimeSlot(batchTimeSlot)}). Do you want to continue?`,
                                        );

                                        if (!ok) {
                                            e.preventDefault();
                                            return;
                                        }

                                        confirmMismatchInputRef.current.value = '1';
                                    }}
                                >
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Session
                                </Button>
                            </>
                        )}
                    </Form>
                </Card>
            </div>
        </AdminLayout>
    );
}

