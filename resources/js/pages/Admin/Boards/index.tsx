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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { create, destroy, edit, index } from '@/routes/admin/boards';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface Board {
    id: number;
    name: string;
    description: string | null;
    status: boolean;
    logo?: string | null;
    slug: string;
    classes_count?: number;
    plans_count?: number;
    current_page: number;
    last_page: number;
    per_page: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: index().url,
    },
    {
        title: 'Boards',
        href: index().url,
    },
];

export default function Index() {
    const { boards, filters } = usePage().props as {
        boards: any;
        filters: any;
    };

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

    const { delete: deleteBoard, processing } = useForm();

    const handleDelete = (id: number) => {
        deleteBoard(destroy({ board: id }).url, {
            preserveScroll: true,
        });
    };

    const handleFilterChange = (type: string, value: string) => {
        const params = {
            search: type === 'search' ? value : search,
            status: type === 'status' ? value : status,
        };
        router.get(index().url, params, { preserveState: true, preserveScroll: true });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Boards" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Boards</h1>
                    <Link href={create().url}>
                        <Button>Add Board</Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card p-3">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Filters</h2>
                        <p className="text-sm text-muted-foreground">Refine boards list</p>

                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                    <div className="flex flex-col gap-1">

                        <Input
                            title="Search boards..." placeholder="Search boards..."
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
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="mt-3">
                        <Button type="button" variant="outline" onClick={() => router.get(index().url)}>
                            Clear Filters
                        </Button>
                    </div>
                    </div>
                </div>

                {/* Boards Table */}
                <Card className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Logo</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Classes</TableHead>
                                <TableHead>Plans</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {boards.data.length > 0 ? (
                                boards.data.map((board: Board, index: number) => (
                                    <TableRow key={board.id}>
                                        <TableCell> {(boards.current_page - 1) * boards.per_page + (index + 1)} </TableCell>
                                        <TableCell>
                                            {board.logo ? (
                                                <img src={`/storage/${board.logo}`} alt={board.name} className="h-8 w-8 rounded-full object-cover" />
                                            ) : (
                                                <span className="text-gray-400">No Logo</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{board.name}</TableCell>
                                        <TableCell>{board.classes_count}</TableCell>
                                        <TableCell>{board.plans_count}</TableCell>
                                        <TableCell>
                                            <Badge variant={board.status === 'active' ? 'success' : 'destructive'}>
                                                {board.status === 'active' ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>

                                        {/* Actions Menu */}
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
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault();
                                                                    setSelectedBoard(board);
                                                                }}
                                                            >
                                                                View Details
                                                            </DropdownMenuItem>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>{selectedBoard?.name}</DialogTitle>
                                                            </DialogHeader>
                                                            <p className="mt-2 text-sm text-muted-foreground">
                                                                {selectedBoard?.description || 'No description available.'}
                                                            </p>
                                                        </DialogContent>
                                                    </Dialog>

                                                    <DropdownMenuItem asChild>
                                                        <Link href={edit({ board: board.id }).url}>Edit</Link>
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
                                                                <AlertDialogTitle>Delete Board</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this board? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(board.id)}
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
                                    <TableCell colSpan={7} className="py-4 text-center">
                                        No boards found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {boards.total > boards.per_page && (
                        <div className="flex justify-end space-x-2 p-4">
                            {boards.links.map((link: any, idx: number) =>
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



