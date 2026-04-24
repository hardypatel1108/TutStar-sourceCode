import TeacherController from '@/actions/App/Http/Controllers/Admin/TeacherController';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { index as teachersIndex } from '@/routes/admin/teachers';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Teachers', href: '/admin/teachers' },
    { title: 'Create Teacher', href: '/admin/teachers/create' },
];

type ClassItem = {
    id: number;
    name: string;
    subjects: { id: number; name: string }[];
};

export default function Create() {
    const [preview, setPreview] = useState<string | null>(null);
    const { classes } = usePage().props as { classes: ClassItem[] };

    const [languages, setLanguages] = useState<string[]>(['']);
    const [timings, setTimings] = useState<Array<{ day: string; from: string; to: string }>>([]);
    const [experiences, setExperiences] = useState([{ class_id: '', subject_id: '', experience_years: '', description: '' }]);
    const [subjectsByRow, setSubjectsByRow] = useState<Record<number, Array<{ id: number; name: string }>>>({});

    const addLanguage = () => setLanguages([...languages, '']);
    const updateLanguage = (index: number, value: string) => {
        const copy = [...languages];
        copy[index] = value;
        setLanguages(copy);
    };
    const removeLanguage = (index: number) => setLanguages(languages.filter((_, i) => i !== index));

    const addTiming = () => setTimings([...timings, { day: 'monday', from: '', to: '' }]);
    const updateTiming = (index: number, key: string, value: string) => {
        const copy = [...timings];
        copy[index] = { ...copy[index], [key]: value };
        setTimings(copy);
    };
    const removeTiming = (index: number) => setTimings(timings.filter((_, i) => i !== index));

    const addExperience = () => setExperiences([...experiences, { class_id: '', subject_id: '', experience_years: '', description: '' }]);

    const fetchSubjectsForExperienceRow = async (rowIndex: number, classId: string) => {
        if (!classId) {
            setSubjectsByRow((prev) => ({ ...prev, [rowIndex]: [] }));
            return;
        }

        const res = await fetch(`/admin/subjects-by-class/${classId}`);
        const data = await res.json();
        setSubjectsByRow((prev) => ({ ...prev, [rowIndex]: data }));
    };

    const updateExperience = (index: number, key: string, value: string) => {
        const copy = [...experiences];
        copy[index] = { ...copy[index], [key]: value };
        if (key === 'class_id') {
            copy[index].subject_id = '';
            fetchSubjectsForExperienceRow(index, value);
        }
        setExperiences(copy);
    };
    const removeExperience = (index: number) => setExperiences(experiences.filter((_, i) => i !== index));

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Teacher" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Add Teacher</h1>
                    <Link href={teachersIndex().url}>
                        <Button variant="outline">Back</Button>
                    </Link>
                </div>

                <Card className="p-6">
                    <Form {...TeacherController.store.form()} resetOnSuccess disableWhileProcessing className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                        {({ processing, errors }) => (
                            <>
                                <p className="text-sm text-muted-foreground">Fields marked with * are required.</p>

                                <div className="grid gap-6 lg:grid-cols-2">
                                    <section className="space-y-4 rounded-lg border bg-muted/20 p-4">
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Basic Information</h3>

                                        <div className="flex flex-col items-center gap-3 pb-2">
                                            <label className="group cursor-pointer">
                                                <input
                                                    type="file"
                                                    name="profile_image"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) setPreview(URL.createObjectURL(file));
                                                    }}
                                                />

                                                {preview ? (
                                                    <img
                                                        src={preview}
                                                        alt="Profile"
                                                        className="h-28 w-28 rounded-full border object-cover transition group-hover:ring-2 group-hover:ring-primary"
                                                    />
                                                ) : (
                                                    <Avatar className="h-28 w-28 overflow-hidden rounded-full border">
                                                        <AvatarFallback className="text-lg font-semibold">TE</AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </label>
                                            <p className="text-xs text-muted-foreground">Click to upload profile image</p>
                                            <InputError message={errors.profile_image} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Teacher Name *</Label>
                                            <Input id="name" name="name" required aria-invalid={!!errors.name} className={errors.name ? 'border-destructive' : ''} />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input id="email" name="email" type="email" required aria-invalid={!!errors.email} className={errors.email ? 'border-destructive' : ''} />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <textarea
                                                id="bio"
                                                name="bio"
                                                aria-invalid={!!errors.bio}
                                                className={`min-h-24 w-full rounded-md border p-2 ${errors.bio ? 'border-destructive' : ''}`}
                                                placeholder="Short introduction"
                                            />
                                            <InputError message={errors.bio} />
                                        </div>
                                    </section>

                                    <section className="space-y-4 rounded-lg border bg-muted/20 p-4">
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Contact And Professional</h3>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>City</Label>
                                                <Input name="city" aria-invalid={!!errors.city} className={errors.city ? 'border-destructive' : ''} />
                                                <InputError message={errors.city} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>State</Label>
                                                <Input name="state" aria-invalid={!!errors.state} className={errors.state ? 'border-destructive' : ''} />
                                                <InputError message={errors.state} />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="contact_email">Contact Email</Label>
                                            <Input id="contact_email" name="contact_email" type="email" aria-invalid={!!errors.contact_email} className={errors.contact_email ? 'border-destructive' : ''} />
                                            <InputError message={errors.contact_email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="contact_mobile">Contact Mobile</Label>
                                            <Input id="contact_mobile" name="contact_mobile" aria-invalid={!!errors.contact_mobile} className={errors.contact_mobile ? 'border-destructive' : ''} />
                                            <InputError message={errors.contact_mobile} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Salary (Monthly)</Label>
                                                <Input name="salary" type="number" min={0} step="0.01" aria-invalid={!!errors.salary} className={errors.salary ? 'border-destructive' : ''} />
                                                <InputError message={errors.salary} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Total Experience (Years)</Label>
                                                <Input name="experience_years" type="number" min={0} aria-invalid={!!errors.experience_years} className={errors.experience_years ? 'border-destructive' : ''} />
                                                <InputError message={errors.experience_years} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Languages</Label>
                                            {languages.map((lang, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <Input
                                                        name={`languages[${index}]`}
                                                        value={lang}
                                                        title="e.g. English" placeholder="e.g. English"
                                                        onChange={(e) => updateLanguage(index, e.target.value)}
                                                    />
                                                    {languages.length > 1 && (
                                                        <Button type="button" variant="destructive" onClick={() => removeLanguage(index)}>
                                                            X
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button type="button" variant="outline" onClick={addLanguage}>
                                                + Add Language
                                            </Button>
                                            <InputError message={errors.languages} />
                                        </div>
                                    </section>
                                </div>

                                <section className="space-y-4 rounded-lg border bg-muted/20 p-4">
                                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">Comfortable Timings</h3>
                                    {timings.length === 0 && <p className="text-sm text-muted-foreground">No timings added yet.</p>}
                                    {timings.map((t, index) => (
                                        <div key={index} className="grid grid-cols-1 items-end gap-2 md:grid-cols-4">
                                            <select
                                                title="Select"
                                                name={`comfortable_timings[${index}][day]`}
                                                className={`rounded-md border p-2 ${errors[`comfortable_timings.${index}.day` as keyof typeof errors] ? 'border-destructive' : ''}`}
                                                value={t.day}
                                                onChange={(e) => updateTiming(index, 'day', e.target.value)}
                                                aria-invalid={!!errors[`comfortable_timings.${index}.day` as keyof typeof errors]}
                                            >
                                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((d) => (
                                                    <option key={d} value={d}>
                                                        {d}
                                                    </option>
                                                ))}
                                            </select>

                                            <Input
                                                type="time"
                                                name={`comfortable_timings[${index}][from]`}
                                                value={t.from}
                                                onChange={(e) => updateTiming(index, 'from', e.target.value)}
                                                aria-invalid={!!errors[`comfortable_timings.${index}.from` as keyof typeof errors]}
                                                className={errors[`comfortable_timings.${index}.from` as keyof typeof errors] ? 'border-destructive' : ''}
                                            />

                                            <Input
                                                type="time"
                                                name={`comfortable_timings[${index}][to]`}
                                                value={t.to}
                                                onChange={(e) => updateTiming(index, 'to', e.target.value)}
                                                aria-invalid={!!errors[`comfortable_timings.${index}.to` as keyof typeof errors]}
                                                className={errors[`comfortable_timings.${index}.to` as keyof typeof errors] ? 'border-destructive' : ''}
                                            />

                                            <Button type="button" variant="destructive" onClick={() => removeTiming(index)}>
                                                Remove
                                            </Button>

                                            <div className="md:col-span-4 grid gap-1">
                                                <InputError message={errors[`comfortable_timings.${index}.day` as keyof typeof errors] as string | undefined} />
                                                <InputError message={errors[`comfortable_timings.${index}.from` as keyof typeof errors] as string | undefined} />
                                                <InputError message={errors[`comfortable_timings.${index}.to` as keyof typeof errors] as string | undefined} />
                                            </div>
                                        </div>
                                    ))}

                                    <Button type="button" variant="outline" onClick={addTiming}>
                                        + Add Timing
                                    </Button>
                                    <InputError message={errors.comfortable_timings} />
                                </section>

                                <section className="space-y-4 rounded-lg border bg-muted/20 p-4">
                                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">Teaching Experiences</h3>
                                    {experiences.map((exp, index) => {
                                        const selectedClass = classes.find((c) => String(c.id) === exp.class_id);
                                        const subjectOptions = subjectsByRow[index] ?? selectedClass?.subjects ?? [];
                                        return (
                                            <div key={index} className="space-y-2 rounded-md border bg-white p-3">
                                                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                                    <select
                                                        title="Select"
                                                        name={`teaching_experiences[${index}][class_id]`}
                                                        defaultValue={exp.class_id}
                                                        onChange={(e) => updateExperience(index, 'class_id', e.target.value)}
                                                        className={`rounded-md border p-2 ${errors[`teaching_experiences.${index}.class_id` as keyof typeof errors] ? 'border-destructive' : ''}`}
                                                        aria-invalid={!!errors[`teaching_experiences.${index}.class_id` as keyof typeof errors]}
                                                    >
                                                        <option value="">Class *</option>
                                                        {classes.map((c) => (
                                                            <option key={c.id} value={String(c.id)}>
                                                                {c.name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <select
                                                        title="Select"
                                                        key={`subject-${index}-${exp.class_id}`}
                                                        name={`teaching_experiences[${index}][subject_id]`}
                                                        defaultValue={exp.subject_id}
                                                        disabled={!exp.class_id}
                                                        onChange={(e) => updateExperience(index, 'subject_id', e.target.value)}
                                                        className={`rounded-md border p-2 ${errors[`teaching_experiences.${index}.subject_id` as keyof typeof errors] ? 'border-destructive' : ''}`}
                                                        aria-invalid={!!errors[`teaching_experiences.${index}.subject_id` as keyof typeof errors]}
                                                    >
                                                        <option value="">Subject *</option>
                                                        {subjectOptions.map((s) => (
                                                            <option key={s.id} value={String(s.id)}>
                                                                {s.name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        name={`teaching_experiences[${index}][experience_years]`}
                                                        value={exp.experience_years}
                                                        onChange={(e) => updateExperience(index, 'experience_years', e.target.value)}
                                                        placeholder="Years"
                                                        aria-invalid={!!errors[`teaching_experiences.${index}.experience_years` as keyof typeof errors]}
                                                        className={errors[`teaching_experiences.${index}.experience_years` as keyof typeof errors] ? 'border-destructive' : ''}
                                                    />
                                                </div>

                                                <textarea
                                                    name={`teaching_experiences[${index}][description]`}
                                                    value={exp.description}
                                                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                                    placeholder="Experience notes"
                                                    className={`min-h-20 w-full rounded-md border p-2 ${errors[`teaching_experiences.${index}.description` as keyof typeof errors] ? 'border-destructive' : ''}`}
                                                    aria-invalid={!!errors[`teaching_experiences.${index}.description` as keyof typeof errors]}
                                                />

                                                <div className="grid gap-1">
                                                    <InputError message={errors[`teaching_experiences.${index}.class_id` as keyof typeof errors] as string | undefined} />
                                                    <InputError message={errors[`teaching_experiences.${index}.subject_id` as keyof typeof errors] as string | undefined} />
                                                    <InputError message={errors[`teaching_experiences.${index}.experience_years` as keyof typeof errors] as string | undefined} />
                                                    <InputError message={errors[`teaching_experiences.${index}.description` as keyof typeof errors] as string | undefined} />
                                                </div>

                                                {experiences.length > 1 && (
                                                    <Button type="button" variant="destructive" onClick={() => removeExperience(index)}>
                                                        Remove Experience
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}

                                    <Button type="button" variant="outline" onClick={addExperience}>
                                        + Add Teaching Experience
                                    </Button>
                                    <InputError message={errors.teaching_experiences} />
                                </section>

                                <div className="text-center">
                                    <Button type="submit" className="mt-2 min-w-44">
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Create Teacher
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </Card>
            </div>
        </AdminLayout>
    );
}


