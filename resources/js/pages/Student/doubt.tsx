import chevronCircle from '@/assets/svgs/chevrons/chevron-down-circle.svg';
import english from '@/assets/svgs/subjects/english-icon.svg';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StudentLayout from '@/layouts/studentLayout';
import { subjectTextColors } from '@/lib/subject-colors';
import { Head, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Clock3, FileText, MessageCircleQuestion, Paperclip, Send } from 'lucide-react';
import { useMemo, useState } from 'react';

type RecentDoubtWithSession = {
    id: number;
    question: string;
    attachment?: string | null;
    created_at?: string | null;
    teacher?: { user?: { name?: string } } | null;
    session: {
        id: number;
        class_date: string;
        topic?: string;
        subject?: { id?: number; name?: string; icon?: string | null; color?: string | null } | null;
        teacher?: { user?: { name?: string } } | null;
    };
};

type AllowedSessionItem = {
    id: number;
    class_date: string;
    topic?: string | null;
    subject?: { id?: number; name?: string; color?: string | null; icon?: string | null } | null;
    teacher?: { user?: { name?: string } } | null;
};

function AskDoubtCard({ session, postCount }: { session: AllowedSessionItem; postCount: number }) {
    const { data, setData, post, processing, errors } = useForm({
        question: '',
        file: null as File | null,
        class_session_id: session.id,
    });
    const [isOpen, setIsOpen] = useState(false);

    const submitDoubt = () => {
        if (!data.question.trim()) return;

        post('/post-doubt/store', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('question', '');
                setData('file', null);
            },
        });
    };

    const subjectName = session.subject?.name || session.topic || 'Class Session';
    const teacherName = session.teacher?.user?.name || 'Teacher';
    const subjectColor = session.subject?.color || '';
    const cardBg = subjectColor ? `#${subjectColor}` : '#FFE7D1';
    const tileColors = subjectTextColors(subjectColor);
    const subjectIcon = session.subject?.icon ? `/storage/${session.subject.icon}` : english;

    return (
        <>
            {/* MOBILE CARD (Figma node 1:564) */}
            <div className="mb-4 md:hidden">
                <div className="overflow-hidden rounded-2xl" style={{ backgroundColor: cardBg }}>
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-3 py-3"
                        onClick={() => setIsOpen((prev) => !prev)}
                    >
                        <div className="flex flex-1 items-center gap-3">
                            <img
                                src={subjectIcon}
                                alt={subjectName}
                                className="h-[71px] w-[71px] object-contain"
                            />
                            <div className="flex flex-col gap-[5px]">
                                <p className="text-base font-bold leading-none" style={{ color: tileColors.primary }}>
                                    {subjectName}
                                </p>
                                <p className="text-xs font-medium leading-none" style={{ color: tileColors.secondary }}>
                                    {teacherName}
                                </p>
                                <p className="text-xs font-bold leading-none text-[#676767]">{postCount} Posted</p>
                            </div>
                        </div>
                        <button type="button" aria-label={isOpen ? 'Collapse' : 'Expand'} className="h-[34px] w-[34px] shrink-0">
                            <img
                                src={chevronCircle}
                                alt=""
                                className={`h-[34px] w-[34px] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            />
                        </button>
                    </div>

                    {/* Expanded form */}
                    {isOpen && (
                        <div className="px-4 pt-1 pb-4">
                            <textarea
                                rows={5}
                                className="w-full rounded-lg border border-[#947E7D] bg-white/40 p-3 text-sm text-[#272727] outline-none placeholder:text-[#676767]/70"
                                placeholder="Type your doubt here..."
                                value={data.question}
                                onChange={(e) => setData('question', e.target.value)}
                            />
                            <div className="mt-3 flex items-center gap-3">
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={submitDoubt}
                                    className="inline-flex h-[28px] w-[94px] items-center justify-center rounded-lg border border-[#947E7D] text-xs font-bold text-[#272727] transition disabled:opacity-50"
                                >
                                    {processing ? 'Posting…' : 'Post'}
                                </button>
                                <label className="inline-flex h-[28px] w-[94px] cursor-pointer items-center justify-center rounded-lg border border-[#676767] text-xs font-bold text-[#676767]">
                                    Add photo
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                                    />
                                </label>
                            </div>
                            {data.file && <p className="mt-2 text-[11px] text-[#676767]">Selected: {data.file.name}</p>}
                            {(errors.question || errors.file) && (
                                <p className="mt-2 text-xs font-medium text-[#FF6355]">{errors.question || errors.file}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* DESKTOP CARD (unchanged) */}
            <div className="hidden md:block">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-base font-semibold text-slate-900">{subjectName}</p>
                            <p className="text-sm text-slate-500">{teacherName}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <Clock3 className="h-3.5 w-3.5" />
                            Open
                        </span>
                    </div>

                    <p className="mb-3 text-xs text-slate-500">Class Date: {new Date(session.class_date).toLocaleString()}</p>

                    <textarea
                        rows={4}
                        className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none transition focus:border-blue-500"
                        placeholder="Type your doubt here..."
                        value={data.question}
                        onChange={(e) => setData('question', e.target.value)}
                    />

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <Paperclip className="h-4 w-4" />
                            Upload File
                            <input type="file" className="hidden" onChange={(e) => setData('file', e.target.files?.[0] ?? null)} />
                        </label>

                        <button
                            type="button"
                            disabled={processing}
                            onClick={submitDoubt}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                            <Send className="h-4 w-4" />
                            {processing ? 'Posting...' : 'Post Doubt'}
                        </button>

                        {data.file && <p className="text-xs text-slate-500">Selected: {data.file.name}</p>}
                    </div>

                    {(errors.question || errors.file) && (
                        <p className="mt-2 text-sm text-rose-600">{errors.question || errors.file}</p>
                    )}
                </div>
            </div>
        </>
    );
}

function RecentDoubtCard({ doubt, postCount }: { doubt: RecentDoubtWithSession; postCount: number }) {
    const [open, setOpen] = useState(false);
    const submittedAt = doubt.created_at ? new Date(doubt.created_at) : null;
    const submittedDate = submittedAt ? submittedAt.toLocaleDateString() : '-';
    const submittedTime = submittedAt ? submittedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
    const subjectName = doubt.session?.subject?.name || doubt.session?.topic || 'Subject';
    const teacherName = doubt.teacher?.user?.name || doubt.session?.teacher?.user?.name || 'Teacher';
    const subjectColor = doubt.session?.subject?.color ? String(doubt.session.subject.color) : '';
    const cardBg = subjectColor ? `#${subjectColor}` : '#E5D6D6';
    const tileColors = subjectTextColors(subjectColor);
    const subjectIcon = doubt.session?.subject?.icon ? `/storage/${doubt.session.subject.icon}` : english;
    const cardStyle = subjectColor
        ? {
              backgroundColor: `${subjectColor}22`,
              borderColor: `${subjectColor}55`,
          }
        : undefined;

    return (
        <>
            {/* MOBILE CARD (Figma node 1:598) */}
            <div className="mb-4 md:hidden">
                <div className="overflow-hidden rounded-2xl" style={{ backgroundColor: cardBg }}>
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-3 py-3"
                        onClick={() => setOpen((prev) => !prev)}
                    >
                        <div className="flex flex-1 items-center gap-3">
                            <img src={subjectIcon} alt={subjectName} className="h-[71px] w-[71px] object-contain" />
                            <div className="flex flex-col gap-[5px]">
                                <p className="text-base font-bold leading-none" style={{ color: tileColors.primary }}>
                                    {subjectName}
                                </p>
                                <p className="text-xs font-medium leading-none" style={{ color: tileColors.secondary }}>
                                    {teacherName}
                                </p>
                                <p className="text-xs font-bold leading-none text-[#676767]">{postCount} Posted</p>
                            </div>
                        </div>
                        <button type="button" aria-label={open ? 'Collapse' : 'Expand'} className="h-[34px] w-[34px] shrink-0">
                            <img
                                src={chevronCircle}
                                alt=""
                                className={`h-[34px] w-[34px] transition-transform ${open ? 'rotate-180' : ''}`}
                            />
                        </button>
                    </div>

                    {/* Expanded posted-doubt view */}
                    {open && (
                        <div className="px-4 pt-1 pb-4">
                            <p className="mb-2 text-xs font-bold text-[#676767]">Posted Doubts</p>
                            <div className="min-h-[100px] rounded-lg border border-[#C3A8A6] bg-white/40 p-3">
                                <p className="text-sm font-medium text-black">{doubt.question}</p>
                                {doubt.attachment && (
                                    <a
                                        href={`/storage/${doubt.attachment}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#272727]/80 underline"
                                    >
                                        <FileText className="h-4 w-4" />
                                        View Attachment
                                    </a>
                                )}
                            </div>
                            <p className="mt-2 text-[11px] text-[#676767]">
                                Submitted: {submittedDate} {submittedTime}
                            </p>
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="inline-flex h-[28px] w-[94px] items-center justify-center rounded-lg border border-[#947E7D] text-xs font-bold text-[#272727]"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* DESKTOP CARD (unchanged) */}
            <div className="hidden md:block">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" style={cardStyle}>
                    <button
                        type="button"
                        onClick={() => setOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between gap-3 text-left"
                        aria-expanded={open}
                    >
                        <div className="flex items-center gap-3">
                            <img src={subjectIcon} alt={subjectName} className="h-9 w-9 rounded-full object-cover" />
                            <div>
                                <p className="text-base font-semibold text-slate-900">{subjectName}</p>
                                <p className="text-sm text-slate-500">{teacherName}</p>
                                <p className="text-xs text-slate-400">
                                    Submitted: {submittedDate} {submittedTime}
                                </p>
                            </div>
                        </div>
                        <span className="text-slate-500">{open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</span>
                    </button>

                    {open && (
                        <>
                            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
                                <p className="font-medium">{doubt.question}</p>
                                {doubt.attachment && (
                                    <a
                                        href={`/storage/${doubt.attachment}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 inline-flex items-center gap-1 text-blue-600 hover:underline"
                                    >
                                        <FileText className="h-4 w-4" />
                                        View Attachment
                                    </a>
                                )}
                            </div>

                            <div className="mt-3 space-y-1 text-xs text-slate-500">
                                <p>Class Date: {new Date(doubt.session.class_date).toLocaleDateString()}</p>
                                <p>Class Time: {new Date(doubt.session.class_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <p>Submitted On: {submittedDate}</p>
                                <p>Submitted At: {submittedTime}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default function DoubtsPage({
    recentDoubts,
    allowedSessions,
}: {
    recentDoubts: RecentDoubtWithSession[];
    allowedSessions: AllowedSessionItem[];
}) {
    const [infoOpen, setInfoOpen] = useState(false);

    // Compute "X Posted" count per subject from recentDoubts so each card
    // can show how many doubts the student has already posted in that subject.
    const postCountBySubject = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const doubt of recentDoubts ?? []) {
            const key = String(doubt.session?.subject?.id ?? doubt.session?.subject?.name ?? '');
            if (!key) continue;
            counts[key] = (counts[key] ?? 0) + 1;
        }
        return counts;
    }, [recentDoubts]);

    const getCount = (subject?: { id?: number; name?: string } | null) => {
        if (!subject) return 0;
        const key = String(subject.id ?? subject.name ?? '');
        return postCountBySubject[key] ?? 0;
    };

    return (
        <StudentLayout>
            <Head title="Post Doubt" />

            <div className="flex flex-col gap-6 md:p-4">
                <div className="rounded-2xl md:bg-white/80 md:p-6 md:shadow">
                    {/* Title */}
                    <div className="flex items-center justify-between max-sm:mb-2 sm:mb-6">
                        <h1 className="text-lg font-bold text-black md:text-2xl md:text-slate-900">
                            <span className="md:hidden">Ask Doubt</span>
                            <span className="hidden md:inline">Post Doubt</span>
                        </h1>
                    </div>

                    {/* DESKTOP-ONLY: Ask New Doubt section heading */}
                    <section className="space-y-3">
                        <div className="hidden items-center justify-between md:flex">
                            <h2 className="text-lg font-semibold text-slate-900">Ask New Doubt</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setInfoOpen(true)}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                                    aria-label="Post doubt info"
                                >
                                    <MessageCircleQuestion className="h-4 w-4" />
                                </button>
                                <span className="text-xs text-slate-500">{allowedSessions?.length || 0} session(s) open</span>
                            </div>
                        </div>

                        {allowedSessions?.length ? (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {allowedSessions.map((session) => (
                                    <AskDoubtCard
                                        key={`ask-${session.id}`}
                                        session={session}
                                        postCount={getCount(session.subject)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-[#676767] md:p-8 md:text-sm md:text-slate-500">
                                No session is currently open for posting doubts.
                            </div>
                        )}
                    </section>

                    <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Post Doubt</DialogTitle>
                            </DialogHeader>
                            <p className="text-sm text-slate-600">
                                You can ask doubts only until 1 hour before the next class (same batch and subject).
                            </p>
                        </DialogContent>
                    </Dialog>

                    <section className="space-y-3">
                        {/* DESKTOP-ONLY: Your Recent Doubts section heading */}
                        <div className="hidden items-center justify-between md:flex">
                            <h2 className="text-lg font-semibold text-slate-900">Your Recent Doubts</h2>
                            <span className="text-xs text-slate-500">Last 2 days</span>
                        </div>

                        {recentDoubts?.length ? (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {recentDoubts.map((doubt) => (
                                    <RecentDoubtCard
                                        key={`recent-${doubt.id}`}
                                        doubt={doubt}
                                        postCount={getCount(doubt.session?.subject)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-[#676767] md:p-8 md:text-sm md:text-slate-500">
                                No doubts asked in the last 2 days.
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </StudentLayout>
    );
}
