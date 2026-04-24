import SubjectSyllabusController from '@/actions/App/Http/Controllers/Admin/SubjectSyllabusController';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { Form, Head } from '@inertiajs/react';
import { Plus, Trash } from 'lucide-react';
import { useState } from 'react';

type Topic = { id?: number; title: string };
type Chapter = { id?: number; name: string; topics: Topic[] };

export default function Create({ subject, chapters = [] }) {
    const [items, setItems] = useState<Chapter[]>(chapters.length ? chapters : [{ name: '', topics: [{ title: '' }] }]);

    const addChapter = () => setItems([...items, { name: '', topics: [{ title: '' }] }]);

    const removeChapter = (i: number) => items.length > 1 && setItems(items.filter((_, index) => index !== i));

    const addTopic = (c: number) => setItems(items.map((ch, i) => (i === c ? { ...ch, topics: [...ch.topics, { title: '' }] } : ch)));

    const removeTopic = (c: number, t: number) =>
        setItems(items.map((ch, i) => (i === c ? { ...ch, topics: ch.topics.filter((_, ti) => ti !== t) } : ch)));

    return (
        <AdminLayout>
            <Head title="Subject Syllabus" />

            <Card className="mx-auto max-w-4xl space-y-6 p-6">
                <h2 className="text-xl font-semibold">Syllabus – {subject.name}</h2>

                <Form {...SubjectSyllabusController.store.form({ subject: subject.id })}>
                    <div className="space-y-4">
                        {items.map((ch, cIndex) => (
                            <Card key={cIndex} className="space-y-4 border p-4">
                                <div className="flex justify-between">
                                    <Input
                                        title="Chapter name" placeholder="Chapter name"
                                        value={ch.name}
                                        onChange={(e) => {
                                            const copy = [...items];
                                            copy[cIndex].name = e.target.value;
                                            setItems(copy);
                                        }}
                                    />

                                    <Button type="button" variant="ghost" onClick={() => removeChapter(cIndex)}>
                                        <Trash className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>

                                <input type="hidden" name={`chapters[${cIndex}][id]`} value={ch.id ?? ''} />
                                <input type="hidden" name={`chapters[${cIndex}][name]`} value={ch.name} />

                                {ch.topics.map((t, tIndex) => (
                                    <div key={tIndex} className="flex gap-2">
                                        <Input
                                            placeholder={`Topic ${tIndex + 1}`}
                                            value={t.title}
                                            onChange={(e) => {
                                                const copy = [...items];
                                                copy[cIndex].topics[tIndex].title = e.target.value;
                                                setItems(copy);
                                            }}
                                        />

                                        <input type="hidden" name={`chapters[${cIndex}][topics][${tIndex}][id]`} value={t.id ?? ''} />
                                        <input type="hidden" name={`chapters[${cIndex}][topics][${tIndex}][title]`} value={t.title} />

                                        <Button type="button" variant="ghost" onClick={() => removeTopic(cIndex, tIndex)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                <Button type="button" variant="outline" onClick={() => addTopic(cIndex)}>
                                    <Plus className="mr-1 h-4 w-4" /> Add Topic
                                </Button>
                            </Card>
                        ))}
                    </div>
                    <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={addChapter}>
                            + Add Chapter
                        </Button>

                        <Button type="submit">Save Syllabus</Button>
                    </div>
                </Form>
            </Card>
        </AdminLayout>
    );
}

