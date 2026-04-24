import avatar1 from '@/assets/images/home/how-it-works/avatar1.png';
import avatar2 from '@/assets/images/home/how-it-works/avatar2.png';
import worksimg from '@/assets/images/home/how-it-works/how-it-works-img.png';
import worksimg2 from '@/assets/images/home/how-it-works/how-it-works-img2.jpg';
import airplane from '@/assets/svgs/home/how-it-works/airplane.svg';
import circle from '@/assets/svgs/home/how-it-works/how-it-works-circle.svg';
import widget from '@/assets/svgs/home/how-it-works/how-it-work-widget.svg';

export default function HowWeWork() {
    return (
        <section className="w-full bg-white py-10 sm:py-14 md:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-20">

                {/* Title */}
                <div className="mb-8 flex items-center gap-3 sm:gap-4 md:mb-12">
                    <h4 className="text-2xl font-medium leading-none text-neutral-800 sm:text-3xl md:text-5xl">
                        How its <span className="text-[#FF972F]">works ?</span>
                    </h4>
                    <img src={airplane} alt="airplane" className="mt-2 h-14 sm:h-16 md:h-20" />
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10 lg:gap-12">

                    {/* Left Image Block */}
                    <div className="relative overflow-hidden rounded-2xl md:col-span-1">
                        <img src={worksimg} alt="how-it-works" className="h-64 w-full object-cover sm:h-80 md:h-full" />

                        {/* Bottom Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-6 rounded-xl border border-[#C8C8C8] bg-white/90 p-3 sm:gap-8 sm:p-4">
                            {/* Avatars */}
                            <div className="relative">
                                <img src={avatar1} alt="avatar1" className="h-10 sm:h-auto" />
                                <img src={avatar2} alt="avatar2" className="absolute left-4 top-1 h-10 sm:left-5 sm:top-2 sm:h-auto" />
                            </div>
                            {/* Text */}
                            <p className="leading-5 text-neutral-800">
                                <span className="text-lg font-semibold">1000+</span>
                                <span className="block text-sm">Happy Students</span>
                            </p>
                        </div>
                    </div>

                    {/* Right Text Block */}
                    <div className="md:col-span-2">
                        {/* Floating image + badge */}
                        <div className="relative flex justify-end">
                            <div className="relative">
                                <div className="absolute -left-6 top-8 h-28 w-28 rounded-full bg-[#C9B5FF] opacity-60 blur-[18px]" />
                                <img
                                    src={worksimg2}
                                    alt="how-it-works-2"
                                    className="z-10 h-24 w-24 rounded-3xl object-cover shadow-[0_12px_24px_rgba(103,61,230,0.25)] sm:h-32 sm:w-32 md:h-40 md:w-40"
                                />
                                <img
                                    src={circle}
                                    alt="trusted badge"
                                    className="absolute -left-4 bottom-0 z-20 h-16 w-16 sm:h-20 sm:w-20"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="mt-8 sm:mt-10">
                            <p className="mb-2 text-sm font-semibold text-[#7C4DFF] sm:text-base md:text-lg">
                                Real Teachers&nbsp;&nbsp; Real Support&nbsp;&nbsp; Real Growth
                            </p>

                            <p className="text-sm leading-6 text-neutral-800 sm:text-base md:leading-7">
                                At TutStar, we believe learning works best when it's simple and structured. Our teachers focus on explaining
                                concepts clearly, solving doubts instantly, and giving practical assignments that build confidence step by
                                step. With the right support, every student can achieve real growth.
                            </p>

                            <div className="mt-6 flex justify-start">
                                <img src={widget} alt="signup subscribe join class" className="h-auto w-full max-w-[620px]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
