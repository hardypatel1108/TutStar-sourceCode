import visionBg from '@/assets/images/home/vision/vision-bg-img.png';
import visionImg1 from '@/assets/images/home/vision/vision-img1.png';

export default function Milestone() {
    return (
        <section className="w-full bg-white py-10 sm:py-14 md:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-20">
                {/* Title */}
                <p className="mb-6 text-center text-3xl font-semibold text-neutral-800 sm:text-4xl md:text-right md:text-5xl">
                    Milestones at a glance
                </p>

                {/* Main Container */}
                <div
                    className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[32px] bg-[#1A0B4A] shadow-2xl sm:min-h-[340px] md:min-h-[440px] md:flex-row"
                >
                    {/* Background texture */}
                    <div
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_0%_0%,rgba(99,59,255,0.45),transparent_60%),radial-gradient(900px_400px_at_100%_80%,rgba(64,36,173,0.55),transparent_60%)] opacity-90"
                    />
                    <div
                        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-60"
                        style={{ backgroundImage: `url(${visionBg})` }}
                    />

                    {/* LEFT IMAGE (Desktop/Tablet Only) */}
                    <div className="absolute bottom-0 left-0 z-10 hidden -ml-4 items-end pl-0 md:flex">
                        <img src={visionImg1} alt="TutStar vision" className="max-h-[350px] object-contain" />
                    </div>

                    {/* RIGHT TEXT BLOCK */}
                    <div className="relative z-10 flex w-full flex-col justify-center gap-7 p-4 pt-0 text-right text-white sm:gap-8 sm:p-6 sm:pt-0 md:ml-auto md:w-1/2 md:p-8 md:pt-0">
                        {/* FIRST BLOCK */}
                        <div>
                            <p className="text-xl font-semibold text-[#FFC566] sm:text-2xl">Broad Vision</p>
                            <p className="mb-6 mt-2 text-sm leading-6 text-white/90 sm:text-base">
                                We aim to create a learning environment with no pressure on students, focused on real growth, while supporting
                                parents with affordable fees -- all delivered through our powerful platform.
                            </p>
                        </div>

                        {/* SECOND BLOCK */}
                        <div>
                            <p className="text-xs font-medium tracking-wider text-white/70">VISION 02</p>
                            <p className="mt-1 text-xl font-semibold text-[#FFC566] sm:text-2xl">The Next Chapter</p>
                            <p className="mt-2 text-sm leading-6 text-white/90 sm:text-base">
                                We're taking TutStar beyond boundaries -- into every village, town, and city. Our journey continues with a
                                bold mission: reach every learner, no matter the location.
                            </p>
                            <div className="mt-4 flex justify-end">
                                <span className="inline-flex items-center rounded-full bg-[#FFB648] px-4 py-1 text-xs font-semibold text-[#2B1A00] shadow-sm">
                                    More
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
