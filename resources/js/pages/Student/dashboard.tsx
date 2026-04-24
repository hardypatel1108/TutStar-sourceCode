import StudentLayout from '@/layouts/studentLayout';
import type { SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

import english from '@/assets/svgs/subjects/english-icon.svg';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import '@splidejs/splide/dist/css/splide.min.css';
import { AlarmClock, BookOpenText, CheckCircle2, NotebookPen } from 'lucide-react';
export default function Dashboard() {
    const options = {
        perPage: 3,
        arrows: false,
        gap: '1rem',
        pagination: true,
        breakpoints: {
            1280: { perPage: 3 }, // large screens (laptops)
            1024: { perPage: 2 }, // tablets
            768: { perPage: 2 },
            640: { perPage: 2 },
            480: { perPage: 1 },
        },
    };

    // static mock data
    const todayClasses = [
        { subject: 'English', time: '12:30 PM', teacher: 'Mrs. Gupta', is_completed: false },
        { subject: 'Maths', time: '2:00 PM', teacher: 'Mr. Sharma', is_completed: true },
        { subject: 'Science', time: '4:00 PM', teacher: 'Dr. Verma', is_completed: false },
        { subject: 'English', time: '12:30 PM', teacher: 'Mrs. Gupta', is_completed: true },
        { subject: 'Maths', time: '2:00 PM', teacher: 'Mr. Sharma', is_completed: false },
        { subject: 'Science', time: '4:00 PM', teacher: 'Dr. Verma', is_completed: false },
    ];

    const sortedTodayClasses = [...todayClasses].sort((a, b) => {
        const aCompleted = a.is_completed ? 1 : 0;
        const bCompleted = b.is_completed ? 1 : 0;
        return aCompleted - bCompleted;
    });

    const batches = [
        {
            course: 'Physics',
            teacher: 'Mrs. Gupta',
            join_date: '01 Jan 2025',
            expire_date: '01 Feb 2025',
        },
        {
            course: 'Mathematics',
            teacher: 'Mr. Sharma',
            join_date: '05 Jan 2025',
            expire_date: '05 Feb 2025',
        },
    ];

    // const breadcrumbs: BreadcrumbItem[] = [
    //     {
    //         title: 'Dashboard',
    //         href: dashboard().url,
    //     },
    // ];

    const { auth } = usePage<SharedData>().props;
    return (
        <StudentLayout>
            <Head title="Dashboard" />{' '}
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative mb-32 rounded-2xl bg-white/70 p-4 shadow">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Dashboard</h2>
                        <Link href="/notifications" className="relative rounded border border-blue-500 px-3 py-1 text-blue-600">
                            Notifications
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500" />
                        </Link>
                    </div>

                    {/* Upcoming Class */}
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#91ADFF] to-[#886AFF] p-1 shadow">
                        <div className="rounded-xl bg-white p-4">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">From</p>
                                    <p className="font-semibold text-neutral-700">10:00 AM Today – Rakesh</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Course</p>
                                    <p className="font-semibold text-neutral-700">Mathematics</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">Teacher</p>
                                    <p className="font-semibold text-neutral-700">Mr. Sharma</p>
                                    <p className="mt-1 flex items-center justify-end gap-1 text-sm text-orange-500">
                                        <AlarmClock className="h-3 w-3" /> 20 minutes
                                    </p>
                                    <Button className="mt-2 w-full bg-orange-500 text-white hover:bg-orange-400">Join</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Today's Classes */}
                    {/* <div className="mt-6">
                        <p className="mb-3 text-lg font-semibold">Today's Classes</p>
                        <Splide options={options} aria-label="Classes Slider" className="pb-8">
                            {todayClasses.map((cls, i) => (
                                <SplideSlide key={i}>
                                    <div className="relative flex aspect-square flex-col rounded-2xl bg-[#A9A2A2] p-3">
                                        <div className="absolute top-0 left-0 h-full w-full rounded-2xl">
                                            <p className="absolute top-2 right-2 flex items-center gap-1 text-nowrap">
                                                <span className="bg-orangeClr rounded-full px-2 py-1 text-[8px] font-medium tracking-wider text-white">
                                                    SUBSCRIBE
                                                </span>
                                                <span className="text-brownClr rounded-full bg-white px-2 py-1 text-[8px] font-medium tracking-wider">
                                                    <BadgePercent className="inline h-3 w-3" /> 5% OFF
                                                </span>
                                            </p>
                                        </div>
                                        <div className="flex flex-1 justify-center">
                                            <img src={english} className="w-20" alt="" />
                                        </div>
                                        <p className="flex flex-col leading-5">
                                            <span className="text-brownClr text-sm font-semibold">
                                                {cls.subject} – {cls.time}
                                            </span>
                                            <span className="text-brownClr text-xs">{cls.teacher}</span>
                                        </p>
                                    </div>
                                </SplideSlide>
                            ))}
                        </Splide>
                    </div> */}
                    <div className="mt-6">
                        <p className="mb-3 text-lg font-semibold">Today's Classes</p>

                        {/* Static Grid Instead of Splide */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                            {sortedTodayClasses.map((cls, i) => (
                                <div
                                    key={i}
                                    className={`relative flex flex-col justify-between gap-3 rounded-2xl p-3 transition-all duration-200 sm:p-4 ${
                                        i === 0
                                            ? 'bg-[#CBE1FF]' // highlighted first class
                                            : i === 2
                                              ? 'bg-[#AEE1D1]' // custom green
                                              : 'bg-[#A9A2A2]'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-brownClr text-base font-semibold">{cls.subject}</p>
                                        {cls.is_completed && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1 rounded-full bg-white px-2 py-[2px] text-[9px] font-medium text-gray-700 shadow-sm">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="text-orangeClr h-3 w-3"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M12 1v22M1 12h22" />
                                            </svg>
                                            5% OFF
                                        </span>
                                        <button className="to-orangeClr rounded-full bg-gradient-to-r from-orange-400 px-3 py-[2px] text-[9px] font-semibold text-white shadow">
                                            Subscribe Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="mt-3">
                        <ul className="flex gap-2 overflow-x-auto">
                            <li>
                                <Link
                                    href="/student/doubt"
                                    className="flex items-center gap-2 rounded-lg bg-[#DCD0FF] p-3 text-sm font-medium text-neutral-800"
                                >
                                    Post Doubt
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/student/homework"
                                    className="flex items-center gap-2 rounded-lg bg-[#FFE5C6] p-3 text-sm font-medium text-neutral-800"
                                >
                                    <BookOpenText className="h-5 w-5" /> Homework
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/student/assignment"
                                    className="flex items-center gap-2 rounded-lg bg-[#F8D5FF] p-3 text-sm font-medium text-neutral-800"
                                >
                                    <NotebookPen className="h-5 w-5" /> Practice Sheet
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* My Batches */}
                    <div className="mt-6">
                        <p className="text-lg font-semibold text-neutral-800">My Batches</p>
                        <div className="mt-2 space-y-4 rounded-2xl border border-blue-400 p-4">
                            <div className="hidden grid-cols-5 text-sm text-gray-400 sm:grid">
                                <p>Course</p>
                                <p>Teacher</p>
                                <p>Joining Date</p>
                                <p>Expire on</p>
                            </div>
                            {batches.map((b, i) => (
                                <div key={i} className="grid grid-cols-3 items-center border-b border-gray-200 pb-4 sm:grid-cols-5">
                                    <p className="font-semibold">{b.course}</p>
                                    <p>{b.teacher}</p>
                                    <p className="hidden sm:block">{b.join_date}</p>
                                    <p>{b.expire_date}</p>
                                    <div className="flex justify-end">
                                        <Button className="rounded-full bg-blue-600 px-4 py-2 text-white">Extend</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
