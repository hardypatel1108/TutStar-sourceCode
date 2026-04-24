import hero_img from '@/assets/images/home/hero/hero-img.png';
import hero_left_shape from '@/assets/svgs/home/hero-left-shape.svg';
import hero_right_shape from '@/assets/svgs/home/hero-right-shape.svg';
import yellow_line from '@/assets/svgs/home/yellow-line.svg';

import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { CheckCircle, Star } from 'lucide-react';

export default function HeroSection() {
    return (
        <section
            className="relative overflow-hidden pt-20 pb-10 sm:pt-24 sm:pb-14 md:pt-28 md:pb-16"
            style={{
                background:
                    'linear-gradient(135deg, #ede8ff 0%, #d9d0ff 30%, #c4b5f5 60%, #b8aaf0 100%)',
            }}
        >
            {/* Decorative left shape */}
            <img
                src={hero_left_shape}
                alt=""
                className="pointer-events-none absolute top-1/2 left-0 w-[70px] -translate-y-1/2 opacity-60 sm:w-[100px] md:w-[140px] lg:w-[180px]"
            />

            <div className="container mx-auto grid items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-6 lg:px-8">

                {/* ── LEFT ── */}
                <div className="flex flex-col justify-center text-center md:text-left">

                    {/* Desktop badge */}
                    <div
                        className="mb-5 hidden w-fit items-center rounded-full bg-white px-4 py-2 text-sm text-gray-600 shadow md:flex"
                        style={{ boxShadow: '0 0 6px #673DE6' }}
                    >
                        ONLINE LEARNING PLATFORM
                    </div>

                    {/* Heading — big-letter Figma style */}
                    <h1 className="text-[3.2rem] font-extrabold leading-tight text-[#673DE6] sm:text-[4rem] md:text-[4.5rem] lg:text-[5rem]">
                        {/* Line 1: big B + small "e the" */}
                        B<span className="text-xl font-semibold text-[#673DE6] sm:text-3xl md:text-4xl">e the</span>

                        <br />

                        {/* Line 2: big S + small "tar of" + dark "your Class" (yellow underline) */}
                        S<span className="text-xl font-semibold text-[#673DE6] sm:text-3xl md:text-4xl">
                            tar of{' '}
                            <span className="relative ml-1 inline-block text-gray-700">
                                your Class
                                <img
                                    src={yellow_line}
                                    alt=""
                                    className="absolute -bottom-1 left-0 w-full sm:-bottom-1.5"
                                />
                            </span>
                        </span>
                    </h1>

                    {/* Sub-headline */}
                    <p className="mt-3 text-lg font-semibold text-[#4a3580] sm:text-xl md:text-2xl">
                        With Real Learning
                    </p>

                    {/* Feature pills */}
                    <div className="mx-auto mt-5 max-w-xs space-y-3 md:mx-0 md:max-w-sm">
                        {['Real two way Live classes', 'Expert Teachers', 'Ultra small batch'].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#673DE6]">
                                    <CheckCircle className="h-5 w-5 fill-[#673DE6] text-white" />
                                </div>
                                <div className="flex-1 rounded-xl bg-[#FFECDA] px-4 py-2 text-left text-sm font-semibold text-[#673DE6] sm:text-base">
                                    {item}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Star rating line */}
                    <div className="mx-auto mt-4 max-w-xs px-1 md:mx-0 md:max-w-sm">
                        <div className="relative pl-7 text-sm font-medium leading-snug text-[#4a3580] sm:text-base">
                            <Star className="absolute top-0.5 left-0 h-5 w-5 fill-[#FFD700] text-[#FFD700]" />
                            The top choice platform for students seeking help after school.
                        </div>
                    </div>

                    {/* Mobile badge */}
                    <div className="mt-5 flex justify-center md:hidden">
                        <div
                            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm text-gray-600 shadow"
                            style={{ boxShadow: '0 0 5px #673DE6' }}
                        >
                            ONLINE LEARNING PLATFORM
                        </div>
                    </div>

                    {/* CTA button */}
                    <div className="mt-6 flex justify-center md:justify-start">
                        <Link href="/courses">
                            <Button className="rounded-full bg-[#673DE6] px-8 py-5 text-base font-bold text-white hover:bg-[#5432c4] sm:px-10 sm:py-6 sm:text-lg">
                                Start Learning
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* ── RIGHT ── */}
                <div className="relative flex items-center justify-center">
                    <div className="relative h-[260px] w-[260px] sm:h-[320px] sm:w-[320px] md:h-[400px] md:w-[400px]">
                        {/* Frame card */}
                        <div className="absolute inset-0 rounded-[2rem] border-2 border-[#C3C2C2] bg-gradient-to-r from-[#E1D8FF] via-[#E1D8FF]/50 to-[#F9F9F9]" />

                        {/* Hero image */}
                        <img
                            src={hero_img}
                            alt="TutStar student"
                            className="absolute bottom-0 left-0 z-10 h-[115%] w-full object-contain md:h-[120%]"
                        />
                    </div>

                    {/* Right decorative shape */}
                    <img
                        src={hero_right_shape}
                        alt=""
                        className="pointer-events-none absolute top-1/2 right-0 w-[180px] -translate-y-1/2 rotate-90 opacity-75 sm:w-[240px] md:w-[300px]"
                    />
                </div>
            </div>
        </section>
    );
}
