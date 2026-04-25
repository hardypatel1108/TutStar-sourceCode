import ctaImg from '@/assets/images/home/cta/cta-img.png';
import { Link } from '@inertiajs/react';

export default function CTA() {
    return (
        <section className="w-full bg-white py-10 sm:py-14 md:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-20">
                <div
                    className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#ECE1FF] to-[#FFEADA] p-4 sm:p-6 md:p-8"
                    style={{ minHeight: '120px' }}
                >
                    {/* LEFT SIDE */}
                    <div className="flex flex-1 flex-col gap-2 sm:gap-3">
                        <p className="text-xl leading-snug text-[#000000] sm:text-2xl sm:font-medium md:text-5xl">
                            Get a call back <br className="hidden sm:block" /> to book your session
                        </p>

                        <Link
                            href="/courses"
                            className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-[#7A43F6] px-12 py-6 text-xl font-semibold leading-none text-white shadow-[0_6px_18px_rgba(122,67,246,0.25)] sm:px-16 sm:py-7"
                        >
                            <i className="fa-solid fa-phone -rotate-12 text-xl" />
                            Book Session
                        </Link>
                    </div>

                    {/* RIGHT SIDE IMAGE */}
                    <div className="flex justify-end">
                        <img
                            src={ctaImg}
                            alt="Book a session"
                            className="h-30 w-auto object-contain sm:h-40 md:h-80"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
