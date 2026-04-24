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
import { dashboard as dashboardindex } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/classes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface Clazz {
    id: number;
    name: string;
    description: string;
    ordinal: number;
    status: string;
    slug: string;
    board?: { id: number; name: string; slug: string; status: string };
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboardindex().url },
    { title: 'Classes', href: index().url },
];

export default function Index() {
    const { classes, filters, boards } = usePage().props as {
        classes: any;
        filters: { status?: string; board?: string; search?: string };
        boards: { id: number; name: string }[];
    };

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [boardId, setBoardId] = useState(filters.board || '');
    const { delete: deleteClazz, processing } = useForm();

    const handleFilterChange = (type: string, value: string) => {
        const params = { search, status, board: boardId };
        params[type] = value;
        router.get(index().url, params, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        deleteClazz(destroy({ class: id }).url, { preserveScroll: true });
     
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Classes" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Classes</h1>
                    <Link href={create().url}>
                        <Button>Add Class</Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine classes list</p>

                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                    <div className="flex flex-col gap-1">

                        <Input
                            title="Search by name or description..." placeholder="Search by name or description..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                handleFilterChange('search', e.target.value);
                            }}
                            className="w-64"
                        />
                    </div>

                    <div className="flex flex-col gap-1">

                        <select title="Select"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                handleFilterChange('status', e.target.value);
                            }}
                            className="rounded-md border border-input bg-background p-2 text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">

                        <select title="Select"
                            value={boardId}
                            onChange={(e) => {
                                setBoardId(e.target.value);
                                handleFilterChange('board', e.target.value);
                            }}
                            className="rounded-md border border-input bg-background p-2 text-sm"
                        >
                            <option value="">All Boards</option>
                            {boards.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
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
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Board</TableHead>
                                <TableHead>Ordinal</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {classes.data.length > 0 ? (
                                classes.data.map((clazz: Clazz, index: number) => (
                                    <TableRow key={clazz.id}>
                                        <TableCell>{(classes.current_page - 1) * classes.per_page + (index + 1)}</TableCell>
                                        <TableCell className="font-medium">{clazz.name}</TableCell>
                                        <TableCell>{clazz.description || '—'}</TableCell>
                                        <TableCell>{clazz.board?.name || '—'}</TableCell>
                                        <TableCell>{clazz.ordinal}</TableCell>
                                        <TableCell>
                                            <Badge variant={clazz.status === 'active' ? 'success' : 'destructive'}>
                                                {clazz.status === 'active' ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{clazz.created_at}</TableCell>
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
                                                        <Link href={edit({ class: clazz.id }).url}>Edit</Link>
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
                                                                <AlertDialogTitle>Delete Class</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this class? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(clazz.id)}
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
                                    <TableCell colSpan={8} className="py-4 text-center text-muted-foreground">
                                        No classes found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {classes.total > classes.per_page && (
                        <div className="flex justify-end space-x-2 p-4">
                            {classes.links.map((link: any, idx: number) =>
                                link.url ? (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
                                        onClick={() => router.visit(link.url, { preserveScroll: true })}
                                        size="sm"
                                    >
                                        {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                    </Button>
                                ) : null,
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}



