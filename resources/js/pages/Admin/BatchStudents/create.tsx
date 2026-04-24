import BatchStudentController from "@/actions/App/Http/Controllers/Admin/BatchStudentController";
import AdminLayout from "@/layouts/admin-layout";

import { Form, Head, Link, usePage } from "@inertiajs/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import { formatTimeSlot } from "@/lib/time-slot";
import { AlertTriangle, LoaderCircle, User } from "lucide-react";
import { useMemo, useState } from "react";

export default function Create() {
    const { batches, students, statusOptions, defaults } = usePage().props as {
        batches: Array<{
            id: number;
            batch_code: string;
            class_name?: string | null;
            subject_name?: string | null;
            plan_title?: string | null;
            teacher_name?: string | null;
            teacher_email?: string | null;
            time_slot?: string | null;
            students_limit?: number | null;
            current_students_count: number;
            status?: string | null;
        }>;
        students: Array<{
            id: number;
            student_uid?: string | null;
            name?: string | null;
            email?: string | null;
            phone?: string | null;
            class_name?: string | null;
            board_name?: string | null;
            active_batches: Array<{
                id: number;
                batch_code: string;
                subject_name?: string | null;
                plan_title?: string | null;
                time_slot?: string | null;
            }>;
        }>;
        statusOptions: Array<{ id: string; name: string }>;
        defaults: { status: string; joined_at: string };
    };

    const [batchId, setBatchId] = useState<string>("");
    const [studentId, setStudentId] = useState<string>("");
    const [status, setStatus] = useState<string>(defaults.status || "active");

    const selectedBatch = useMemo(() => batches.find((b) => String(b.id) === batchId), [batches, batchId]);
    const selectedStudent = useMemo(() => students.find((s) => String(s.id) === studentId), [students, studentId]);

    const batchIsFull =
        !!selectedBatch?.students_limit &&
        Number(selectedBatch.current_students_count || 0) >= Number(selectedBatch.students_limit || 0);

    const conflictingBatch = selectedStudent?.active_batches?.find(
        (b) => b.time_slot && selectedBatch?.time_slot && b.time_slot === selectedBatch.time_slot,
    );

    return (
        <AdminLayout>
            <Head title="Allocate Student to Batch" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Allocate Student</h1>

                    <Link href="/admin/batch-students">
                        <Button>Back</Button>
                    </Link>
                </div>

                <Card className="p-6">
                    <div className="mx-auto w-full max-w-4xl">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold">Allocation Details</h2>
                            <p className="text-sm text-muted-foreground">
                                Fill all required fields and review student/batch information before saving.
                            </p>
                        </div>

                        <div className="mb-6 grid gap-4 lg:grid-cols-2">
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="text-sm font-semibold">Selected Batch Info</p>
                                {selectedBatch ? (
                                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                        <p>
                                            <span className="font-medium text-foreground">{selectedBatch.batch_code}</span>
                                        </p>
                                        <p>Class: {selectedBatch.class_name || "-"}</p>
                                        <p>Subject: {selectedBatch.subject_name || "-"}</p>
                                        <p>Plan: {selectedBatch.plan_title || "-"}</p>
                                        <p>
                                            Teacher: {selectedBatch.teacher_name || "-"}
                                            {selectedBatch.teacher_email ? ` (${selectedBatch.teacher_email})` : ""}
                                        </p>
                                        <p>
                                            Time: {selectedBatch.time_slot ? formatTimeSlot(selectedBatch.time_slot) : "-"}
                                        </p>
                                        <p>
                                            Strength: {selectedBatch.current_students_count || 0}/
                                            {selectedBatch.students_limit ?? "-"}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="mt-2 text-sm text-muted-foreground">Select a batch to view details.</p>
                                )}
                            </div>

                            <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="text-sm font-semibold">Selected Student Info</p>
                                {selectedStudent ? (
                                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                        <p className="font-medium text-foreground">{selectedStudent.name || "-"}</p>
                                        <p>UID: {selectedStudent.student_uid || "-"}</p>
                                        <p>Email: {selectedStudent.email || "-"}</p>
                                        <p>Phone: {selectedStudent.phone || "-"}</p>
                                        <p>Class: {selectedStudent.class_name || "-"}</p>
                                        <p>Board: {selectedStudent.board_name || "-"}</p>
                                        <div className="pt-1">
                                            <p className="font-medium text-foreground">Active Batches</p>
                                            {selectedStudent.active_batches?.length ? (
                                                <ul className="mt-1 space-y-1">
                                                    {selectedStudent.active_batches.map((b) => (
                                                        <li key={b.id}>
                                                            {b.batch_code}
                                                            {b.subject_name ? ` - ${b.subject_name}` : ""}
                                                            {b.time_slot ? ` (${formatTimeSlot(b.time_slot)})` : ""}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-muted-foreground">No active batches.</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-2 text-sm text-muted-foreground">Select a student to view details.</p>
                                )}
                            </div>
                        </div>

                        {batchIsFull && (
                            <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                                <div className="flex items-center gap-2 font-medium">
                                    <AlertTriangle className="h-4 w-4" />
                                    Batch capacity reached
                                </div>
                                <p className="mt-1">This batch has reached its configured student limit.</p>
                            </div>
                        )}

                        {conflictingBatch && (
                            <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                                <div className="flex items-center gap-2 font-medium">
                                    <AlertTriangle className="h-4 w-4" />
                                    Time slot conflict
                                </div>
                                <p className="mt-1">
                                    Student already has active batch <span className="font-semibold">{conflictingBatch.batch_code}</span> in
                                    the same time slot.
                                </p>
                            </div>
                        )}

                        <div className="rounded-lg border p-4">
                            <Form {...BatchStudentController.store.form()} resetOnSuccess disableWhileProcessing>
                                {({ errors, processing }) => (
                                    <div className="grid gap-5 md:grid-cols-2">

                                        {/* Batch */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="batch_id">Batch *</Label>

                                            <Select
                                                name="batch_id_select"
                                                value={batchId}
                                                onValueChange={(value) => setBatchId(value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Batch" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {batches.map((b) => (
                                                        <SelectItem key={b.id} value={String(b.id)}>
                                                            {b.batch_code} {b.subject_name ? `- ${b.subject_name}` : ""}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <input type="hidden" id="batch_id" name="batch_id" value={batchId} />

                                            <InputError message={errors.batch_id} />
                                        </div>

                                        {/* Student */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="student_id">Student *</Label>

                                            <Select
                                                name="student_id_select"
                                                value={studentId}
                                                onValueChange={(value) => setStudentId(value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Student" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {students.map((s) => (
                                                        <SelectItem key={s.id} value={String(s.id)}>
                                                            {s.name} {s.student_uid ? `(${s.student_uid})` : ""}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <input type="hidden" id="student_id" name="student_id" value={studentId} />

                                            <InputError message={errors.student_id} />
                                        </div>

                                        {/* Status */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="status">Status *</Label>

                                            <Select name="status_select" value={status} onValueChange={setStatus}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {statusOptions.map((s) => (
                                                        <SelectItem key={s.id} value={s.id}>
                                                            {s.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <input type="hidden" id="status" name="status" value={status} />

                                            <InputError message={errors.status} />
                                        </div>

                                        {/* Joined At */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="joined_at">Joined At *</Label>
                                            <Input id="joined_at" name="joined_at" type="datetime-local" defaultValue={defaults.joined_at} required />
                                            <InputError message={errors.joined_at} />
                                        </div>

                                        {/* Ended At */}
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="ended_at">
                                                Ended At {status === "active" ? "(optional for active)" : "*"}
                                            </Label>
                                            <Input id="ended_at" name="ended_at" type="datetime-local" required={status !== "active"} />
                                            <InputError message={errors.ended_at} />
                                        </div>

                                        {/* Submit */}
                                        <div className="md:col-span-2">
                                            <Button type="submit" className="mt-2 w-full md:w-fit">
                                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                Allocate Student
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Form>
                        </div>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
