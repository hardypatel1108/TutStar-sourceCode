import SubjectOverviewController from '@/actions/App/Http/Controllers/Admin/SubjectOverviewController';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { Form, Head } from '@inertiajs/react';
import { Plus, Trash } from 'lucide-react';
import { useState } from 'react';

export default function Create({ subject, existingOverviews = [], pointerTypes }) {
    const [overviews, setOverviews] = useState(() => {
        if (existingOverviews.length > 0) {
            return existingOverviews.map((o) => ({
                id: o.id,
                title: o.title ?? '',
                pointer_type: o.pointer_type ?? 'bullet',
                points:
                    o.points?.length > 0
                        ? o.points.map((p) => ({
                              id: p.id,
                              content: p.content ?? '',
                          }))
                        : [{ content: '' }],
            }));
        }

        return [
            {
                title: '',
                pointer_type: 'bullet',
                points: [{ content: '' }],
            },
        ];
    });

    const addOverview = () => {
        if (overviews.length >= 3) return;
        setOverviews([...overviews, { title: '', pointer_type: 'bullet', points: [{ content: '' }] }]);
    };

    const removeOverview = (index: number) => {
        if (overviews.length === 1) return;
        setOverviews(overviews.filter((_, i) => i !== index));
    };

    const addPoint = (oIndex: number) => {
        setOverviews((prev) => prev.map((o, i) => (i === oIndex ? { ...o, points: [...o.points, { content: '' }] } : o)));
    };

    const removePoint = (oIndex: number, pIndex: number) => {
        setOverviews((prev) =>
            prev.map((o, i) =>
                i === oIndex
                    ? {
                          ...o,
                          points: o.points.filter((_, pi) => pi !== pIndex),
                      }
                    : o,
            ),
        );
    };

    return (
        <AdminLayout>
            <Head title={`Manage Overviews – ${subject.name}`} />

            <Card className="mx-auto max-w-3xl space-y-6 p-6">
                <Form {...SubjectOverviewController.store.form({ subject: subject.id })}>
                    <div className="space-y-4">
                        {overviews.map((o, oi) => (
                            <Card key={oi} className="space-y-4 border p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Overview {oi + 1}</h3>
                                    <Button type="button" variant="ghost" onClick={() => removeOverview(oi)} disabled={overviews.length === 1}>
                                        <Trash className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>

                                <input type="hidden" name={`overviews[${oi}][id]`} value={o.id || ''} />

                                <Input
                                    value={o.title}
                                    onChange={(e) => {
                                        const copy = [...overviews];
                                        copy[oi].title = e.target.value;
                                        setOverviews(copy);
                                    }}
                                    placeholder="Overview title"
                                />

                                <input type="hidden" name={`overviews[${oi}][title]`} value={o.title} />

                                <Select
                                    value={o.pointer_type}
                                    onValueChange={(val) => {
                                        const copy = [...overviews];
                                        copy[oi].pointer_type = val;
                                        setOverviews(copy);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pointerTypes.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <input type="hidden" name={`overviews[${oi}][pointer_type]`} value={o.pointer_type} />

                                {o.points.map((p, pi) => (
                                    <div key={pi} className="flex gap-2">
                                        <Input
                                            value={p.content}
                                            onChange={(e) => {
                                                const copy = [...overviews];
                                                copy[oi].points[pi].content = e.target.value;
                                                setOverviews(copy);
                                            }}
                                        />

                                        <input type="hidden" name={`overviews[${oi}][points][${pi}][id]`} value={p.id || ''} />

                                        <input type="hidden" name={`overviews[${oi}][points][${pi}][content]`} value={p.content} />

                                        <Button type="button" variant="ghost" disabled={o.points.length === 1} onClick={() => removePoint(oi, pi)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                <Button type="button" variant="outline" onClick={() => addPoint(oi)}>
                                    <Plus className="mr-1 h-4 w-4" /> Add Point
                                </Button>
                            </Card>
                        ))}
                    </div>
                    <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={addOverview} disabled={overviews.length >= 3}>
                            + Add Overview
                        </Button>
                        <Button type="submit">Save & Sync</Button>
                    </div>
                </Form>
            </Card>
        </AdminLayout>
    );
}
