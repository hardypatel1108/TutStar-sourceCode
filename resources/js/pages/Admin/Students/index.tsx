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
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import AdminLayout from '@/layouts/admin-layout';
import { dashboard } from '@/routes/admin';
import { create, destroy, edit, index, restore } from '@/routes/admin/students';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Students', href: index().url },
];

const selectClass = 'h-9 rounded-md border border-input bg-background px-3 text-sm';

export default function Index() {
    const { students, filters, classes, boards, plans, subjects } = usePage().props as any;
    const getInitials = useInitials();

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [classId, setClassId] = useState(filters.class || '');
    const [boardId, setBoardId] = useState(filters.board || '');
    const [batchId, setBatchId] = useState(filters.batch || '');
    const [subjectId, setSubjectId] = useState(filters.subject || '');
    const [planId, setPlanId] = useState(filters.plan || '');
    const [enrollmentStatus, setEnrollmentStatus] = useState(filters.enrollment_status || '');
    const [expiringInDays, setExpiringInDays] = useState(filters.expiring_in_days || '');
    const [allotted, setAllotted] = useState(filters.allotted || '');
    const [sortRegistered, setSortRegistered] = useState(filters.sort_registered || 'latest');
    const [dobFrom, setDobFrom] = useState(filters.dob_from || '');
    const [dobTo, setDobTo] = useState(filters.dob_to || '');

    const { delete: deleteStudent, processing } = useForm();
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [imageOpen, setImageOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [imageAlt, setImageAlt] = useState<string>('');

    const handleFilterChange = (key: string, value: string) => {
        const params: Record<string, string> = {
            search,
            status,
            class: classId,
            board: boardId,
            batch: batchId,
            subject: subjectId,
            plan: planId,
            enrollment_status: enrollmentStatus,
            expiring_in_days: expiringInDays,
            allotted,
            sort_registered: sortRegistered,
            dob_from: dobFrom,
            dob_to: dobTo,
        };

        params[key] = value;
        router.get(index().url, params, { preserveState: true, preserveScroll: true });
    };

    const handleBlock = (id: number) => {
        deleteStudent(destroy({ student: id }).url, { preserveScroll: true });
    };

    const handleRestore = (id: number) => {
        router.post(restore({ id }).url, {}, { preserveScroll: true });
    };

    const stats = useMemo(() => {
        const rows = students?.data ?? [];
        return {
            total: students?.total ?? 0,
            active: rows.filter((s: any) => s.enrollment_status === 'active').length,
            expiring: rows.filter((s: any) => s.enrollment_status === 'expiring_soon').length,
        };
    }, [students]);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />

            <div className="space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
                        <p className="text-sm text-muted-foreground">Manage student profile, enrollments, plans and expiry from one view.</p>
                    </div>
                    <Link href={create().url}>
                        <Button>Add Student</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Card className="p-4">
                        <p className="text-xs text-muted-foreground">Total Students</p>
                        <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-xs text-muted-foreground">Active (Current Page)</p>
                        <p className="mt-1 text-2xl font-semibold text-emerald-600">{stats.active}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-xs text-muted-foreground">Expiring Soon (Current Page)</p>
                        <p className="mt-1 text-2xl font-semibold text-amber-600">{stats.expiring}</p>
                    </Card>
                </div>

                <Card className="p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Quickly narrow down students using combined filters.</p>
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                        <div className="min-w-64">
                        <Input
                                title="Search name, email, UID, city, phone, batch" placeholder="Search name, email, UID, city, phone, batch"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    handleFilterChange('search', e.target.value);
                                }}
                            />
                        </div>

                        <div className="min-w-40">
                        <select title="Select" value={status} onChange={(e) => { setStatus(e.target.value); handleFilterChange('status', e.target.value); }} className={selectClass}>
                                <option value="">Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="blocked">Blocked</option>
                            </select>
                        </div>

                        <div className="min-w-40">
                        <select title="Select" value={classId} onChange={(e) => { setClassId(e.target.value); handleFilterChange('class', e.target.value); }} className={selectClass}>
                                <option value="">Class</option>
                                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="min-w-40">
                        <select title="Select" value={boardId} onChange={(e) => { setBoardId(e.target.value); handleFilterChange('board', e.target.value); }} className={selectClass}>
                                <option value="">Board</option>
                                {boards.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>

                        <div className="min-w-40">
                        <select title="Select" value={subjectId} onChange={(e) => { setSubjectId(e.target.value); handleFilterChange('subject', e.target.value); }} className={selectClass}>
                                <option value="">Subject</option>
                                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="min-w-40">
                        <select title="Select" value={planId} onChange={(e) => { setPlanId(e.target.value); handleFilterChange('plan', e.target.value); }} className={selectClass}>
                                <option value="">Plan</option>
                                {plans.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                        </div>

                        <div className="min-w-56">
                        <Input value={batchId} title="Batch ID / Code" placeholder="Batch ID / Code" onChange={(e) => { setBatchId(e.target.value); handleFilterChange('batch', e.target.value); }} />
                        </div>

                        <div className="min-w-40">
                        <select title="Select" value={allotted} onChange={(e) => { setAllotted(e.target.value); handleFilterChange('allotted', e.target.value); }} className={selectClass}>
                                <option value="">Allotment</option>
                                <option value="allotted">Allotted</option>
                                <option value="unallotted">Unallotted</option>
                            </select>
                        </div>

                        <div className="min-w-40">
                        <select title="Select" value={enrollmentStatus} onChange={(e) => { setEnrollmentStatus(e.target.value); handleFilterChange('enrollment_status', e.target.value); }} className={selectClass}>
                                <option value="">Enrollment</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="expiring_soon">Expiring Soon</option>
                            </select>
                        </div>

                        <div className="min-w-40">
                        <select title="Select" value={expiringInDays} onChange={(e) => { setExpiringInDays(e.target.value); handleFilterChange('expiring_in_days', e.target.value); }} className={selectClass}>
                                <option value="">Expiring In</option>
                                <option value="5">5 days</option>
                                <option value="2">2 days</option>
                                <option value="1">1 day</option>
                            </select>
                        </div>

                        <div className="min-w-40">
                        <select title="Select" value={sortRegistered} onChange={(e) => { setSortRegistered(e.target.value); handleFilterChange('sort_registered', e.target.value); }} className={selectClass}>
                                <option value="latest">Sort: Latest</option>
                                <option value="oldest">Sort: Oldest</option>
                            </select>
                        </div>

                        <div>
                            <Input type="date" title="DOB From" placeholder="DOB From" value={dobFrom} onChange={(e) => { setDobFrom(e.target.value); handleFilterChange('dob_from', e.target.value); }} />
                        </div>

                        <div>
                            <Input type="date" title="DOB To" placeholder="DOB To" value={dobTo} onChange={(e) => { setDobTo(e.target.value); handleFilterChange('dob_to', e.target.value); }} />
                        </div>

                        <div className="min-w-40">
                            <Button type="button" variant="outline" onClick={() => router.get(index().url)} className="w-full">
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white p-0 shadow-sm">
                    <div className="max-h-[68vh] overflow-auto">
                        <Table>
                            <TableHeader className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur">
                                <TableRow>
                                    <TableHead className="w-14">#</TableHead>
                                    <TableHead>UID</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Class / Board</TableHead>
                                    <TableHead>Batches</TableHead>
                                    <TableHead>Plans</TableHead>
                                    <TableHead>Enrollment</TableHead>
                                    <TableHead>Expiry</TableHead>
                                    <TableHead>Registered</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {students.data.length > 0 ? (
                                    students.data.map((student: any, rowIndex: number) => (
                                        <TableRow
                                            key={student.id}
                                            className={student.enrollment_status === 'expiring_soon' ? 'bg-amber-50/70 hover:bg-amber-100/70' : 'hover:bg-muted/40'}
                                        >
                                            <TableCell>{(students.current_page - 1) * students.per_page + (rowIndex + 1)}</TableCell>
                                            <TableCell><span className="rounded bg-muted px-2 py-1 text-xs font-medium">{student.student_uid || '-'}</span></TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {student?.user?.profile_image ? (
                                                        <button
                                                            type="button"
                                                            className="h-9 w-9 overflow-hidden rounded-full"
                                                            onClick={() => {
                                                                setSelectedStudent(student);
                                                                setDetailsOpen(true);
                                                            }}
                                                        >
                                                            <img src={`/storage/${student.user.profile_image}`} alt={student?.user?.name} className="h-9 w-9 rounded-full object-cover" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="h-9 w-9"
                                                            onClick={() => {
                                                                setSelectedStudent(student);
                                                                setDetailsOpen(true);
                                                            }}
                                                        >
                                                            <Avatar className="h-9 w-9 overflow-hidden rounded-full">
                                                                <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">{getInitials(student?.user?.name)}</AvatarFallback>
                                                            </Avatar>
                                                        </button>
                                                    )}
                                                    <div className="min-w-0">
                                                        <button
                                                            type="button"
                                                            className="block max-w-full truncate text-left text-sm font-medium hover:underline"
                                                            onClick={() => {
                                                                setSelectedStudent(student);
                                                                setDetailsOpen(true);
                                                            }}
                                                        >
                                                            {student.user?.name || '-'}
                                                        </button>
                                                        <p className="truncate text-xs text-muted-foreground">{student.user?.email || '-'} | {student.user?.phone || '-'}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{student.clazz?.name || '-'}</div>
                                                <div className="text-xs text-muted-foreground">{student.clazz?.board?.name || '-'}</div>
                                            </TableCell>
                                            <TableCell className="max-w-48"><span className="line-clamp-2 text-sm">{student.batch_codes_csv || '-'}</span></TableCell>
                                            <TableCell className="max-w-56"><span className="line-clamp-2 text-sm">{student.plans_csv || '-'}</span></TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={student.enrollment_status === 'active' ? 'success' : student.enrollment_status === 'expiring_soon' ? 'secondary' : 'destructive'}
                                                >
                                                    {student.enrollment_status === 'expiring_soon' ? 'Expiring Soon' : student.enrollment_status === 'active' ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {student.nearest_expiry_formatted ? (
                                                    <div className="space-y-1">
                                                        <Link href={student.payments_link} className="text-xs font-medium text-primary underline-offset-2 hover:underline">
                                                            {student.nearest_expiry_formatted}
                                                        </Link>
                                                        {student.expires_in_days !== null ? (
                                                            <div className="text-xs text-muted-foreground">
                                                                {Number(student.expires_in_days) >= 0
                                                                    ? `${Math.floor(Number(student.expires_in_days))} day(s) left`
                                                                    : `${Math.floor(Math.abs(Number(student.expires_in_days)))} day(s) ago`}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{student.registered_at_formatted || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedStudent(student);
                                                                setDetailsOpen(true);
                                                            }}
                                                        >
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild><Link href={edit({ student: student.id }).url}>Edit</Link></DropdownMenuItem>
                                                        {student.deleted_at ? (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem className="text-green-600" onSelect={(e) => e.preventDefault()}>Restore</DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Restore Student</AlertDialogTitle>
                                                                        <AlertDialogDescription>This will restore the student account.</AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleRestore(student.id)} disabled={processing} className="bg-green-600 text-white hover:bg-green-700">
                                                                            {processing ? 'Restoring...' : 'Confirm'}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        ) : (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>Block</DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Block Student</AlertDialogTitle>
                                                                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleBlock(student.id)} disabled={processing} className="bg-red-600 text-white hover:bg-red-700">
                                                                            {processing ? 'Blocking...' : 'Confirm'}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">No students found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {students.total > students.per_page && (
                        <div className="flex justify-end space-x-2 border-t p-4">
                            {students.links.map((link: any, idx: number) =>
                                link.url ? (
                                    <Button key={idx} variant={link.active ? 'default' : 'outline'} onClick={() => router.visit(link.url, { preserveScroll: true })} size="sm">
                                        {link.label.replace('&laquo;', '<<').replace('&raquo;', '>>')}
                                    </Button>
                                ) : null,
                            )}
                        </div>
                    )}
                </Card>

                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Student Profile</DialogTitle>
                        </DialogHeader>
                        {selectedStudent && (
                            <div className="space-y-4 text-sm">
                                <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/20 p-5">
                                    {selectedStudent?.user?.profile_image ? (
                                        <button
                                            type="button"
                                            className="h-28 w-28 rounded-full"
                                            onClick={() => {
                                                setImageSrc(`/storage/${selectedStudent.user.profile_image}`);
                                                setImageAlt(selectedStudent?.user?.name || 'Student');
                                                setImageOpen(true);
                                            }}
                                        >
                                            <Avatar className="h-28 w-28 rounded-full border-2 border-background shadow-sm">
                                                <AvatarImage
                                                    src={`/storage/${selectedStudent.user.profile_image}`}
                                                    alt={selectedStudent?.user?.name || 'Student'}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="text-lg font-semibold">
                                                    {getInitials(selectedStudent?.user?.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </button>
                                    ) : (
                                        <Avatar className="h-28 w-28 rounded-full border-2 border-background shadow-sm">
                                            <AvatarFallback className="text-lg font-semibold">
                                                {getInitials(selectedStudent?.user?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <p className="mt-3 text-base font-semibold">{selectedStudent.user?.name || '-'}</p>
                                    <p className="text-xs text-muted-foreground">{selectedStudent.student_uid || '-'}</p>
                                </div>

                                <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Name</p>
                                        <p className="font-medium">{selectedStudent.user?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">UID</p>
                                        <p className="font-medium">{selectedStudent.student_uid || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p className="font-medium">{selectedStudent.user?.email || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Phone</p>
                                        <p className="font-medium">{selectedStudent.user?.phone || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Class</p>
                                        <p className="font-medium">{selectedStudent.clazz?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Board</p>
                                        <p className="font-medium">{selectedStudent.clazz?.board?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">DOB</p>
                                        <p className="font-medium">{selectedStudent.dob_date_formatted || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Registered</p>
                                        <p className="font-medium">{selectedStudent.registered_at_formatted || '-'}</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Enrollment Status</p>
                                        <p className="font-medium">
                                            {selectedStudent.enrollment_status === 'expiring_soon'
                                                ? 'Expiring Soon'
                                                : selectedStudent.enrollment_status === 'active'
                                                  ? 'Active'
                                                  : 'Inactive'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Nearest Expiry</p>
                                        <p className="font-medium">{selectedStudent.nearest_expiry_formatted || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Batches</p>
                                        <p className="font-medium">{selectedStudent.batch_codes_csv || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Batch IDs</p>
                                        <p className="font-medium">{selectedStudent.batch_ids_csv || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Plans</p>
                                        <p className="font-medium">{selectedStudent.plans_csv || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Subjects</p>
                                        <p className="font-medium">{selectedStudent.subjects_csv || '-'}</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">School</p>
                                        <p className="font-medium">{selectedStudent.school || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">City / State</p>
                                        <p className="font-medium">{selectedStudent.city || '-'}, {selectedStudent.state || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={imageOpen} onOpenChange={setImageOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Student Image</DialogTitle>
                        </DialogHeader>
                        {imageSrc ? (
                            <div className="flex items-center justify-center">
                                <img src={imageSrc} alt={imageAlt} className="max-h-[70vh] w-auto rounded-lg object-contain" />
                            </div>
                        ) : null}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}




