// resources/js/Pages/student/schedule.tsx

import StudentLayout from '@/layouts/studentLayout';
import { Head, Link } from '@inertiajs/react';
import { CircleCheckBig } from 'lucide-react';

export default function Schedule({ scheduleData, events }) {
    return (
        <StudentLayout>
            <Head title="Schedule" />

            <div className="flex flex-col gap-6 sm:px-4">
                {/* ================= CARD WRAPPER ================= */}
                <div className="rounded-2xl sm:bg-white/80 sm:p-4 sm:shadow md:p-6">
                    {/* ================= HEADER ================= */}
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-bold max-sm:hidden md:text-2xl">Schedule</h2>

                        {/* Desktop Notification Button */}
                        <Link
                            href="/notifications"
                            className="relative hidden rounded-lg border border-blue-600 px-3 py-1 text-sm text-blue-600 md:inline-block"
                        >
                            Notifications
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-500" />
                        </Link>

                        {/* Mobile Bell Icon */}
                        {/* <Link href="/notifications" className="relative md:hidden">
                            <Bell className="h-6 w-6 text-[#673DE6]" />
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-500" />
                        </Link> */}
                    </div>

                    {/* ================= TIME SCHEDULE ================= */}
                    {scheduleData.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-500 md:text-base">Time Schedule is not available</p>) : (
                        <div className="rounded-2xl bg-gradient-to-r from-[#95CBFF] to-[#D0B5FF] shadow">
                            <p className="px-4 py-1 text-base font-semibold md:text-lg">Time Schedule</p>
                            {/* <p className="px-4 py-3 text-base font-semibold md:text-lg">Time Schedule</p> */}

                            <div className="space-y-2 rounded-2xl bg-white p-3 md:p-4">
                                {/* ===== Desktop Header ===== */}
                                <div className="hidden grid-cols-4 gap-3 border-b pb-2 text-sm font-medium text-gray-600 md:grid">
                                    <span>Date</span>
                                    <span>Day</span>
                                    <span>Topic</span>
                                    <span>Time</span>
                                </div>

                                {/* ===== Rows ===== */}
                                {scheduleData.map((item, idx) => (
                                    <div key={idx} className="border-b py-3 last:border-0 md:hidden">
                                        <div className="grid grid-cols-3 items-center">
                                            {/* LEFT: Day + Check + Date */}
                                            <div className="flex flex-col justify-center items-center gap-0.5">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-medium">{item.classDay}</span>

                                                    {item.isPastOrCompleted && <CircleCheckBig className="h-4 w-4 text-green-500" />}
                                                </div>

                                                <span className="text-xs text-gray-500">{item.classDate}</span>
                                            </div>

                                            {/* CENTER: Topic */}
                                            <div className="text-center">
                                                <span className="text-sm font-medium text-gray-700">{item.topic || '-'}</span>
                                            </div>

                                            {/* RIGHT: Time */}
                                            <div className="text-right">
                                                <span className="text-sm font-medium">{item.classTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {scheduleData.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="hidden grid-cols-2 items-center gap-3 border-b py-2 last:border-0 md:grid md:grid-cols-4"
                                    >
                                        {/* Date (desktop only) */}
                                        <span className="hidden md:block">{item.classDate}</span>

                                        {/* Day */}
                                        <span className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
                                            <span className="font-medium">{item.classDay}</span>
                                            {item.isPastOrCompleted && <CircleCheckBig className="h-4 w-4 text-green-500" />}
                                            <span className="text-xs text-gray-500 md:hidden">{item.classDate}</span>
                                        </span>

                                        {/* Topic */}
                                        <span className="text-center text-sm md:text-left md:text-base">{item.topic || '-'}</span>

                                        {/* Time */}
                                        <span className="text-right text-sm md:text-left md:text-base">{item.classTime}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ================= EVENTS ================= */}
                   
                        <div className="mt-6">
                            <h3 className="mb-3 text-lg font-bold md:text-xl">New Events</h3>

                            {events.length === 0 ? (
                                <p className="py-6 text-center text-sm text-gray-500 md:text-base">No New Events</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {events.map((event, idx) => {
                                        return (
                                            <>
                                                <div key={`mobile-${idx}`} className="max-sm:hidden flex gap-3 rounded-2xl border bg-white p-3 shadow md:flex-col md:p-4">
                                                    <img
                                                        src={`/storage/${event.event_image}`}
                                                        className="h-20 w-20 rounded-lg object-cover md:h-40 md:w-full"
                                                    />

                                                    <div className="flex flex-col gap-1">
                                                        <p className="text text-red-500 md:text-sm">{event.uiTime}</p>
                                                        <p className="text-sm font-semibold md:text-base">{event.title}</p>
                                                        <p className="text-xs text-gray-600 md:text-sm">
                                                            {event.zoom_join_url ? 'Join via Zoom' : 'Online Event'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div key={`desktop-${idx}`} className="flex items-center gap-4 rounded-2xl sm:border sm:hidden sm:bg-white p-3 sm:shadow-sm">
                                                    {/* IMAGE */}
                                                    <div className="relative flex-shrink-0">
                                                        <img
                                                            src={`/storage/${event.event_image}`}
                                                            alt={event.title}
                                                            className="h-24 w-28 rounded-xl object-cover"
                                                        />

                                                        {/* Optional overlay text like PTM */}
                                                        {/* <span className="absolute top-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-bold text-white">
                                                            PTM
                                                        </span> */}
                                                    </div>

                                                    {/* CONTENT */}
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-xs font-medium text-red-500">{event.uiTime}</p>

                                                        <p className="text-sm leading-snug font-semibold">{event.title}</p>

                                                        <p className="text-xs text-gray-600">
                                                            {event.zoom_join_url ? 'Join Via Zoom' : 'Online Event'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                </div>
            </div>
        </StudentLayout>
    );
}
