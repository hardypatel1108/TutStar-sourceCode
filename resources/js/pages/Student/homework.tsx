import chevronCircle from '@/assets/svgs/chevrons/chevron-down-circle.svg';
import english from '@/assets/svgs/subjects/english-icon.svg';
import StudentLayout from '@/layouts/studentLayout';
import { subjectTextColors } from '@/lib/subject-colors';
import { Head } from '@inertiajs/react';
import { ChevronDown, Download } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AssignmentItem {
    id: number;
    date: string;
    time?: string;
    posted_at?: string;
    chapter: string;
    topic: string;
    file_url?: string;
}

interface SubjectGroup {
    id: number;
    subject_name: string;
    teacher_name: string;
    color: string;
    icon: string;
    color_from: string;
    color_to: string;
    assignments: AssignmentItem[];
}

interface Props {
    groups: SubjectGroup[];
}

function hasTodayAssignment(group: SubjectGroup): boolean {
    const today = new Date();
    const todayStr = today.toDateString();
    return group.assignments.some((a) => {
        const d = new Date(a.date);
        return !Number.isNaN(d.getTime()) && d.toDateString() === todayStr;
    });
}

function formatShortDate(raw: string): string {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw || '--';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
}

export default function Assignment({ groups }: Props) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    return (
        <StudentLayout>
            <Head title="Homework" />

            <div className="flex flex-col gap-6 md:p-4">
                <div className="rounded-2xl md:bg-white/80 md:p-6 md:shadow">
                    {/* Header */}
                    <div className="flex flex-col gap-2 max-sm:mb-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-bold text-black md:text-2xl">Home Work</h2>
                    </div>

                    {/* Empty State */}
                    {groups.length === 0 && <p className="py-6 text-center text-gray-500">No Home work available</p>}

                    {/* Groups */}
                    {groups.map((group, index) => {
                        const isOpen = openIndex === index;
                        const tileColors = subjectTextColors(group.color);
                        const showNewBadge = hasTodayAssignment(group);
                        const cardBg = group.color ? `#${group.color}` : '#95CBFF';

                        return (
                            <div key={group.id} className="mb-4">
                                {/* Subject Header */}
                                <Card
                                    className="cursor-pointer gap-0 rounded-2xl border-none py-0 transition md:mt-5 md:pt-2 md:shadow"
                                    style={{ backgroundColor: cardBg }}
                                >
                                    {/* MOBILE HEADER (Figma node 1:490) */}
                                    <div
                                        className="flex items-center justify-between px-3 py-3 md:hidden"
                                        onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
                                    >
                                        <div className="flex flex-1 items-center gap-3">
                                            <img
                                                src={group.icon ? `/storage/${group.icon}` : english}
                                                alt={group.subject_name ?? 'Subject icon'}
                                                className="h-[71px] w-[71px] object-contain"
                                            />
                                            <div className="flex flex-col gap-[5px]">
                                                <p className="text-base font-bold leading-none" style={{ color: tileColors.primary }}>
                                                    {group.subject_name}
                                                </p>
                                                <p className="text-xs font-medium leading-none" style={{ color: tileColors.secondary }}>
                                                    {group.teacher_name}
                                                </p>
                                                {showNewBadge && (
                                                    <p className="text-xs font-bold leading-none text-[#FF6355]">Today's home work arrived</p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            aria-label={isOpen ? 'Collapse' : 'Expand'}
                                            className="h-[34px] w-[34px] shrink-0"
                                        >
                                            <img
                                                src={chevronCircle}
                                                alt=""
                                                className={`h-[34px] w-[34px] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                    </div>

                                    {/* DESKTOP HEADER (unchanged) */}
                                    <CardHeader className="hidden p-3 md:block sm:p-4" onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}>
                                        <CardTitle className="flex items-center justify-between text-base font-bold text-black sm:text-lg">
                                            <div className="flex items-center justify-between gap-2 text-base font-bold text-black sm:text-lg">
                                                <img
                                                    src={group.icon ? `/storage/${group.icon}` : english}
                                                    alt={group.subject_name ?? 'Subject icon'}
                                                    className="h-24 w-24 rounded-full bg-transparent object-contain"
                                                />
                                                {group.subject_name} <span className="block font-normal">{group.teacher_name}</span>
                                            </div>

                                            <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        </CardTitle>
                                    </CardHeader>

                                    {/* Assignments */}
                                    {isOpen && (
                                        <>
                                            {/* MOBILE EXPANDED CONTENT (Figma node 1:514) */}
                                            <div
                                                className="rounded-b-2xl px-4 pb-4 md:hidden"
                                                style={{ backgroundColor: cardBg }}
                                            >
                                                {/* Top divider above table header */}
                                                <div className="h-px w-full" style={{ backgroundColor: tileColors.secondary, opacity: 0.4 }} />

                                                {/* TABLE HEADER */}
                                                <div className="grid grid-cols-[1fr_1.2fr_1.4fr_0.4fr] items-center gap-2 py-3 text-xs font-bold text-[#C05D14]">
                                                    <span>Date</span>
                                                    <span>Chapter</span>
                                                    <span>Topic</span>
                                                    <span />
                                                </div>

                                                {/* ROWS */}
                                                {group.assignments.length === 0 ? (
                                                    <p className="py-4 text-center text-xs text-[#272727]/60">No assignments</p>
                                                ) : (
                                                    group.assignments.map((a) => (
                                                        <div
                                                            key={a.id}
                                                            className="grid grid-cols-[1fr_1.2fr_1.4fr_0.4fr] items-center gap-2 py-3 text-xs font-normal text-[#272727]"
                                                            style={{
                                                                borderTopWidth: '1px',
                                                                borderTopColor: tileColors.secondary,
                                                                borderTopStyle: 'solid',
                                                                borderImage: 'none',
                                                            }}
                                                        >
                                                            <span>{formatShortDate(a.date)}</span>
                                                            <span className="truncate">{a.chapter || 'N/A'}</span>
                                                            <span className="truncate">{a.topic || 'N/A'}</span>
                                                            <span className="flex justify-end">
                                                                {a.file_url ? (
                                                                    <a
                                                                        href={`/homework/download/${a.id}`}
                                                                        className="inline-flex items-center justify-center text-[#272727]"
                                                                        aria-label="Download attachment"
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-[#272727]/40">—</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* DESKTOP EXPANDED CONTENT (unchanged) */}
                                            <CardContent className="hidden rounded-b-2xl bg-white p-4 md:block">
                                                {/* Table Header (Tablet+) */}
                                                <div className="hidden gap-2 border-b pb-2 text-sm font-medium text-gray-500 md:grid md:grid-cols-4">
                                                    <span>Date & Time</span>
                                                    <span>Chapter</span>
                                                    <span>Topic</span>
                                                    <span className="text-right">Download</span>
                                                </div>

                                                {/* Rows */}
                                                {group.assignments.length === 0 ? (
                                                    <p className="py-4 text-center text-gray-500">No assignments</p>
                                                ) : (
                                                    group.assignments.map((a) => (
                                                        <div
                                                            key={a.id}
                                                            className="flex flex-col gap-2 border-b py-3 last:border-0 md:grid md:grid-cols-4 md:items-center"
                                                        >
                                                            {/* Date */}
                                                            <p className="text-xs text-gray-500 md:text-sm">
                                                                {new Date(a.date).toLocaleDateString('en-IN')}
                                                                <br />
                                                                <span className="text-xs text-gray-500">{a.time || '--'}</span>
                                                            </p>

                                                            {/* Chapter */}
                                                            <p className="font-semibold text-gray-800">{a.chapter || 'N/A'}</p>

                                                            {/* Topic */}
                                                            <p className="text-sm text-gray-600">{a.topic || 'N/A'}</p>

                                                            {/* Download */}
                                                            <div className="flex sm:justify-end">
                                                                {a.file_url ? (
                                                                    <a
                                                                        href={a.file_url}
                                                                        target="_blank"
                                                                        className="inline-flex items-center justify-center rounded-xl bg-[#673DE6]/10 p-2 transition hover:bg-[#673DE6]/20"
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
                    <p className="text-sm font-bold text-[#FF6355] md:text-sm md:font-medium md:text-red-500">
                        <span className="md:hidden">Tips: Homework accessible for 30 days only</span>
                        <span className="hidden md:inline">Note: Home work accessible for 10 days only.</span>
                    </p>
                </div>
            </div>
        </StudentLayout>
    );
}
