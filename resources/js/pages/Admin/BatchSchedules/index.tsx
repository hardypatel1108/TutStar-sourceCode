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
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { dashboard as dashboardIndex } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/batchSchedules';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import dayjs from 'dayjs';

interface Schedule {
  id: number;
  start_datetime: string;
  end_datetime: string;
  batch?: {
    id: number;
    batch_code: string;
    plan?: { title: string };
    clazz?: { name: string };
    subject?: { name: string };
    teacher?: { user: { name: string } };
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: dashboardIndex().url },
  { title: 'Batch Schedules', href: index().url },
];

export default function Index() {
  const { schedules, batches, filters } = usePage().props as {
    schedules: any;
    batches: { id: number; batch_code: string }[];
    filters: any;
  };

  const [batchId, setBatchId] = useState(filters.batch || '');
  const [from, setFrom] = useState(filters.from || '');
  const [to, setTo] = useState(filters.to || '');
  const { delete: deleteSchedule, processing } = useForm();

  const handleFilterChange = (type: string, value: string) => {
    const params = { batch: batchId, from, to };
    params[type] = value;
    router.get(index().url, params, { preserveState: true, preserveScroll: true });
  };

  const handleDelete = (id: number) => {
    deleteSchedule(destroy({ schedule: id }).url, { preserveScroll: true });
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Batch Schedules" />
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Batch Schedules</h1>
          <Link href={create().url}>
            <Button>Add Schedule</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="rounded-lg border bg-card p-3">
          <div className="mb-3">
            <h2 className="text-base font-semibold">Filters</h2>
            <p className="text-sm text-muted-foreground">Refine batch schedules</p>

          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex min-w-48 flex-col gap-1">

              <select title="Select"
                value={batchId}
                onChange={(e) => {
                  setBatchId(e.target.value);
                  handleFilterChange('batch', e.target.value);
                }}
                className="rounded-md border border-input bg-background p-2 text-sm"
              >
                <option value="">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batch_code}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex min-w-40 flex-col gap-1">

              <Input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  handleFilterChange('from', e.target.value);
                }}
                className="w-40"
              />
            </div>

            <div className="flex min-w-40 flex-col gap-1">

              <Input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  handleFilterChange('to', e.target.value);
                }}
                className="w-40"
              />
            </div>
                    <div className="mt-3">
                        <Button type="button" variant="outline" onClick={() => router.get(index().url)}>
                            Clear Filters
                        </Button>
                    </div>
          </div>
        </div>

        {/* Table */}
        <Card className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Batch Code</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {schedules.data.length > 0 ? (
                schedules.data.map((schedule: Schedule, index: number) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      {(schedules.current_page - 1) * schedules.per_page + (index + 1)}
                    </TableCell>
                    <TableCell>{schedule.batch?.batch_code || '—'}</TableCell>
                    <TableCell>{schedule.batch?.clazz?.name || '—'}</TableCell>
                    <TableCell>{schedule.batch?.subject?.name || '—'}</TableCell>
                    <TableCell>{schedule.batch?.plan?.title || '—'}</TableCell>
                    <TableCell>{schedule.batch?.teacher?.user?.name || '—'}</TableCell>
                    <TableCell>{dayjs(schedule.start_datetime).format('DD MMM YYYY, hh:mm A')}</TableCell>
                    <TableCell>{dayjs(schedule.end_datetime).format('DD MMM YYYY, hh:mm A')}</TableCell>

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
                            <Link href={edit({ schedule: schedule.id }).url}>Edit</Link>
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onSelect={(e) => e.preventDefault()}
                              >
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this schedule? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(schedule.id)}
                                  disabled={processing}
                                  className="bg-red-600 text-white hover:bg-red-700"
                                >
                                  {processing ? 'Deleting...' : 'Confirm'}
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
                  <TableCell colSpan={9} className="py-4 text-center text-muted-foreground">
                    No schedules found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {schedules.total > schedules.per_page && (
            <div className="flex justify-end space-x-2 p-4">
              {schedules.links.map((link: any, idx: number) =>
                link.url ? (
                  <Button
                    key={idx}
                    variant={link.active ? 'default' : 'outline'}
                    onClick={() => router.visit(link.url, { preserveScroll: true })}
                    size="sm"
                  >
                    {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
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


