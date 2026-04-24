import english from '@/assets/svgs/subjects/english-icon.svg';
import { ClassCountdown } from '@/components/CountdownTimer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import StudentLayout from '@/layouts/studentLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlarmClock, BellRing, BookOpenText, Check, MessageCircleQuestionMark, Paperclip } from 'lucide-react';

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { subjectTextColors } from '@/lib/subject-colors';

function formatTodayShort(date: Date = new Date()): { day: number; suffix: string; month: string } {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    let suffix = 'th';
    if (day % 100 < 11 || day % 100 > 13) {
        switch (day % 10) {
            case 1:
                suffix = 'st';
                break;
            case 2:
                suffix = 'nd';
                break;
            case 3:
                suffix = 'rd';
                break;
        }
    }
    return { day, suffix, month };
}

export default function ClassesDetail() {
    const { todayClasses = [], nearbyClasses = [], batches = [], recommendedPlans = [] } = usePage().props as any;
    const initials = useInitials();
    const today = formatTodayShort();
    const page = usePage();
    const { auth } = page.props as any;

    const todayDisplayTiles = [
        ...todayClasses.map((cls: any) => ({ kind: 'class', ...cls })),
        ...recommendedPlans.map((plan: any) => ({ kind: 'plan', ...plan })),
    ];
    const isClassDone = (cls: any) => {
        if (!cls?.class_date) return false;
        const start = new Date(cls.class_date).getTime();
        if (Number.isNaN(start)) return false;
        return Date.now() > start + 45 * 60 * 1000;
    };

    return (
        <StudentLayout>
            <Head title="Classes" />
            <div className="mb-2 md:hidden">
                <Link href="/settings" className="flex items-center justify-between rounded-2xl border border-[#9EB9FF] bg-white p-3">
                    <div className="flex items-center gap-3">
                        {auth.user.profile_image ? (
                            <img
                                src={`/storage/${auth.user.profile_image}`}
                                alt="Profile"
                                className="h-14 w-12 rounded-md border object-cover"
                            />
                        ) : (
                            <Avatar className="h-14 w-12 overflow-hidden rounded-md border">
                                <AvatarFallback className="flex items-center justify-center rounded-md bg-neutral-200 text-2xl font-semibold text-black">
                                    {initials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <p className="flex flex-col">
                            <span className="text-lg font-bold leading-tight text-[#272727]">{auth.user.name}</span>
                            <span className="text-base font-medium text-[#676767]">Class {auth.user.student_profile?.class_id || '-'}</span>
                        </p>
                    </div>
                    <p className="pr-2 text-lg text-[#272727]">
                        <span className="font-bold">{today.day}</span>
                        <span className="font-normal">{today.suffix} </span>
                        <span className="font-bold">{today.month}</span>
                    </p>
                </Link>
            </div>

            <div className="flex flex-col gap-6 pb-4 sm:px-4">
                <div className="rounded-2xl pt-4 md:bg-white/80 md:p-6 md:shadow">
                    <div className="mb-6 hidden items-center justify-between md:flex">
                        <h2 className="text-xl font-bold md:text-2xl">My Classes</h2>

                        <Link href="/notifications" className="relative hidden rounded-lg border border-purple-600 px-3 py-1 text-sm text-purple-600 md:inline-block">
                            Notifications
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-500" />
                        </Link>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-r from-[#91ADFF] to-[#886AFF] shadow">
                        <p className="px-4 py-2 text-xl font-bold text-[#272727] md:text-lg md:font-semibold">Upcoming Classes</p>

                        <div className="space-y-3 rounded-2xl border border-[#C5D6FF] bg-white p-3 md:p-4">
                            {nearbyClasses.length === 0 && <p className="py-4 text-center text-sm text-gray-500 md:text-base">No classes scheduled today.</p>}

                            {nearbyClasses.map((c: any, i: number) => (
                                <div key={i}>
                                    <div className="rounded-xl md:bg-white md:p-3 md:shadow-sm">
                                        <div className="flex items-center justify-between md:hidden md:gap-3">
                                            <div>
                                                <p className="text-[17px] font-bold leading-tight text-[#272727]">
                                                    {c.subject?.name} - {c.formatted_date} Today
                                                </p>
                                                <p className="mt-0.5 text-base font-medium text-[#676767]">{c.teacher?.user?.name}</p>
                                                <div className="mt-0.5 flex items-center gap-1 text-base font-medium text-[#FF8A47]">
                                                    <AlarmClock className="h-5 w-5" />
                                                    <ClassCountdown classDate={c.class_date} />
                                                </div>
                                            </div>

                                            <a href={c.zoom_join_url} target="_blank" rel="noreferrer">
                                                <Button className="h-10 w-[98px] rounded-lg bg-[#FF8A47] text-base font-bold text-white hover:bg-[#ff7a30]">
                                                    Join
                                                </Button>
                                            </a>
                                        </div>

                                        <div className="hidden flex-row items-center justify-between gap-3 md:flex">
                                            <div>
                                                <p className="text-xs text-gray-400">From</p>
                                                <p className="font-semibold">{c.formatted_date} Today</p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">Course</p>
                                                <p className="font-semibold">{c.subject?.name}</p>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <p className="text-xs text-gray-400">Teacher</p>
                                                <p className="font-semibold">{c.teacher?.user?.name}</p>
                                                <ClassCountdown classDate={c.class_date} />

                                                <a href={c.zoom_join_url} target="_blank" rel="noreferrer">
                                                    <Button size="sm" className="mt-2 bg-orange-500 hover:bg-orange-400">
                                                        Join
                                                    </Button>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="mb-3 flex items-center gap-2 text-2xl font-bold text-[#272727] md:text-xl md:font-semibold">
                            <BellRing className="h-7 w-7 md:h-5 md:w-5" />
                            <span className="md:hidden">Today Classes</span>
                            <span className="hidden md:inline">Today's Classes</span>
                        </p>

                        {todayDisplayTiles.length === 0 ? (
                            <p className="text-sm text-gray-500 max-sm:mb-4">No classes or suggested plans available.</p>
                        ) : (
                            <>
                                <Carousel
                                    opts={{
                                        align: 'start',
                                        dragFree: true,
                                        loop: false,
                                    }}
                                    className="w-full sm:block md:hidden"
                                >
                                    <CarouselContent className="mb-6 -ml-4">
                                        {todayDisplayTiles.map((item: any, i: number) => (
                                            <CarouselItem key={`${item.kind}-${item.id ?? i}`} className="basis-auto pl-4">
                                                {item.kind === 'class' ? (() => {
                                                    const tileColors = subjectTextColors(item.subject?.color);
                                                    return (
                                                        <div
                                                            className="relative flex h-[198px] w-[185px] flex-col items-center justify-between rounded-2xl px-4 pt-3 pb-4"
                                                            style={{ backgroundColor: item.subject?.color ? `#${item.subject.color}` : '#CCE6FF' }}
                                                        >
                                                            {isClassDone(item) && (
                                                                <span className="absolute top-2 right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow">
                                                                    <Check className="h-3.5 w-3.5" />
                                                                </span>
                                                            )}
                                                            <img
                                                                src={item.subject?.icon ? `/storage/${item.subject.icon}` : english}
                                                                className="h-[120px] w-[120px] object-contain"
                                                            />
                                                            <div className="w-full">
                                                                <p className="text-base font-bold leading-tight" style={{ color: tileColors.primary }}>
                                                                    {item.subject?.name} - {item.formatted_time}
                                                                </p>
                                                                <p className="mt-1 text-xs font-medium" style={{ color: tileColors.secondary }}>
                                                                    {item.teacher?.user?.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })() : (() => {
                                                    const planBg = item.subjects?.[0]?.color ? `#${item.subjects[0].color}` : '#E5D6D6';
                                                    const tileColors = subjectTextColors(item.subjects?.[0]?.color ?? 'E5D6D6');
                                                    return (
                                                        <Link
                                                            href={item.checkout_url ?? '#'}
                                                            className="relative flex h-[200px] w-[185px] flex-col items-center justify-between overflow-hidden rounded-2xl px-4 pt-3 pb-4"
                                                            style={{ backgroundColor: planBg }}
                                                        >
                                                            <img
                                                                src={item.subjects?.[0]?.icon ? `/storage/${item.subjects[0].icon}` : english}
                                                                className="h-[120px] w-[120px] object-contain"
                                                            />
                                                            <div className="w-full">
                                                                <p className="text-base font-bold leading-tight" style={{ color: tileColors.primary }}>
                                                                    {item.subjects?.[0]?.name ?? item.title}
                                                                </p>
                                                                <p className="mt-1 text-xs font-medium" style={{ color: tileColors.secondary }}>
                                                                    Not Enrolled
                                                                </p>
                                                            </div>
                                                            {/* Dimming overlay */}
                                                            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[rgba(110,110,110,0.5)]" />
                                                            {/* Subscribe pill (above overlay) */}
                                                            <span
                                                                className="absolute top-2 right-2 z-10 rounded-lg px-3 py-1 text-[10px] font-bold text-white shadow"
                                                                style={{
                                                                    backgroundImage:
                                                                        'linear-gradient(155deg, rgb(255,214,111) 30%, rgb(255,118,76) 124%)',
                                                                }}
                                                            >
                                                                Subscribe
                                                            </span>
                                                            {/* Discount badge (above overlay) */}
                                                            {item.active_offer && (
                                                                <span className="absolute top-12 right-2 z-10 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#FF764C]">
                                                                    {item.active_offer.type === 'percentage'
                                                                        ? `${item.active_offer.value}% Off`
                                                                        : `INR ${item.active_offer.value} Off`}
                                                                </span>
                                                            )}
                                                        </Link>
                                                    );
                                                })()}
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                </Carousel>

                                <div className="hidden w-full grid-cols-1 gap-4 sm:hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {todayDisplayTiles.map((item: any, i: number) => (
                                        <div
                                            key={`${item.kind}-${item.id ?? i}`}
                                            className="relative flex items-center justify-between rounded-2xl p-4"
                                            style={{ backgroundColor: item.kind === 'class' && item.subject?.color ? `#${item.subject.color}` : '#EAF3FF' }}
                                        >
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={item.kind === 'class' && item.subject?.icon ? `/storage/${item.subject.icon}` : english}
                                                        className="p-0.2 h-13 w-13 rounded-full bg-white object-contain"
                                                    />

                                                    <div>
                                                        <p className="text-sm font-semibold text-[#1E3A8A]">
                                                            {item.kind === 'class' ? item.subject?.name : item.subjects?.[0]?.name ?? item.title}
                                                        </p>
                                                        <p className="text-xs text-[#1E3A8A]/80">{item.kind === 'class' ? item.teacher?.user?.name : 'Not Enrolled'}</p>
                                                    </div>
                                                </div>

                                            <div className="text-right">
                                                {item.kind === 'class' ? (
                                                    <>
                                                        {isClassDone(item) && (
                                                            <span className="absolute top-1 right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow">
                                                                <Check className="h-3.5 w-3.5" />
                                                            </span>
                                                        )}
                                                        <p className="text-xs font-medium text-[#1E3A8A]">{item.formatted_time}</p>
                                                    </>
                                                ) : (
                                                    item.active_offer && (
                                                        <span className="absolute top-2 right-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                                            {item.active_offer.type === 'percentage'
                                                                ? `${item.active_offer.value}% off`
                                                                : `INR ${item.active_offer.value} off`}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-0 md:hidden">
                        <Carousel
                            opts={{
                                align: 'start',
                                dragFree: true,
                                loop: false,
                            }}
                            className="hidden w-full max-sm:block"
                        >
                            <CarouselContent className="mb-6 -ml-4">
                                <CarouselItem className="basis-auto pl-4">
                                    <Link href={'/post-doubt'} className="flex h-[50px] items-center gap-2 rounded-lg bg-[#DCD0FF] px-4">
                                        <MessageCircleQuestionMark className="h-7 w-7 text-[#272727]" />
                                        <span className="text-sm font-bold text-[#272727]">Post Doubt</span>
                                    </Link>
                                </CarouselItem>
                                <CarouselItem className="basis-auto pl-4">
                                    <Link href={'/home-work'} className="flex h-[50px] items-center gap-2 rounded-lg bg-[#FFE5C6] px-4">
                                        <BookOpenText className="h-7 w-7 text-[#272727]" />
                                        <span className="text-sm font-bold text-[#272727]">Home Work</span>
                                    </Link>
                                </CarouselItem>
                                <CarouselItem className="basis-auto pl-4">
                                    <Link href={'/home-work'} className="flex h-[50px] items-center gap-2 rounded-lg bg-[#F8D5FF] px-4">
                                        <Paperclip className="h-6 w-6 text-[#272727]" />
                                        <span className="text-sm font-bold text-[#272727]">Assignment</span>
                                    </Link>
                                </CarouselItem>
                                <CarouselItem className="basis-auto pl-4">
                                    <Link href={'/practice-test'} className="flex h-[50px] items-center gap-2 rounded-lg bg-[#DEE9FF] px-4">
                                        <span className="text-sm font-bold text-[#272727]">Practice sheets</span>
                                    </Link>
                                </CarouselItem>
                            </CarouselContent>
                        </Carousel>
                    </div>

                    <div className="">
                        <p className="mb-3 text-2xl font-bold text-[#272727] md:text-lg md:font-semibold">My Batch</p>

                        <div className="overflow-hidden rounded-2xl border border-[#9BACF7] bg-white">
                            <div className="hidden grid-cols-[2fr_2fr_1fr] border-b px-4 py-3 text-sm font-medium text-gray-500 md:grid">
                                <span>Course</span>
                                <span>Expire On</span>
                                <span className="text-right">Action</span>
                            </div>

                            {batches.map((b: any, i: number) => (
                                <div key={i} className="grid grid-cols-[1fr_2fr_1fr] border-b p-3 last:border-0 md:items-center">
                                    <div>
                                        <p className="flex items-center text-[17px] font-bold text-[#272727] md:text-base">{b.course}</p>
                                        <p className="text-base font-medium text-[#676767] md:text-sm">{b.teacher}</p>
                                    </div>

                                    <div className="flex items-center justify-center text-xs font-medium text-[#676767]">
                                        <span className="md:hidden">Expire on {b.expire_date ?? '-'}</span>
                                        <span className="hidden md:inline">{b.expire_date ?? '-'}</span>
                                    </div>

                                    <div className="flex items-center justify-center">
                                        {b.plan_id ? (
                                            <Link
                                                href={`/checkout/${b.plan_id}`}
                                                className="inline-flex h-[28px] w-[94px] items-center justify-center rounded-lg bg-[#673DE6] text-xs font-bold text-white transition hover:bg-[#562ED4]"
                                            >
                                                Extend
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className="inline-flex h-[28px] w-[94px] cursor-not-allowed items-center justify-center rounded-lg bg-gray-400 text-xs font-bold text-white"
                                            >
                                                Extend
                                            </button>
                                        )}
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
