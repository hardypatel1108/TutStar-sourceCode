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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import AdminLayout from "@/layouts/admin-layout";
import { dashboard as dashboardIndex } from "@/routes/admin";
import { create, destroy, edit, index } from "@/routes/admin/studentSubscriptions";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

const breadcrumbs = [
  { title: "Dashboard", href: dashboardIndex().url },
  { title: "Subscriptions", href: index().url },
];

export default function Index() {
  const { subscriptions, filters, plans, students, classes, boards } = usePage().props as any;

  // Filters
  const [search, setSearch] = useState(filters.search || "");
  const [status, setStatus] = useState(filters.status || "");
  const [planId, setPlanId] = useState(filters.plan || "");
  const [studentId, setStudentId] = useState(filters.student || "");
  const [classId, setClassId] = useState(filters.class || "");
  const [boardId, setBoardId] = useState(filters.board || "");
  const [studentStatus, setStudentStatus] = useState(filters.student_status || "");
  const [startAt, setStartAt] = useState(filters.start_at || "");
  const [endAt, setEndAt] = useState(filters.end_at || "");
  const [autoRenew, setAutoRenew] = useState(filters.auto_renew ?? "");
  const [city, setCity] = useState(filters.city || "");
  const [state, setState] = useState(filters.state || "");
  const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || "");
  const [gateway, setGateway] = useState(filters.gateway || "");
  const [priceMin, setPriceMin] = useState(filters.price_min || "");
  const [priceMax, setPriceMax] = useState(filters.price_max || "");

  const { delete: deleteSubscription, processing } = useForm();

  const handleFilterChange = (key: string, value: string) => {
    const params = {
      search,
      status,
      plan: planId,
      student: studentId,
      class: classId,
      board: boardId,
      student_status: studentStatus,
      start_at: startAt,
      end_at: endAt,
      auto_renew: autoRenew,
      city,
      state,
      payment_status: paymentStatus,
      gateway,
      price_min: priceMin,
      price_max: priceMax,
    };
    params[key] = value;
    router.get(index().url, params, { preserveState: true, preserveScroll: true });
  };

  const handleDelete = (id: number) => {
    deleteSubscription(destroy({ student_subscription: id }).url, { preserveScroll: true });
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Student Subscriptions" />

      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Student Subscriptions</h1>
          <Link href={create().url}>
            <Button>Add Subscription</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="rounded-lg border bg-card p-3">
          <div className="mb-3">
            <h2 className="text-base font-semibold">Filters</h2>
            <p className="text-sm text-muted-foreground">Refine student subscriptions</p>

          </div>
          <div className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-64 flex-col gap-1">

            <Input
              title="Search by student name, email, UID..." placeholder="Search by student name, email, UID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange("search", e.target.value);
              }}
              className="w-64"
            />
          </div>

          <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">Subscription Status</label><select title="Select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              handleFilterChange("status", e.target.value);
            }}
            className="rounded-md border p-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select></div>

          <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">Plan</label><select title="Select"
            value={planId}
            onChange={(e) => {
              setPlanId(e.target.value);
              handleFilterChange("plan", e.target.value);
            }}
            className="rounded-md border p-2 text-sm"
          >
            <option value="">All Plans</option>
            {plans.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select></div>

          <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">Student</label><select title="Select"
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              handleFilterChange("student", e.target.value);
            }}
            className="rounded-md border p-2 text-sm"
          >
            <option value="">All Students</option>
            {students.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select></div>

          <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">Class</label><select title="Select"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              handleFilterChange("class", e.target.value);
            }}
            className="rounded-md border p-2 text-sm"
          >
            <option value="">All Classes</option>
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select></div>

          <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">Board</label><select title="Select"
            value={boardId}
            onChange={(e) => {
              setBoardId(e.target.value);
              handleFilterChange("board", e.target.value);
            }}
            className="rounded-md border p-2 text-sm"
          >
            <option value="">All Boards</option>
            {boards.map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select></div>

          <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">Student Status</label><select title="Select"
            value={studentStatus}
            onChange={(e) => {
              setStudentStatus(e.target.value);
              handleFilterChange("student_status", e.target.value);
            }}
            className="rounded-md border p-2 text-sm"
          >
            <option value="">Student Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select></div>

          <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">Start At</label><Input
            type="date"
            value={startAt}
            onChange={(e) => {
              setStartAt(e.target.value);
              handleFilterChange("start_at", e.target.value);
            }}
            placeholder="Start Date"
          /></div>

          <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">End At</label><Input
            type="date"
            value={endAt}
            onChange={(e) => {
              setEndAt(e.target.value);
              handleFilterChange("end_at", e.target.value);
            }}
            placeholder="End Date"
          /></div>

          <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">Auto Renew</label><select title="Select"
            value={autoRenew}
            onChange={(e) => {
              setAutoRenew(e.target.value);
              handleFilterChange("auto_renew", e.target.value);
            }}
            className="rounded-md border p-2 text-sm"
          >
            <option value="">Auto Renew</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select></div>

          <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">City</label><Input
            title="City" placeholder="City"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              handleFilterChange("city", e.target.value);
            }}
          /></div>

          <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">State</label><Input
            title="State" placeholder="State"
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              handleFilterChange("state", e.target.value);
            }}
          /></div>

          <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">Payment Status</label><select title="Select"
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              handleFilterChange("payment_status", e.target.value);
            }}
            className="rounded-md border p-2 text-sm"
          >
            <option value="">Payment Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select></div>

          <div className="flex min-w-40 flex-col gap-1"><label className="text-sm font-medium">Gateway</label><select title="Select"
            value={gateway}
            onChange={(e) => {
              setGateway(e.target.value);
              handleFilterChange("gateway", e.target.value);
            }}
            className="rounded-md border p-2 text-sm"
          >
            <option value="">Payment Gateway</option>
            <option value="manual">Manual</option>
            <option value="phonepe">PhonePe</option>
          </select></div>

          <div className="flex min-w-32 flex-col gap-1"><label className="text-sm font-medium">Min Price</label><Input
            type="number"
            title="Min Price" placeholder="Min Price"
            value={priceMin}
            onChange={(e) => {
              setPriceMin(e.target.value);
              handleFilterChange("price_min", e.target.value);
            }}
            className="w-32"
          /></div>

          <div className="flex min-w-32 flex-col gap-1"><label className="text-sm font-medium">Max Price</label><Input
            type="number"
            title="Max Price" placeholder="Max Price"
            value={priceMax}
            onChange={(e) => {
              setPriceMax(e.target.value);
              handleFilterChange("price_max", e.target.value);
            }}
            className="w-32"
          /></div>
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
                <TableHead>Student UID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Board</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price Paid</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {subscriptions.data.length > 0 ? (
                subscriptions.data.map((sub: any, index: number) => (
                  <TableRow key={sub.id}>
                    <TableCell>{(subscriptions.current_page - 1) * subscriptions.per_page + (index + 1)}</TableCell>
                    <TableCell>{sub.student?.student_uid || "—"}</TableCell>
                    <TableCell>{sub.student?.user?.name || "—"}</TableCell>
                    <TableCell>{sub.student?.user?.email || "—"}</TableCell>
                    <TableCell>{sub.student?.clazz?.name || "—"}</TableCell>
                    <TableCell>{sub.student?.clazz?.board_id || "—"}</TableCell>
                    <TableCell>{sub.plan?.title || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={sub.status === "active" ? "success" : "destructive"}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{sub.price_paid || "—"}</TableCell>
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
                            <Link href={edit({ student_subscription: sub.id }).url}>Edit</Link>
                          </DropdownMenuItem>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-red-600"
                                onSelect={(e) => e.preventDefault()}
                              >
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(sub.id)}
                                  disabled={processing}
                                  className="bg-red-600 text-white hover:bg-red-700"
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
                  <TableCell colSpan={10} className="py-4 text-center text-muted-foreground">
                    No subscriptions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {subscriptions.total > subscriptions.per_page && (
            <div className="flex justify-end space-x-2 p-4">
              {subscriptions.links.map((link: any, idx: number) =>
                link.url ? (
                  <Button
                    key={idx}
                    variant={link.active ? "default" : "outline"}
                    onClick={() => router.visit(link.url, { preserveScroll: true })}
                    size="sm"
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



