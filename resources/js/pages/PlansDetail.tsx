import allIcon from '@/assets/svgs/subjects/all-icon.svg';
import biologyIcon from '@/assets/svgs/subjects/biology-icon.svg';
import chemistryIcon from '@/assets/svgs/subjects/chemistry-icon.svg';
import englishIcon from '@/assets/svgs/subjects/english-icon.svg';
import hindiIcon from '@/assets/svgs/subjects/hindi-icon.svg';
import mathIcon from '@/assets/svgs/subjects/math-icon.svg';
import physicsIcon from '@/assets/svgs/subjects/physics-icon.svg';
import scienceIcon from '@/assets/svgs/subjects/science-icon.svg';
import socialIcon from '@/assets/svgs/subjects/social-icon.svg';

import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, Share2 } from 'lucide-react';
import { useState } from 'react';

const iconMap: Record<string, string> = {
    allIcon,
    biologyIcon,
    chemistryIcon,
    englishIcon,
    hindiIcon,
    mathIcon,
    physicsIcon,
    scienceIcon,
    socialIcon,
};

export default function PlansDetail() {
    const { plan } = usePage().props as any;

    const [activeSubjectId, setActiveSubjectId] = useState<number>(plan.subjects?.[0]?.id);
    const [showSyllabus, setShowSyllabus] = useState(false);

    const activeSubject = plan.subjects.find((s: any) => s.id === activeSubjectId);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const toggleExpand = (index: number) => {
        setExpanded((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };
    // const capitalizeFirst = (text: string = '') => text.charAt(0).toUpperCase() + text.slice(1);
    const capitalizeFirst = (text = '') => {
        const t = text.trim();
        return t ? t[0].toUpperCase() + t.slice(1) : '';
    };
    const subject = plan.subjects?.[0];

    const bgColor = subject?.color ? `#${subject.color}` : '#dbeafe';

    const iconSrc = subject?.icon ? `/storage/${subject.icon}` : allIcon;
    return (
        <>
            <Head title={`Plan - ${plan.title}`} />

            {/* NAVBAR */}
            <div className="bg-[#FDFDFC] p-6">
                <Navbar />
            </div>

            <section className="mx-auto max-w-6xl space-y-10 px-4 py-10">
                {/* ================= HEADER CARD ================= */}
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:p-8">
                    {/* LEFT : IMAGE CARD */}
                    <div className="flex w-full justify-center md:w-[35%]">
                        <div
                            className="flex h-44 w-full max-w-[260px] items-center justify-center rounded-3xl p-4 md:h-52 md:max-w-none"
                            style={{ backgroundColor: bgColor }}
                        >
                            <img src={iconSrc} alt={plan.title} className="h-[90%] object-cover md:rounded-full" />
                        </div>
                    </div>

                    {/* RIGHT : CONTENT */}
                    <div className="flex w-full flex-1 flex-col justify-between gap-5 md:w-[65%]">
                        {/* TOP TEXT */}
                        <div className="space-y-2 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <h1 className="text-left text-xl font-bold text-gray-900 sm:text-2xl">
                                    Comprehensive Course on{' '}
                                    <span className="relative inline-block text-indigo-600">
                                        {plan.subjects.map((s: any) => s.name).join(' + ')}
                                        <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-3xl md:bg-yellow-400" />
                                    </span>
                                </h1>

                                {/* Desktop only – stays in same row */}
                                <p className="hidden shrink-0 text-sm font-semibold whitespace-nowrap text-orange-500 md:block">
                                    {plan.subjects.length} Batch Ongoing
                                </p>
                            </div>

                            {/* Mobile only */}
                            <p className="block text-left text-sm font-semibold text-orange-500 md:hidden">{plan.subjects.length} Batch Ongoing</p>

                            <p className="text-left text-sm font-medium text-gray-800">for Class {plan.class}</p>

                            <p className="max-w-xl text-left text-sm text-gray-600">{plan.description}</p>
                        </div>

                        {/* META + ACTIONS */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            {/* META */}
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-700 sm:justify-start">
                                <Calendar className="h-4 w-4 text-orange-500" />
                                <span>
                                    Batch Schedule: <span className="font-medium">{plan.duration_days} Days</span>
                                </span>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
                                <Button className="rounded-md bg-purple-600 px-6 text-white hover:bg-purple-700">
                                    <Link href={`/enroll/${plan.id}`}>₹ {plan.price} – Get Subscription</Link>
                                </Button>

                                <Button variant="outline" className="rounded-md" onClick={() => setShowSyllabus((v) => !v)}>
                                    {showSyllabus ? 'Hide Syllabus' : 'Syllabus'}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: plan.title,
                                                url: window.location.href,
                                            });
                                        } else {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert('Link copied!');
                                        }
                                    }}
                                >
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= SUBJECT TABS ================= */}
                {plan.subjects?.length > 1 && (
                    <div className="flex flex-wrap gap-4 md:px-8">
                        {plan.subjects.map((subject: any) => {
                            const isActive = activeSubjectId === subject.id;

                            return (
                                <button
                                    key={subject.id}
                                    onClick={() => {
                                        setActiveSubjectId(subject.id);
                                        setShowSyllabus(false);
                                    }}
                                    className={`min-w-[160px] rounded-xl px-6 py-3 text-sm font-medium transition ${
                                        isActive ? 'bg-gray-300 text-gray-800' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    } `}
                                >
                                    {subject.name}
                                </button>
                            );
                        })}
                    </div>
                )}
                {/* ================= OVERVIEW ================= */}
                {!showSyllabus && activeSubject?.overviews?.length > 0 && (
                    <div className="md:p-6">
                        <h2 className="mb-6 text-lg font-semibold">Overview – {activeSubject.name}</h2>

                        <div className="grid items-start gap-6 md:grid-cols-3">
                            {activeSubject.overviews.map((o: any, i: number) => {
                                const isExpanded = expanded[i];
                                const visiblePoints = isExpanded ? o.points : o.points.slice(0, 3);

                                return (
                                    <Card key={i} className="flex flex-col rounded-3xl border-0 bg-[#eaf1ff] p-6">
                                        {/* Content */}
                                        <div>
                                            <h3 className="mb-4 text-base font-semibold text-[#6C63FF]">{capitalizeFirst(o.title)}</h3>

                                            <div className="space-y-2 text-sm text-gray-700">
                                                {visiblePoints.map((p: string, pi: number) => (
                                                    <div key={pi} className="flex items-start gap-2">
                                                        <span
                                                            className={`mt-1 text-sm ${
                                                                o.pointer_type === 'check' ? 'text-green-500' : 'text-gray-600'
                                                            }`}
                                                        >
                                                            {o.pointer_type === 'check' ? '✔' : '●'}
                                                        </span>
                                                        <span>{p}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* More / Less button */}
                                        {o.points.length > 3 && (
                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(i)}
                                                className="mt-6 w-fit rounded-md border border-[#6C63FF] bg-white px-5 py-1 text-sm font-semibold text-[#6C63FF] transition hover:bg-[#6C63FF] hover:text-white"
                                            >
                                                {isExpanded ? 'Less' : 'More'}
                                            </button>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ================= FEATURES ================= */}
                {!showSyllabus && activeSubject?.features?.length > 0 && (
                    <Card className="gap-0 rounded-3xl border-0 bg-[#eaf1ff] p-8">
                        <p className="mb-0 pb-0">From Schedule to Support:</p>
                        <h2 className="my-0 mb-2 py-0 text-lg font-semibold">Everything We've covered</h2>

                        <div className="mt-0 space-y-4 pt-0">
                            {activeSubject.features.map((f: any, i: number) => (
                                <div key={i}>
                                    {/* Title (no bullet) */}
                                    <p className="font-semibold text-[#6C63FF]"> {capitalizeFirst(f.title)} :</p>

                                    {/* Description with bullet */}
                                    <div className="mt-1 flex items-start gap-3">
                                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gray-700" />
                                        <p className="text-sm text-gray-700">{f.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* ================= SYLLABUS ================= */}
                {showSyllabus && activeSubject?.syllabus?.length > 0 && (
                    <Card className="gap-0 rounded-3xl border-0 bg-[#eef2ff] p-8">
                        <h2 className="text-base font-semibold text-gray-900">{activeSubject.name} – Syllabus</h2>

                        <div className="divide-y divide-gray-300/60">
                            {activeSubject.syllabus.map((ch: any, i: number) => (
                                <div key={i} className="py-3">
                                    <p className="font-semibold text-[#6C63FF]">{capitalizeFirst(ch.chapter)} :</p>
                                    <div className="mt-1 space-y-1">
                                        {ch.topics.map((t: string, ti: number) => (
                                            <p key={ti} className="text-sm text-gray-700">
                                                {t}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </section>

            <Footer />
        </>
    );
}
