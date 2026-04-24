import heroImage from '@/assets/svgs/plans/courses-hero-img.svg';
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
import { Card, CardContent } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar } from 'lucide-react';

const iconMap = {
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

const subjects = [
    {
        id: 1,
        title: 'Mathematics',
        teacher: 'Mr. Gupta',
        batches: 22,
        color: 'bg-[#E4E9FF]',
        icon: mathIcon,
    },
    {
        id: 2,
        title: 'Chemistry',
        teacher: 'Mr. Das',
        batches: 22,
        color: 'bg-[#C8F8E4]',
        icon: chemistryIcon,
    },
    {
        id: 3,
        title: 'Physics',
        teacher: 'Mr. Das',
        batches: 22,
        color: 'bg-[#DAD8FF]',
        icon: physicsIcon,
    },
    {
        id: 4,
        title: 'Biology',
        teacher: 'Mr. Das',
        batches: 22,
        color: 'bg-[#DAF8CF]',
        icon: biologyIcon,
    },
    {
        id: 5,
        title: 'All Subjects',
        teacher: '—',
        batches: 22,
        color: 'bg-[#FFF5D0]',
        icon: allIcon,
        offer: true,
        subjects: 'Maths + Chemistry + Physics + Biology + English + Hindi',
    },
    {
        id: 6,
        title: 'All Subjects',
        teacher: '—',
        batches: 22,
        color: 'bg-[#FFF5D0]',
        icon: englishIcon,
        offer: true,
        subjects: 'Maths + Chemistry + Physics + Biology + English + Hindi',
    },
    {
        id: 7,
        title: 'All Subjects',
        teacher: '—',
        batches: 22,
        color: 'bg-[#FFF5D0]',
        icon: scienceIcon,
        offer: true,
        subjects: 'Maths + Chemistry + Physics + Biology + English + Hindi',
    },
    {
        id: 8,
        title: 'All Subjects',
        teacher: '—',
        batches: 22,
        color: 'bg-[#FFF5D0]',
        icon: socialIcon,
        offer: true,
        subjects: 'Maths + Chemistry + Physics + Biology + English + Hindi',
    },
    {
        id: 9,
        title: 'All Subjects',
        teacher: '—',
        batches: 22,
        color: 'bg-[#FFF5D0]',
        icon: hindiIcon,
        offer: true,
        subjects: 'Maths + Chemistry + Physics + Biology + English + Hindi',
    },
];
export default function Plans() {
    const { auth, plans } = usePage<SharedData & { plans: any[] }>().props;
    const boardName = plans?.[0]?.board ?? '';
    const className = plans?.[0]?.class ?? '';
    const darkenHex = (hex: string, amount = 0.12) => {
        const clean = hex.replace('#', '');
        if (clean.length !== 6) return hex;
        const num = parseInt(clean, 16);
        const r = Math.max(0, Math.round(((num >> 16) & 255) * (1 - amount)));
        const g = Math.max(0, Math.round(((num >> 8) & 255) * (1 - amount)));
        const b = Math.max(0, Math.round((num & 255) * (1 - amount)));
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    };

    return (
        <>
            <Head title="Plans" />

            <div className="flex flex-col items-center bg-[#FDFDFC] p-8 text-[#1b1b18] lg:justify-center dark:bg-[#0a0a0a]">
                <header className="w-full text-sm not-has-[nav]:hidden lg:max-w-7xl">
                    <Navbar />
                </header>
            </div>
            <div className="mt-5 flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <section className="flex-1">
                    {/* HERO SECTION */}
                    <div className="mx-auto mb-8 max-w-7xl space-y-4 px-4 pt-8 sm:px-6 sm:pt-10 md:px-8 md:pt-14 lg:pt-16">
                        {false && (
                            <Card className="overflow-hidden rounded-4xl border-0 bg-gradient-to-r from-[#2f4766] via-[#22477a] to-[#2a70d3] shadow-md">
                                <CardContent className="flex flex-col-reverse items-center justify-between p-0 md:flex-row">
                                    <div className="flex-1 space-y-4 py-6 text-center md:py-8 md:text-left">
                                        <h1 className="px-4 text-3xl font-semibold text-[#f8e86b] sm:px-6 sm:text-4xl md:px-10">
                                            Learn Smart, Grow Fast.
                                        </h1>

                                        <p className="mx-auto inline-block rounded-md bg-gradient-to-r from-[rgba(255,255,255,0.4)] via-[rgba(255,255,255,0.2)] to-transparent px-4 py-2 text-lg text-white sm:px-6 sm:text-xl md:mx-0">
                                            For CBSE Classes 6 – 12 & Foundation
                                        </p>

                                        <div className="space-y-2">
                                            <div className="flex flex-col items-center gap-3 px-4 sm:flex-row sm:px-6 md:px-10">
                                                <Button
                                                    asChild
                                                    className="rounded bg-[#FFB258] px-6 font-semibold text-neutral-800 hover:bg-[#FFB258]/80"
                                                >
                                                    <Link href="/student/courses/cbse-pro-science">Enroll Now</Link>
                                                </Button>

                                                <p className="flex items-center gap-2 text-sm text-white">
                                                    <Calendar className="inline h-5 w-5 text-[#ffb258]" />
                                                    Every Sunday | 5:00 PM
                                                </p>
                                            </div>

                                            <p className="px-4 text-xs text-white sm:px-6 md:px-10">
                                                <span className="text-[#FFB258]">*</span> T&C apply as available on the platform
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex hidden justify-center p-4 sm:block md:justify-end md:p-6">
                                        <img src={heroImage} alt="Courses Hero" className="max-h-48 object-contain sm:max-h-56 md:max-h-64" />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Title Block */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <Link href="/" className="hover:underline">
                                    Home
                                </Link>
                                <span>/</span>
                                <Link href="/student/courses" className="hover:underline">
                                    Courses
                                </Link>
                            </div>
                            <p className="text-sm font-medium text-neutral-500">
                                {className} {boardName}
                            </p>
                            <h1 className="text-2xl font-semibold text-[#1b1b18] sm:text-3xl md:text-4xl">
                                {boardName} {className} Course
                            </h1>
                        </div>
                    </div>

                    {/* COURSE GRID */}
                    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-14 md:px-8 md:pb-16">
                        {/* <h1 className="mb-8 text-2xl font-bold text-[#2f4766] sm:text-3xl md:text-4xl">Explore Our Courses</h1> */}

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {plans?.map((plan) => {
                                const subject = plan.subjects?.[0];
                                const subjectNames = plan.subjects?.map((s) => s.name).join(', ') || plan.title;

                                const bgColor = subject?.color ? `#${subject.color}` : '#F7EFFF';
                                const iconBg = darkenHex(bgColor, 0.14);

                                const iconSrc = subject?.icon ? `/storage/${subject.icon}` : allIcon;
                                return (
                                    <Card
                                        key={plan.id}
                                        className={`relative overflow-hidden rounded-3xl border-0 p-0 shadow-sm transition hover:shadow-md sm:bg-transparent`}
                                        style={{ backgroundColor: bgColor }}
                                    >
                                        <CardContent className="flex flex-col justify-between p-4 sm:p-6">
                                            {/* ---- TOP ROW ---- */}
                                            <div className="flex items-start gap-4">
                                                {/* IMAGE LEFT (mobile), keep same for all */}
                                                <div className="w-[35%] shrink-0 sm:w-auto">
                                                    <div
                                                        className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm sm:h-20 sm:w-20"
                                                        style={{ backgroundColor: iconBg }}
                                                    >
                                                        <img src={iconSrc} alt={subjectNames} className="h-14 w-14 object-contain sm:h-17 sm:w-17" />
                                                    </div>
                                                </div>

                                                {/* TEXT BLOCK */}
                                                <div className="flex-1">
                                                    <h2 className="text-xl font-semibold text-[#1b1b18] sm:text-lg">{subjectNames}</h2>

                                                    {/* <p className="text-sm text-gray-600 sm:text-xs">
                                                    {plan.board} • Class {plan.class}
                                                </p> */}

                                                <p className="text-sm text-gray-600 sm:text-xs">
                                                    Ongoing Batches: {plan.ongoing_batches ?? 0}
                                                </p>

                                                {/* BUTTON ROW (mobile horizontal, desktop stays) */}
                                                <div className="mt-1 flex items-center gap-3 sm:mt-4">
                                                    {plan.has_active_subscription ? (
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            className="rounded-md bg-[#673DE6] text-white hover:bg-[#562ed4]"
                                                        >
                                                            <Link href="/dashboard">Go to Dashboard</Link>
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                asChild
                                                                size="sm"
                                                                variant="outline"
                                                                className="rounded-md border border-[#673DE6] bg-transparent text-[#2f4766] hover:bg-[#673DE6] hover:text-white"
                                                            >
                                                                <Link href={`/plans/${plan.id}`}>Explore</Link>
                                                            </Button>

                                                            <Button
                                                                asChild
                                                                size="sm"
                                                                className="rounded-md bg-[#FFB258] text-[#1b1b18] hover:bg-[#FFB258]/80"
                                                            >
                                                                <Link href={`/enroll/${plan.id}`}>Enroll </Link>
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                                </div>
                                            </div>

                                            {/* ---- OFFER TAG ---- */}
                                        {plan.offers?.length > 0 && (
                                            <span className="absolute top-2 right-2 z-10 rounded-[4px] bg-[#E31B5D] px-2 py-1 text-[10px] font-bold uppercase text-white shadow-[0_4px_10px_rgba(227,27,93,0.35)]">
                                                Special Offer
                                            </span>
                                        )}
                                        </CardContent>
                                    </Card>
                                    // <Card
                                    //     key={plan.id}
                                    //     className={`relative overflow-hidden rounded-3xl border-0 p-0 shadow-sm transition hover:shadow-md ${plan.color ?? 'bg-[#E4E9FF]'}`}
                                    // >
                                    //     <CardContent className="flex flex-col justify-between p-4">
                                    //         <div className="flex items-start gap-4">
                                    //             <img
                                    //                 src={iconMap[plan.subjects?.[0]?.icon] ?? allIcon}
                                    //                 alt={plan.title}
                                    //                 className="h-fit md:h-fit   rounded-md object-contain"
                                    //             />

                                    //             <div>
                                    //                 <h2 className="text-lg font-semibold text-[#1b1b18]">{plan.title}</h2>
                                    //                 <p className="sm:mt-1  text-xs text-pink-600">{plan.subjects?.map((s) => s.name).join(', ')}</p>
                                    //                 <p className="text-xs text-gray-600">
                                    //                     {plan.board} • Class {plan.class}
                                    //                 </p>
                                    //                 <p className="text-xs text-gray-600">₹ {plan.price}</p>

                                    //                 <div className="sm:mt-4 flex items-center gap-3">
                                    //                     <Button
                                    //                         asChild
                                    //                         size="sm"
                                    //                         variant="outline"
                                    //                         className="rounded-md border border-[#673DE6] text-[#2f4766] bg-transparent hover:bg-[#673DE6] hover:text-white"
                                    //                     >
                                    //                         <Link href={`/plans/${plan.id}`}>Explore</Link>
                                    //                     </Button>

                                    //                     <Button
                                    //                         asChild
                                    //                         size="sm"
                                    //                         className="rounded-md bg-[#FFB258] text-[#1b1b18] hover:bg-[#FFB258]/80"
                                    //                     >
                                    //                         <Link href={`/enroll/${plan.id}`}>Enroll</Link>
                                    //                     </Button>
                                    //                 </div>
                                    //             </div>
                                    //         </div>

                                    //         {/* OFFER TAG */}
                                    //         {plan.offers?.length > 0 && (
                                    //             <span className="absolute top-0 right-0 rounded bg-[#ee518d] px-3 py-2 text-[10px] font-semibold text-white shadow">
                                    //                 SPECIAL OFFER
                                    //             </span>
                                    //         )}
                                    //     </CardContent>
                                    // </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>

            {/* <div className="mt-5 flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <section className="min-h-screen flex-1">
                    <div className="mx-auto max-w-6xl space-y-6 pt-10 sm:pt-12 md:pt-14 lg:pt-16">
                        <Card className="overflow-hidden rounded-4xl border-0 bg-gradient-to-r from-[#2f4766] via-[#22477a] to-[#2a70d3] shadow-md">
                            <CardContent className="flex items-center justify-between p-0">
                                <div className="flex-1 space-y-6 py-3 md:py-3">
                                    <h1 className="px-6 text-4xl font-semibold text-[#f8e86b] md:px-10">Learn Smart, Grow Fast.</h1>

                                    <p className="inline-block rounded-md bg-gradient-to-r from-[rgba(255,255,255,0.5)] via-[rgba(255,255,255,0.25)] to-[rgba(255,255,255,0)] px-6 py-2 text-2xl text-white md:px-10">
                                        For CBSE Classes 6 – 12 & Foundation
                                    </p>

                                    <div>
                                        <div className="flex items-center gap-4 px-6 md:px-10">
                                            <Button
                                                asChild
                                                className="rounded border-[#FFB258] bg-[#FFB258] px-6 font-semibold text-neutral-800 hover:bg-[#FFB258]/80"
                                            >
                                                <Link href="/student/courses/cbse-pro-science">Enroll Now</Link>
                                            </Button>

                                            <p className="flex items-center gap-2 text-sm text-white">
                                                <Calendar className="inline h-5 w-5 text-[#ffb258]" /> Every Sunday | 5:00 PM
                                            </p>
                                        </div>

                                        <p className="mt-2 px-6 text-xs text-white md:px-10">
                                            <span className="text-[#FFB258]">*</span> T&C apply as available on the platform
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden p-2 md:inline-block">
                                    <img src={heroImage} alt="Courses Hero" className="max-h-[240px]" />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
                            <Link href="/" className="hover:underline">
                                Home
                            </Link>
                            <span>/</span>
                            <Link href="/student/courses" className="hover:underline">
                                Courses
                            </Link>
                        </div>
                    </div>

                    <div className="mx-auto max-w-7xl px-6 pb-10 sm:pb-12 md:px-8 md:pb-14 lg:pb-16">
                        <h1 className="mb-10 text-3xl font-bold text-[#2f4766]">Explore Our Courses</h1>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  
                            {plans?.map((plan) => {
                                return (
                                    <Card
                                        key={plan.id}
                                        className={`relative justify-center overflow-hidden rounded-3xl border-0 p-0 shadow-sm transition hover:shadow-md ${plan.color ?? 'bg-[#E4E9FF]'}`}
                                        // className={`relative justify-center overflow-hidden rounded-3xl border-0 p-0 shadow-sm transition hover:shadow-md`}
                                    >
                                        <CardContent className="flex flex-col justify-between p-2">
                                         
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={iconMap[plan.subjects?.[0]?.icon] ?? allIcon}
                                                    alt={plan.title}
                                                    className="h-fit rounded-md object-contain"
                                                />
                                                <div>
                                                    <h2 className="text-lg font-semibold text-[#1b1b18]">{plan.title}</h2>
                                                    <p className="mt-2 text-xs text-pink-600">{plan.subjects?.map((s) => s.name).join(', ')}</p>
                                                    <p className="text-xs text-gray-600">
                                                        {plan.board} • Class {plan.class}
                                                    </p>
                                                    <p className="text-xs text-gray-600">₹ {plan.price}</p>
                                                    <div className="mt-4 flex items-center gap-3">
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-md border border-[#2f4766] text-[#2f4766] hover:bg-[#2f4766] hover:text-white"
                                                        >
                                                            <Link href={`/plans/${plan.id}`}>Explore</Link>
                                                        </Button>
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            className="rounded-md bg-[#FFB258] text-[#1b1b18] hover:bg-[#FFB258]/80"
                                                        >
                                                            <Link href={`/enroll/${plan.id}`}>Enroll Now</Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                           
                                            {plan.offers?.length > 0 && (
                                                <span className="absolute top-0 right-0 rounded bg-[#ee518d] px-3 py-2 text-[10px] font-semibold text-white shadow">
                                                    SPECIAL OFFER
                                                </span>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div> */}

            <Footer />
        </>
    );
}
