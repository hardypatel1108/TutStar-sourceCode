import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Head, Link } from '@inertiajs/react';

type Meeting = {
    id: number;
    topic: string;
    start_time: string;
    duration: number;
    status: 'scheduled' | 'started' | 'ended' | 'cancelled';
    recording_status: string;
    recording_url?: string;
};

export default function Index({ meetings }: { meetings: { data: Meeting[] } })
{
    const rows = meetings?.data ?? []; // fallback to []
    return (
        <>
            <Head title="Meetings" />
            <div className="flex flex-col items-center bg-[#FDFDFC] p-8 text-[#1b1b18] lg:justify-center dark:bg-[#0a0a0a]">
                <header className="w-full text-sm not-has-[nav]:hidden lg:max-w-7xl">
                    <Navbar />
                </header>
            </div>
            <div className="min-h-screen bg-white text-gray-500">
                <div className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">Meetings</h1>
                        <Link href={'/meetings/create'}>
                            <Button>Create Meeting</Button>
                        </Link>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Topic</TableHead>
                                <TableHead>Start Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Recording</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                                        No meetings found yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((meeting) => (
                                    <TableRow key={meeting.id}>
                                        <TableCell>{meeting.topic}</TableCell>
                                        <TableCell>{meeting.start_time}</TableCell>
                                        <TableCell className="capitalize">{meeting.status}</TableCell>
                                        <TableCell>
                                            {meeting.recording_status === 'available' && meeting.recording_url ? (
                                                <a href={meeting.recording_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                                    View Recording
                                                </a>
                                            ) : (
                                                meeting.recording_status
                                            )}
                                        </TableCell>
                                        <TableCell className="space-x-2 text-right">
                                            <Link >
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Link >
                                                <Button variant="secondary" size="sm">
                                                    Join
                                                </Button>
                                            </Link>
                                          
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <Footer />
        </>
    );
}
