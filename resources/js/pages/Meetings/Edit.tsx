import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Head, Link, useForm } from '@inertiajs/react';

type User = { id: number; name: string; email: string };

type Meeting = {
    id: number;
    topic: string;
    description?: string;
    start_time: string;
    duration: number;
    host_id?: number;
    participant_ids?: number[];
     co_host_ids?: number[];
};

export default function Index({ meeting, users }: { meeting: Meeting | null; users: User[] }) {
    const isEdit = Boolean(meeting);

    const { data, setData, post, put, processing, errors } = useForm({
        topic: meeting?.topic ?? 'test',
        description: meeting?.description ?? 'test',
        start_time: meeting?.start_time ?? '',
        duration: meeting?.duration ?? 20,
        host_id: meeting?.host_id ?? '',
        participant_ids: meeting?.participant_ids ?? [],
       co_host_ids: meeting?.co_host_ids ?? [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/meetings/${meeting!.id}`);
        } else {
            post(`/meetings`);
        }
    };
    return (
        <>
            <Head title="Meetings" />
            <div className="flex flex-col items-center bg-[#FDFDFC] p-8 text-[#1b1b18] lg:justify-center dark:bg-[#0a0a0a]">
                <header className="w-full text-sm not-has-[nav]:hidden lg:max-w-7xl">
                    <Navbar />
                </header>
            </div>
            <div className="min-h-screen bg-white text-gray-500">
                <div className="space-y-6 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Meeting' : 'Create Meeting'}</h1>

                        <Link href={'/meetings'}>
                            <Button variant="outline">Back</Button>
                        </Link>
                    </div>

                    <div className="max-w-2xl rounded-md border bg-card p-6 shadow">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* topic */}
                            <div className="space-y-1.5">
                                <Label>Topic</Label>
                                <Input value={data.topic} onChange={(e) => setData('topic', e.target.value)} />
                                {errors.topic && <p className="text-sm text-destructive">{errors.topic}</p>}
                            </div>
                            {/* description */}
                            <div className="space-y-1.5">
                                <Label>Description</Label>
                                <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} />
                            </div>
                            {/* start time */}
                            <div className="space-y-1.5">
                                <Label>Start Time</Label>
                                <Input type="datetime-local" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} />
                                {errors.start_time && <p className="text-sm text-destructive">{errors.start_time}</p>}
                            </div>
                            {/* duration */}
                            <div className="space-y-1.5">
                                <Label>Duration (minutes)</Label>
                                <Input type="number" min={1} value={data.duration} onChange={(e) => setData('duration', e.target.value)} />
                                {errors.duration && <p className="text-sm text-destructive">{errors.duration}</p>}
                            </div>
                            {/* host select */}
                            <div className="space-y-1.5">
                                <Label>Host</Label>
                                <Select value={String(data.host_id)} onValueChange={(val) => setData('host_id', Number(val))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select host" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.name} ({u.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.host_id && <p className="text-sm text-destructive">{errors.host_id}</p>}
                            </div>
                            {/* participant multi-select */}
                            <div className="space-y-1.5">
                                <Label>Participants</Label>
                                <MultiSelect
                                    options={users.map((u) => ({
                                        value: u.id,
                                        label: `${u.name} (${u.email})`,
                                    }))}
                                    value={data.participant_ids}
                                    onChange={(values) => setData('participant_ids', values)}
                                    placeholder="Select participants"
                                />
                            </div>
                            /* co-host multi-select */
                            <div className="space-y-1.5">
                                <Label>Co-Hosts (optional)</Label>
                                <MultiSelect
                                    options={users.map((u) => ({
                                        value: u.id,
                                        label: `${u.name} (${u.email})`,
                                    }))}
                                    value={data.co_host_ids ?? []}
                                    onChange={(values) => setData('co_host_ids', values)}
                                    placeholder="Select co-hosts"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Link href={'/meetings'}>
                                    <Button variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (isEdit ? 'Updating...' : 'Creating...') : isEdit ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
