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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { dashboard as dashboardindex } from '@/routes/admin';
import { create, edit, destroy, index } from '@/routes/admin/checkoutPlans';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { type BreadcrumbItem } from '@/types';

interface CheckoutPlanItem {
    id: number;
    title: string;
    months: number;
    offers_count: number;
}

interface PlanGroup {
    id: number;
    title: string;
    checkout_plans: CheckoutPlanItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboardindex().url },
    { title: 'Checkout Plans', href: index().url },
];

export default function Index() {
    const { plans } = usePage().props as {
        plans: PlanGroup[];
    };

    const { delete: deletePlan, processing } = useForm();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanGroup | null>(null);

    const handleDelete = (id: number) => {
        deletePlan(destroy({ checkout_plan: id }).url, { preserveScroll: true });
    };

    const openDetails = (plan: PlanGroup) => {
        setSelectedPlan(plan);
        setDialogOpen(true);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Checkout Plans" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Checkout Plans</h1>
                    <Link href={create().url}>
                        <Button>Add Plan</Button>
                    </Link>
                </div>

                {/* Table */}
                <Card className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Months</TableHead>
                                <TableHead>Total Offers</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {plans.length > 0 ? (
                                plans.map((plan, index) => {
                                    const monthsList = plan.checkout_plans
                                        .map((cp) => cp.months)
                                        .filter((val) => Number.isFinite(val))
                                        .sort((a, b) => a - b)
                                        .join(' / ');
                                    const totalOffers = plan.checkout_plans.reduce((sum, item) => sum + Number(item.offers_count || 0), 0);

                                    return (
                                        <TableRow key={plan.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{plan.title}</TableCell>
                                            <TableCell>{monthsList || '-'}</TableCell>
                                            <TableCell>
                                                <Badge>{totalOffers}</Badge>
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
                                                        <DropdownMenuItem onClick={() => openDetails(plan)}>View Plans</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-4 text-center text-muted-foreground">
                                        No checkout plans found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[92vh] w-[96vw] max-w-5xl overflow-hidden p-0">
                    <div className="border-b bg-muted/20 px-6 py-5">
                        <DialogTitle className="text-lg font-semibold">
                            {selectedPlan?.title || 'Checkout Plans'}
                        </DialogTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Total Plans: {selectedPlan?.checkout_plans?.length ?? 0}
                        </p>
                    </div>
                    {selectedPlan && (
                        <div className="max-h-[calc(92vh-90px)] overflow-y-auto px-6 py-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {selectedPlan.checkout_plans.map((plan) => (
                                    <div key={plan.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-base font-semibold">{plan.title || 'Checkout Plan'}</p>
                                                <p className="text-xs text-muted-foreground">Months: {plan.months}</p>
                                            </div>
                                            <Badge variant="secondary" className="px-2 py-1 text-xs">
                                                {plan.offers_count} Offer{plan.offers_count === 1 ? '' : 's'}
                                            </Badge>
                                        </div>

                                        <div className="mt-4 flex items-center justify-end gap-2">
                                            <Link href={edit({ checkout_plan: plan.id }).url}>
                                                <Button size="sm" variant="outline">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" variant="destructive" disabled={processing}>
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete this plan? All related offers will also be deleted.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(plan.id)}
                                                            disabled={processing}
                                                            className="bg-red-600 text-white hover:bg-red-700"
                                                        >
                                                            {processing ? 'Deleting...' : 'Confirm'}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
