import SubjectFeatureController from '@/actions/App/Http/Controllers/Admin/SubjectFeatureController';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Form, Head } from '@inertiajs/react';
import { Plus, Trash } from 'lucide-react';
import { useState } from 'react';

type Feature = {
    id?: number;
    title: string;
    description: string;
};

export default function Create({ subject, existingFeatures = [] }) {
    const [features, setFeatures] = useState<Feature[]>(existingFeatures.length ? existingFeatures : [{ title: '', description: '' }]);

    const addFeature = () => {
        setFeatures((prev) => [...prev, { title: '', description: '' }]);
    };

    const removeFeature = (index: number) => {
        if (features.length === 1) return;
        setFeatures((prev) => prev.filter((_, i) => i !== index));
    };

    const updateField = (index: number, field: keyof Feature, value: string) => {
        setFeatures((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
    };

    return (
        <AdminLayout>
            <Head title="Subject Features" />

            <Card className="mx-auto max-w-3xl space-y-6 p-6">
                <h2 className="text-xl font-semibold">Features – {subject.name}</h2>

                <Form {...SubjectFeatureController.store.form({ subject: subject.id })}>
                    <div className="space-y-4">
                        {features.map((feature, index) => (
                            <Card key={index} className="space-y-4 border p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Feature {index + 1}</h3>

                                    <Button type="button" variant="ghost" onClick={() => removeFeature(index)} disabled={features.length === 1}>
                                        <Trash className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>

                                {/* hidden id */}
                                <input type="hidden" name={`features[${index}][id]`} value={feature.id ?? ''} />

                                <Input
                                    title="Feature title" placeholder="Feature title"
                                    value={feature.title}
                                    onChange={(e) => updateField(index, 'title', e.target.value)}
                                />

                                <Textarea
                                    placeholder="Feature description"
                                    rows={3}
                                    value={feature.description}
                                    onChange={(e) => updateField(index, 'description', e.target.value)}
                                />

                                {/* Hidden inputs for submit */}
                                <input type="hidden" name={`features[${index}][title]`} value={feature.title} />
                                <input type="hidden" name={`features[${index}][description]`} value={feature.description} />
                            </Card>
                        ))}
                    </div>
                    <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={addFeature}>
                            <Plus className="mr-1 h-4 w-4" />
                            Add Feature
                        </Button>

                        <Button type="submit">Save Features</Button>
                    </div>
                </Form>
            </Card>
        </AdminLayout>
    );
}

