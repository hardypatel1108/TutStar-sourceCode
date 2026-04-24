import english from '@/assets/svgs/subjects/english-icon.svg';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudentLayout from '@/layouts/studentLayout';
import { Head } from '@inertiajs/react';
import { ArrowDownFromLine, ChevronDown, Download, HardDriveDownload } from 'lucide-react';
import { useState } from 'react';

interface AssignmentItem {
    id: number;
    date: string;
    chapter: string;
    topic: string;
    file_url?: string | null;
    due_date?: string | null;
}

interface SubjectGroup {
    id: number;
    subject_name: string;
    teacher_name: string;
    color?: string | null;
    icon?: string | null;
    assignments: AssignmentItem[];
}

interface Props {
    groups: SubjectGroup[];
}

export default function PracticeTest({ groups }: Props) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <StudentLayout>
            <Head title="Practice Test" />

            <div className="flex flex-col gap-6 sm:p-4">
                <div className="rounded-2xl sm:bg-white/80 sm:p-4 sm:shadow md:p-6">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold max-sm:hidden">Practice Test</h2>
                    </div>

                    {/* Empty state */}
                    {groups.length === 0 && <p className="py-6 text-center text-gray-500">No practice tests available</p>}

                    {/* Groups */}
                    {groups.map((group, index) => {
                        const isOpen = openIndex === index;
                        const bgColor = group.color ? `#${group.color}` : '#95CBFF';

                        return (
                            <div key={group.id} className="mb-4">
                                <Card
                                    className="mt-5 cursor-pointer rounded-2xl border-none py-0 max-sm:pt-2 shadow transition"
                                    style={{ backgroundColor: bgColor }}
                                >
                                    <CardHeader className="p-3 sm:p-4" onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}>
                                        <CardTitle className="flex items-center justify-between text-base font-bold text-black sm:text-lg">
                                            <div className="flex items-center gap-3 max-sm:text-sm">
                                                <img
                                                    src={group.icon ? `/storage/${group.icon}` : english}
                                                    alt={group.subject_name}
                                                    className="h-20 w-20 rounded-full object-contain"
                                                />
                                                <div>
                                                    <p>{group.subject_name}</p>
                                                    <p className="text-sm font-normal text-gray-700">{group.teacher_name}</p>
                                                </div>
                                            </div>

                                            <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        </CardTitle>
                                    </CardHeader>

                                    {isOpen && (
                                        <>
                                            {/* ================= MOBILE ================= */}
                                            <CardContent className="rounded-b-2xl p-4 hidden max-md:block">
                                                <div className="grid grid-cols-[1fr_1.5fr_2fr_0.5fr] gap-2 border-b pb-2 text-xs font-semibold text-orange-600">
                                                    <span>Date</span>
                                                    <span>Chapter</span>
                                                    <span>Topic</span>
                                                    <span className="flex justify-center">
                                                        <HardDriveDownload className="h-4 w-4" />
                                                    </span>
                                                </div>

                                                {group.assignments.length === 0 ? (
                                                    <p className="py-4 text-center text-gray-500">No practice tests</p>
                                                ) : (
                                                    group.assignments.map((a) => (
                                                        <div
                                                            key={a.id}
                                                            className="grid grid-cols-[1fr_1.5fr_2fr_0.5fr] items-center gap-2 border-b py-3 text-xs last:border-0"
                                                        >
                                                            <span className="text-gray-600">{new Date(a.date).toLocaleDateString('en-IN')}</span>

                                                            <span className="font-medium">{a.chapter || '—'}</span>

                                                            <span className="truncate text-gray-600">{a.topic || '—'}</span>

                                                            <span className="flex justify-center">
                                                                {a.file_url ? (
                                                                    <a href={a.file_url} target="_blank" className="rounded-lg p-1 hover:bg-black/5">
                                                                        <ArrowDownFromLine className="h-4 w-4 text-[#673DE6]" />
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-gray-400">—</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </CardContent>

                                            {/* ================= DESKTOP ================= */}
                                            <CardContent className="rounded-b-2xl  p-4 py-0 max-md:hidden"
                                             style={{ backgroundColor: bgColor }}>
                                                <div className="grid grid-cols-4 border-b pb-2 text-sm font-medium text-gray-500">
                                                    <span>Date</span>
                                                    <span>Chapter</span>
                                                    <span>Topic</span>
                                                    <span className="text-right">Download</span>
                                                </div>

                                                {group.assignments.length === 0 ? (
                                                    <p className="py-4 text-center text-gray-500">No practice tests</p>
                                                ) : (
                                                    group.assignments.map((a) => (
                                                        <div key={a.id} className="grid grid-cols-4 items-center border-b py-3 last:border-0">
                                                            <p className="text-sm text-gray-500">{new Date(a.date).toLocaleDateString('en-IN')}</p>

                                                            <p className="font-semibold">{a.chapter || '—'}</p>

                                                            <p className="text-sm text-gray-600">{a.topic || '—'}</p>

                                                            <div className="flex justify-end">
                                                                {a.file_url ? (
                                                                    <a
                                                                        href={a.file_url}
                                                                        target="_blank"
                                                                        className="rounded-xl bg-[#673DE6]/10 p-2 hover:bg-[#673DE6]/20"
                                                                    >
                                                                        <Download className="h-5 w-5 text-[#673DE6]" />
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400">—</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </CardContent>
                                        </>
                                    )}
                                </Card>
                            </div>
                        );
                    })}

                    <p className="mt-4 text-sm font-medium text-red-500">Note: Practice tests are accessible for 10 days only.</p>
                </div>
            </div>
        </StudentLayout>
    );
}
