import BatchController from '@/actions/App/Http/Controllers/Admin/BatchController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { index as batchesIndex } from '@/routes/admin/batches';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { formatTimeSlot, resolveTimeSlotFromRange } from '@/lib/time-slot';

type PlanItem = {
    id: number;
    title: string;
    class_id: number;
    class_name?: string | null;
    board_name?: string | null;
    type: string;
    duration_days: number | null;
    price: number;
    status: string;
    description?: string | null;
    subjects: Array<{ id: number; name: string }>;
};

export default function Create() {
    const { plans } = usePage().props as { plans: PlanItem[] };

    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [timeFrom, setTimeFrom] = useState('');
    const [timeTo, setTimeTo] = useState('');
    const [teacherOptions, setTeacherOptions] = useState<Array<{ id: number; name: string }>>([]);

    const statusOptions = [
        { id: 'upcoming', name: 'Upcoming' },
        { id: 'active', name: 'Active' },
        { id: 'inactive', name: 'Inactive' },
        { id: 'completed', name: 'Completed' },
    ];

    useEffect(() => {
        setSelectedTimeSlot(resolveTimeSlotFromRange(timeFrom, timeTo) ?? '');
    }, [timeFrom, timeTo]);

    const selectedPlan = useMemo(
        () => plans.find((plan) => String(plan.id) === selectedPlanId),
        [plans, selectedPlanId],
    );

    useEffect(() => {
        if (!selectedPlan) {
            setSelectedClassId('');
            setSelectedSubjectId('');
            setTeacherOptions([]);
            return;
        }

        const nextClassId = String(selectedPlan.class_id);
        setSelectedClassId(nextClassId);

        if (selectedPlan.subjects.length === 1) {
            setSelectedSubjectId(String(selectedPlan.subjects[0].id));
        } else {
            setSelectedSubjectId('');
        }

        setTeacherOptions([]);
    }, [selectedPlan]);

    useEffect(() => {
        const fetchEligibleTeachers = async () => {
            if (!selectedSubjectId || !selectedTimeSlot) {
                setTeacherOptions([]);
                return;
            }

            const params = new URLSearchParams({
                subject_id: selectedSubjectId,
                time_slot: selectedTimeSlot,
                class_id: selectedClassId,
            });

            const res = await fetch(`/admin/eligible-teachers?${params.toString()}`);
            const data = await res.json();
            setTeacherOptions(data);
        };

        fetchEligibleTeachers();
    }, [selectedSubjectId, selectedTimeSlot, selectedClassId]);

    return (
        <AdminLayout>
            <Head title="Create Batch" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Add Batch</h1>
                    <Link href={batchesIndex().url}>
                        <Button variant="outline">Back</Button>
                    </Link>
                </div>

                <Card className="p-6">
                    <Form {...BatchController.store.form()} resetOnSuccess disableWhileProcessing>
                        {({ errors, processing }) => (
                            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                                <section className="space-y-4 rounded-lg border bg-muted/20 p-4">
                                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">Batch Basics</h3>

                                    <div className="grid gap-2">
                                        <Label htmlFor="batch_code">Batch Code *</Label>
                                        <Input id="batch_code" name="batch_code" required />
                                        <InputError message={errors.batch_code} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Plan *</Label>
                                        <Select
                                            name="plan_id"
                                            onValueChange={(value) => {
                                                setSelectedPlanId(value);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Plan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {plans.map((plan) => (
                                                    <SelectItem key={plan.id} value={String(plan.id)}>
                                                        {plan.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.plan_id} />
                                    </div>

                                    {selectedPlan && (
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                            <p className="mb-3 text-sm font-semibold text-blue-900">Plan Information</p>
                                            <div className="grid gap-2 text-sm text-blue-900 md:grid-cols-2">
                                                <p>
                                                    <span className="font-medium">Title:</span> {selectedPlan.title}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Type:</span> {selectedPlan.type}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Price:</span> INR {selectedPlan.price}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Duration:</span>{' '}
                                                    {selectedPlan.duration_days ? `${selectedPlan.duration_days} days` : '-'}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Board/Class:</span> {selectedPlan.board_name ?? '-'} / {selectedPlan.class_name ?? '-'}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Status:</span> {selectedPlan.status}
                                                </p>
                                                <p className="md:col-span-2">
                                                    <span className="font-medium">Subjects:</span>{' '}
                                                    {selectedPlan.subjects.length > 0 ? selectedPlan.subjects.map((subject) => subject.name).join(', ') : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedClassId && <input type="hidden" name="class_id" value={selectedClassId} />}
                                    <div className="grid gap-2">
                                        <Label>Class *</Label>
                                        <Input value={selectedPlan?.class_name ?? ''} readOnly title="Select plan to auto-fill class" placeholder="Select plan to auto-fill class" />
                                        <InputError message={errors.class_id} />
                                    </div>

                                    {selectedPlan && selectedPlan.subjects.length === 1 ? (
                                        <>
                                            <input type="hidden" name="subject_id" value={String(selectedPlan.subjects[0].id)} />
                                            <div className="grid gap-2">
                                                <Label>Subject *</Label>
                                                <Input value={selectedPlan.subjects[0].name} readOnly />
                                                <p className="text-xs text-muted-foreground">Auto-selected because this plan has only one subject.</p>
                                                <InputError message={errors.subject_id} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="grid gap-2">
                                            <Label>Subject *</Label>
                                            <Select
                                                name="subject_id"
                                                disabled={!selectedPlan || selectedPlan.subjects.length === 0}
                                                onValueChange={(value) => setSelectedSubjectId(value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Subject" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(selectedPlan?.subjects ?? []).map((subject) => (
                                                        <SelectItem key={subject.id} value={String(subject.id)}>
                                                            {subject.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.subject_id} />
                                        </div>
                                    )}
                                </section>

                                <section className="space-y-4 rounded-lg border bg-muted/20 p-4">
                                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">Scheduling And Capacity</h3>

                                    <div className="grid gap-2">
                                        <Label>Batch Time From *</Label>
                                        <Input name="time_from" type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} required />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Batch Time To *</Label>
                                        <Input name="time_to" type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} required />
                                    </div>

                                    <input type="hidden" name="time_slot" value={selectedTimeSlot} />
                                    {selectedTimeSlot && <p className="text-xs text-muted-foreground">Selected slot: {formatTimeSlot(selectedTimeSlot)}</p>}
                                    <div className="grid gap-2">
                                        <InputError message={errors.time_slot} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Teacher *</Label>
                                        <Select name="teacher_id" disabled={!selectedSubjectId || !selectedTimeSlot || teacherOptions.length === 0}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Teacher" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teacherOptions.map((teacher) => (
                                                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                                                        {teacher.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {!selectedSubjectId || !selectedTimeSlot ? (
                                            <p className="text-xs text-muted-foreground">Select subject and time slot to load eligible teachers.</p>
                                        ) : teacherOptions.length === 0 ? (
                                            <p className="text-xs text-red-600">No eligible teachers available for selected subject + time slot.</p>
                                        ) : null}
                                        <InputError message={errors.teacher_id} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Students Limit *</Label>
                                        <Input name="students_limit" type="number" min="1" required />
                                        <InputError message={errors.students_limit} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Status *</Label>
                                        <Select name="status">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status.id} value={status.id}>
                                                        {status.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.status} />
                                    </div>
                                </section>

                                <div className="text-center">
                                    <Button type="submit" className="min-w-44">
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Create Batch
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Form>
                </Card>
            </div>
        </AdminLayout>
    );
}


