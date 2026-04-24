const featureRows = [
    { label: 'Class Size', icon: 'fa-users', big: 'Huge (Above 500 always)', local: 'Medium (100-300)' },
    { label: 'Interaction / Doubts', icon: 'fa-comments', big: 'Streaming (1-way) Chat based', local: 'Mixed, no chance to all' },
    { label: 'Fees', icon: 'fa-rupee-sign', big: 'Expensive (10k to 50k)', local: 'Varies, often high' },
    { label: 'Course Flexibility', icon: 'fa-book-open', big: 'Full Year Lock-in Packages', local: 'Packages Only' },
    { label: 'Class Timings', icon: 'fa-clock', big: "Fixed, can't change", local: 'Fixed, less chances' },
    { label: 'Expertise', icon: 'fa-graduation-cap', big: 'Mixed, Competitions', local: 'Local Boards' },
    { label: 'Teacher Availability', icon: 'fa-user-check', big: 'No', local: 'Limited' },
    { label: 'Doubt Support', icon: 'fa-headset', big: 'Chat based only', local: 'After class (if time)' },
    { label: 'Safety & Comfort', icon: 'fa-shield', big: 'Yes', local: 'Often a concern' },
    { label: 'Independency', icon: 'fa-hand', big: 'No Refunds', local: 'No, once enrolled' },
];

const tutStarItems = [
    { title: 'Only 10 Students', subtitle: '(Power of 10)' },
    { title: '2 - way interaction', subtitle: 'Real time (1 to 1)' },
    { title: 'Fully Affordable', subtitle: 'Max - 1500 Rs' },
    { title: 'No Lock In', subtitle: 'Join-Leave anytime' },
    { title: 'Highly', subtitle: 'Customizable' },
    { title: 'Expertise of CBSE', subtitle: '& STATE boards' },
    { title: 'Student may', subtitle: 'connect' },
    { title: '2 way', subtitle: 'During & After Class' },
    { title: 'Yes', subtitle: 'Full home safety' },
    { title: 'Leave anytime', subtitle: 'Pay as you go' },
];

export default function WhyChooseSection() {
    return (
        <section className="relative w-full bg-white py-10 sm:py-14 md:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-20">
                <div className="mb-8 text-center sm:mb-10 md:mb-12">
                    <h3 className="text-2xl font-semibold leading-tight text-[#4F3AC4] sm:text-3xl md:text-5xl">
                        Why Students &amp; Parents
                        <span className="block">
                            Choose <span className="text-[#5B3DF5]">TutStar</span>
                        </span>
                    </h3>
                    <p className="mt-2 text-sm text-neutral-600 sm:text-base">
                        We are not just another online class. We are a better learning experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 items-start lg:grid-cols-[1.4fr_0.8fr]">
                    {/* Comparison Table */}
                    <div className="rounded-2xl border border-[#E3DFFF] bg-white shadow-[0_16px_40px_rgba(103,61,230,0.12)]">
                        <div className="hideScrollbar overflow-x-auto">
                            <div className="min-w-[720px]">
                                {/* Header row */}
                                <div className="grid grid-cols-[1.1fr_1fr_1fr]">
                                    <div className="rounded-tl-2xl border-b border-[#E6E1F7] bg-white">
                                        <p className="flex h-12 items-center justify-center text-sm font-semibold text-neutral-700 sm:h-14 sm:text-base">
                                            Features
                                        </p>
                                    </div>
                                    <div className="border-b border-l border-[#E6E1F7] bg-[#F4F2FF]">
                                        <p className="flex h-12 flex-col items-center justify-center text-center text-xs font-semibold text-neutral-700 sm:h-14 sm:text-sm">
                                            Big Edtechs
                                            <span className="text-[11px] font-normal text-neutral-500">(Large Platforms)</span>
                                        </p>
                                    </div>
                                    <div className="rounded-tr-2xl border-b border-l border-[#E6E1F7] bg-[#F4F2FF]">
                                        <p className="flex h-12 flex-col items-center justify-center text-center text-xs font-semibold text-neutral-700 sm:h-14 sm:text-sm">
                                            Local Coachings
                                            <span className="text-[11px] font-normal text-neutral-500">(Offline/Small)</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Data rows */}
                                {featureRows.map((row, idx) => (
                                    <div key={idx} className="grid grid-cols-[1.1fr_1fr_1fr] border-t border-[#E6E1F7]">
                                        <div className="flex items-center gap-3 px-4 py-3 sm:py-4">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ECE8FF] text-[#6B55E9]">
                                                <i className={`fa-solid ${row.icon} text-sm`} />
                                            </span>
                                            <span className="text-sm font-medium text-neutral-700 sm:text-base">{row.label}</span>
                                        </div>
                                        <div className="flex items-center justify-center border-l border-[#E6E1F7] bg-[#F7F6FF] px-3 py-3 text-center text-sm text-neutral-600 sm:text-base">
                                            {row.big}
                                        </div>
                                        <div
                                            className={`flex items-center justify-center border-l border-[#E6E1F7] bg-[#F7F6FF] px-3 py-3 text-center text-sm text-neutral-600 sm:text-base ${
                                                idx === featureRows.length - 1 ? 'rounded-br-2xl' : ''
                                            }`}
                                        >
                                            {row.local}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* TutStar Card */}
                    <div className="relative -top-8">
                        <div className="absolute -top-4 right-6 z-20 flex items-center gap-2 rounded-full border border-[#CBBEFF] bg-[#EEE8FF] px-3 py-1 text-xs font-semibold text-[#6B4DE6] shadow-sm sm:text-sm">
                            <i className="fa-solid fa-star text-[#F4B24D]" />
                            Most Preferred Choice
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-red-500 shadow">
                                &gt;
                            </span>
                        </div>

                        <div className="rounded-2xl border-2 border-[#7B61FF] bg-[#FAF8FF] shadow-[0_20px_45px_rgba(103,61,230,0.25)]">
                            <div className="px-6 pb-4 pt-8 text-center">
                                <h4 className="text-2xl font-bold text-[#5B3DF5] sm:text-3xl">TutStar</h4>
                                <p className="text-xs text-neutral-500 sm:text-sm">Built for Real Learning</p>
                            </div>

                            <div className="divide-y divide-[#E6E1F7] px-4 pb-6">
                                {tutStarItems.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 py-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#35C759] text-white">
                                            <i className="fa-solid fa-check text-xs" />
                                        </span>
                                        <div className="text-sm text-neutral-700 sm:text-base">
                                            <span className="font-semibold">{item.title}</span>
                                            <span className="block text-xs text-neutral-500 sm:text-sm">{item.subtitle}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
