import book from '@/assets/svgs/plan/book.svg';
import doubt from '@/assets/svgs/plan/doubt.svg';
import lock from '@/assets/svgs/plan/lock.svg';
import practice from '@/assets/svgs/plan/practice.svg';
import progress from '@/assets/svgs/plan/progress.svg';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check, Info } from 'lucide-react';

import planCtaImg from '@/assets/images/plan/plan-cta-img.png';
import planCtaIcon from '@/assets/svgs/plan/plan-cta-icon.svg';
import { Phone } from 'lucide-react';
type Plan = {
    id: number;
    name: string;
    type: string;
    price: number;
    tag?: 'Necessary' | 'Most Popular' | 'Recommended';
    description: string;
    features: string[];
};

type Board = { id: number; name: string };
type Clazz = { id: number; name: string };
export default function Plan() {
    const { auth } = usePage<SharedData>().props;
    const { board, clazz, plans } = usePage().props as {
        board: Board;
        clazz: Clazz;
        plans: Plan[];
    };

    const planColors = {
        'Smart Subject Plan': '#8B5CF6', // violet
        'Combo Advantage Plan': '#6366F1', // indigo
        'Star Achiever Plan': '#A855F7', // purple
    } as Record<string, string>;

    const planDetails: Record<number, { icon: string; title: string; text: string }[]> = {
        0: [
            {
                icon: book,
                title: 'One Subject Focus',
                text: 'Complete, in-depth syllabus for your chosen subject, from basics to advanced.',
            },
            {
                icon: doubt,
                title: 'Doubt Support',
                text: 'Expert doubt resolution at fixed times after class plus 24×7 post-a-doubt feature.',
            },
            {
                icon: practice,
                title: 'Practice & Tests',
                text: 'Daily homework, weekly practice sheets, and periodic tests for your chosen subject.',
            },
            {
                icon: progress,
                title: 'Monthly Progress Report',
                text: 'Monthly updates on performance, improvement, and focus areas.',
            },
            {
                icon: lock,
                title: 'Recording on Request',
                text: 'Access class recordings on request if a session is missed.',
            },
        ],

        1: [
            {
                icon: book,
                title: 'All Subjects, One Plan',
                text: 'Study multiple subjects in a single plan for complete preparation.',
            },
            {
                icon: practice,
                title: 'Comprehensive Practice Material',
                text: 'Topic-wise tests and subject-level mock exams.',
            },
            {
                icon: progress,
                title: 'Personal Progress Dashboard',
                text: 'Track your performance across all subjects with detailed analytics.',
            },
            {
                icon: doubt,
                title: 'Dedicated Doubt Experts',
                text: '24×7 expert guidance for all subjects under one plan.',
            },
            {
                icon: lock,
                title: 'Full Recording Access',
                text: 'Unlimited access to recorded sessions for all subscribed subjects.',
            },
        ],

        2: [
            {
                icon: book,
                title: 'Elite Study Resources',
                text: 'Premium content curated by top educators and exam experts.',
            },
            {
                icon: practice,
                title: 'Advanced Test Series',
                text: 'High-level practice and full-length exams for competitive edge.',
            },
            {
                icon: progress,
                title: 'Performance Insights',
                text: 'AI-driven performance tracking and improvement suggestions.',
            },
            {
                icon: doubt,
                title: 'Priority Doubt Solving',
                text: 'Faster and personalized doubt resolution sessions.',
            },
            {
                icon: lock,
                title: 'Extended Recording Access',
                text: 'Access class recordings anytime, for the entire session period.',
            },
        ],
    };
    return (
        <>
            <Head title={`${board.name} Classes`} />
            <div className="flex flex-col items-center bg-[#FDFDFC] p-8 text-[#1b1b18] lg:justify-center dark:bg-[#0a0a0a]">
                <header className="w-full text-sm not-has-[nav]:hidden lg:max-w-7xl">
                    <Navbar />
                </header>
            </div>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <section className="my-8 min-h-screen flex-1">
                    <main className="flex-1 px-6 py-12 md:px-10 lg:px-16 dark:text-gray-300">
                        <div className="mx-auto max-w-6xl space-y-6 text-center">
                            <h1 className="text-4xl font-semibold">
                                Choose Your <span className="text-[#673de6]">{clazz.name}</span> Plan
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Compare, decide, and learn with confidence
                                {`Explore our plans for ${board.name} - ${clazz.name}. Find one that fits your learning goals.`}
                            </p>
                        </div>
                        <div className="mx-auto mt-12 flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto px-1 sm:flex sm:overflow-x-auto md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
                            {/* <div className="mx-auto mt-12 flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto px-1 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible lg:grid-cols-3"> */}
                            {/* <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 dark:text-gray-300"> */}
                            {plans.map((plan, i) => {
                                return (
                                    <Card
                                        key={plan.id}
                                        onMouseEnter={(e) => {
                                            if (i === 2) e.currentTarget.style.boxShadow = '0 10px 28px rgba(103, 61, 230, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (i === 2) e.currentTarget.style.boxShadow = '0 8px 20px rgba(103, 61, 230, 0.3)';
                                        }}
                                        className={`relative flex min-w-[100%] snap-start flex-col justify-between rounded-3xl border shadow-sm transition hover:shadow-xl sm:min-w-[45%] ${i === 2 ? 'border-[#673de6] shadow-md' : 'border-gray-200'} `}
                                        // className={`relative flex min-w-[75%] snap-start flex-col justify-between rounded-3xl border shadow-sm transition hover:shadow-xl sm:min-w-0 ${i === 2 ? 'border-[#673de6] shadow-md' : 'border-gray-200'}' }`}
                                        style={
                                            i === 2
                                                ? {
                                                      boxShadow: '0 8px 24px rgba(103, 61, 230, 0.3)',
                                                  }
                                                : {}
                                        }
                                    >
                                        {/* <Card
                                        key={plan.id}
                                        className={`relative flex min-w-[75%] snap-start flex-col justify-between rounded-3xl border p-6 shadow-sm transition hover:shadow-xl sm:min-w-[45%] md:min-w-0 ${i === 2 ? 'border-[#673de6] shadow-md' : 'border-gray-200'} `}
                                    > */}
                                        <CardHeader className="space-y-2 px-3">
                                            <h3 className="text-2xl font-semibold" style={{ color: planColors[plan.name] || '#673de6' }}>
                                                {plan.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                                            <div className="mt-4 flex items-center gap-3">
                                                {plan.tag && (
                                                    <span
                                                        className={`inline-flex w-auto rounded-full border px-3 py-2 text-xs font-medium ${
                                                            plan.tag === 'Most Popular'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : plan.tag === 'Recommended'
                                                                  ? 'bg-green-100 text-green-700'
                                                                  : 'bg-gray-100 text-gray-600'
                                                        } `}
                                                    >
                                                        {plan.tag}
                                                    </span>
                                                )}

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            className="flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-medium text-neutral-700 transition hover:underline"
                                                            style={{
                                                                borderColor: `${planColors[plan.name] || '#673de6'}99`,
                                                                color: planColors[plan.name] || '#673de6',
                                                            }}
                                                        >
                                                            <Info size={14} />
                                                            details...
                                                        </button>
                                                    </AlertDialogTrigger>

                                                    <AlertDialogContent className="grid max-h-[90vh] w-[95vw] grid-rows-[auto_1fr_auto] overflow-hidden lg:max-w-[50%]">
                                                        {/* HEADER */}
                                                        <AlertDialogHeader className="border-b border-gray-300 pb-4">
                                                            <AlertDialogTitle
                                                                className="mb-1 text-center text-2xl font-bold"
                                                                style={{ color: planColors[plan.name] || '#673de6' }}
                                                            >
                                                                {plan.name}
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription className="text-center text-base text-gray-500">
                                                                One Subject, Full Focus, Strong Base
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>

                                                        {/* SCROLLABLE BODY */}
                                                        <div className="min-h-0 overflow-y-auto px-1 py-4">
                                                            <div className="space-y-3">
                                                                {(planDetails[i] || []).map((item, index) => (
                                                                    <div key={index} className="flex flex-col gap-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <img src={item.icon} alt={item.title} className="h-8 w-8" />
                                                                            <p className="font-semibold">{item.title}</p>
                                                                        </div>
                                                                        <p className="pl-10 text-sm text-gray-700">{item.text}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* FOOTER */}
                                                        <AlertDialogFooter className=" pt-4">
                                                            <AlertDialogCancel className="mx-auto bg-[#673de6] text-white">Close</AlertDialogCancel>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="flex-1 space-y-4 border-t-2">
                                            {/* <p className="text-center text-3xl font-bold" style={{ color: planColors[plan.name] || '#673de6' }}>
                                            ₹{plan.price}
                                        </p> */}
                                            <ul className="mt-5 space-y-2 text-sm text-gray-700 dark:text-gray-400">
                                                {plan.features.map((feature, i) => {
                                                    const [title, desc] = feature.split('—');
                                                    return (
                                                        <li key={i} className="mb-3 flex items-start gap-2 pb-2">
                                                            <Check size={16} className="mt-[2px] shrink-0 text-[#673de6]" />
                                                            {/* <CheckCircle2 size={16} className="mt-[2px] shrink-0 text-[#673de6]" /> */}
                                                            <span>
                                                                {' '}
                                                                <strong>{title.trim()}</strong> — {desc.trim()}
                                                            </span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </CardContent>

                                        <CardFooter className="pt-6">
                                            <Button
                                                className="w-full rounded-xl bg-[#673de6] py-3 font-medium hover:bg-[#562ed4] dark:text-gray-300"
                                                asChild
                                            >
                                                <Link href={`/plans/${clazz.id}/${plan.type}`}>
                                                    {plan.type === 'single'
                                                        ? 'Get Smart Plan Now'
                                                        : plan.type === 'combo'
                                                          ? 'Get Combo Advantage Now'
                                                          : 'Get Star Achiever Now'}
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    </main>
                </section>
                <section className="sm:px-auto my-8 min-h-fit flex-1 space-y-8 px-6 pb-12">
                    {/* --- Top CTA Card --- */}
                    <div className="mx-auto flex max-w-6xl items-center gap-4 rounded-2xl bg-[#E6EFFF] p-4 md:p-6">
                        <div className="flex-1">
                            <p className="text-2xl font-semibold text-neutral-900 md:text-3xl">Have questions about CBSE Class 12 subscription?</p>
                            <p className="mt-2 text-neutral-700 md:text-lg">Our expert can answer all your questions</p>

                            <div className="mt-4 flex flex-wrap items-center gap-4">
                                <button className="btn rounded-2xl bg-[#9BACF7] !p-6 font-semibold text-neutral-700 transition-all hover:bg-[#879EF5]">
                                    Get a call from us
                                </button>

                                <p className="flex flex-col border-l border-gray-400 pl-4 text-xs text-neutral-600">
                                    <span>Or Call us on</span>
                                    <span className="mt-1 flex items-center">
                                        <Phone className="mr-2 h-3.5 w-3.5 text-neutral-700" />
                                        +91 00000000
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="hidden h-48 w-48 items-end justify-center overflow-hidden rounded-full bg-white shadow-md sm:flex">
                            <img src={planCtaImg} alt="Plan CTA" className="max-h-[180px] object-contain" />
                        </div>
                    </div>

                    {/* --- Bottom CTA Card --- */}
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#FFCE8A] p-6">
                        <div>
                            <p className="text-xl font-semibold text-neutral-800 sm:text-2xl md:text-3xl">Need both core and scoring subjects?</p>
                            <p className="mt-2 text-xl font-semibold text-[#FF6E80] sm:text-2xl md:text-3xl">
                                Go for the Best Value Plan to unlock all premium benefits
                            </p>
                        </div>
                        <img src={planCtaIcon} alt="Best Value Plan Icon" className="h-auto w-20 sm:w-24" />
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
