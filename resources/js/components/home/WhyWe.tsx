import shape from '@/assets/svgs/home/how-it-works/how-it-work-shape.svg';
import img1 from '@/assets/svgs/home/why-choose-us/why-choose-us-text-img1.svg';
import img2 from '@/assets/svgs/home/why-choose-us/why-choose-us-text-img2.svg';
export default function WhyWe() {
    return (
        <section className="relative w-full overflow-hidden bg-white py-10 sm:py-14 md:py-20">
            {/* Background Shapes (only visible on md+) */}
            <img src={shape} className="absolute top-0 -left-40 hidden rotate-90 opacity-70 md:block" alt="" />
            <img src={shape} className="absolute right-0 bottom-0 hidden rotate-90 opacity-70 md:block" alt="" />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-20">
                {/* Heading */}
                <div className="mb-6 flex items-center justify-center gap-2 sm:mb-8 md:mb-12">
                    <img src={img1} alt="" className="h-6 sm:h-7 md:h-8" />

                    <h5 className="text-center text-2xl font-medium text-neutral-800 sm:text-3xl md:text-5xl">
                        Why <span className="text-orangeClr">choose</span> us?
                    </h5>

                    <div className="flex items-end">
                        <img src={img2} alt="" className="h-6 sm:h-7 md:h-8" />
                    </div>
                </div>

                {/* Scrollable Comparison Table */}
                <div className="hideScrollbar overflow-x-auto">
                    <div className="grid w-full min-w-[900px] grid-cols-4 border border-gray-300 sm:min-w-[1000px] md:min-w-[1100px]">
                        {/* Column 1 — Features */}
                        <div className="border-r border-gray-300 bg-white">
                            <p className="flex h-14 items-center justify-center border-b border-gray-300 text-base font-semibold sm:text-lg">
                                Features
                            </p>

                            {[
                                'Class size',
                                'Interaction/Doubts',
                                'Fees',
                                'Course Flexibility',
                                'Class Timings',
                                'Expertise',
                                'Teacher Availability',
                                'Doubt Support',
                                'Safety & Comfort',
                                'Independency',
                            ].map((item, i) => (
                                <p
                                    key={i}
                                    className="flex h-14 items-center border-b border-gray-300 ps-4 text-sm text-neutral-700 last:border-b-0 sm:text-base"
                                >
                                    {item}
                                </p>
                            ))}
                        </div>

                        {/* Column 2 — Big EdTechs */}
                        <div className="border-r border-gray-300 bg-gray-100">
                            <p className="flex h-14 items-center justify-center border-b border-gray-300 text-base font-semibold sm:text-lg">
                                Big EdTechs
                            </p>

                            {[
                                'Huge (Above 500 always)',
                                'Streaming (1-way) Chat based',
                                'Expensive (10k–50k)',
                                'Full year lock-in package',
                                "Fixed, can't change",
                                'Mixed, competitions',
                                'No',
                                'Chat-based only',
                                'Yes',
                                'No refunds',
                            ].map((text, i) => (
                                <p
                                    key={i}
                                    className="flex h-14 items-center justify-center border-b border-gray-300 text-sm text-neutral-700 last:border-b-0 sm:text-base"
                                >
                                    {text}
                                </p>
                            ))}
                        </div>

                        {/* Column 3 — Local Coachings */}
                        <div className="border-r border-gray-300 bg-gray-100">
                            <p className="flex h-14 items-center justify-center border-b border-gray-300 text-base font-semibold sm:text-lg">
                                Local Coachings
                            </p>

                            {[
                                'Medium (100–300)',
                                'Mixed, no chance',
                                'Varies, often high',
                                'Package only',
                                'Fixed, no changes',
                                'Local boards',
                                'Limited',
                                'After class',
                                'Often a concern',
                                'No, once enrolled',
                            ].map((text, i) => (
                                <p
                                    key={i}
                                    className="flex h-14 items-center justify-center border-b border-gray-300 text-sm text-neutral-700 last:border-b-0 sm:text-base"
                                >
                                    {text}
                                </p>
                            ))}
                        </div>

                        {/* Column 4 — TutStar */}
                        <div className="border-blueClr border-2 bg-white">
                            <p className="text-blueClr flex h-14 items-center justify-center border-b border-gray-300 text-center text-xl font-bold sm:text-3xl">
                                TutStar
                            </p>

                            {[
                                'Only 10 students (Power of 10)',
                                'Direct interaction (1-on-1)',
                                'Fully affordable (Max 1500 Rs)',
                                'No lock-in, join anytime',
                                'Highly customizable',
                                'Expert CBSE & State board teachers',
                                'Accessible teachers',
                                'During & after class support',
                                'Home safety guaranteed',
                                'Pay-as-you-go',
                            ].map((text, i) => (
                                <div
                                    key={i}
                                    className="flex h-14 items-center border-b border-gray-300 px-2 text-sm text-neutral-700 last:border-b-0 sm:text-base"
                                >
                                    <p className="flex items-start gap-1">
                                        <i className="fa-solid fa-check text-blueClr pt-1"></i>
                                        <span>{text}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
        // <section className="relative container mx-auto py-12 px-20">
        //     {/* Background shapes */}
        //     <img src={shape} className="absolute top-0 -left-52 hidden rotate-[90deg] opacity-70 md:block" alt="" />
        //     <img src={shape} className="absolute right-0 bottom-0 hidden rotate-[90deg] opacity-70 md:block" alt="" />

        //     <div className="customContainer relative z-10 py-12 sm:py-16 md:py-18 lg:py-20">
        //         {/* Section Heading */}
        //         <div className="mb-10 flex justify-center gap-2">
        //             <img src={img1} alt="" className="h-8" />
        //             <h5 className="text-center text-3xl font-medium text-neutral-800 md:text-5xl">
        //                 Why <span className="text-orangeClr">choose</span> us?
        //             </h5>
        //             <div className="flex items-end">
        //                 <img src={img2} alt="" className="h-8" />
        //             </div>
        //         </div>

        //         {/* Comparison Table */}
        //         <div className="hideScrollbar overflow-auto">
        //             <div className="grid w-full min-w-[1000px] grid-cols-4 border border-gray-300">
        //                 {/* Column 1 — Features */}
        //                 <div className="border-r border-gray-300 bg-white">
        //                     <p className="flex h-[60px] items-center justify-center border-b border-gray-300 text-lg font-semibold">Features</p>
        //                     {[
        //                         'Class size',
        //                         'Interaction/Doubts',
        //                         'Fees',
        //                         'Course Flexibility',
        //                         'Class Timings',
        //                         'Expertise',
        //                         'Teacher Availability',
        //                         'Doubt Support',
        //                         'Safety & Comfort',
        //                         'Independency',
        //                     ].map((item, i) => (
        //                         <p key={i} className="flex h-[56px] items-center border-b border-gray-300 ps-4 text-neutral-700 last:border-b-0">
        //                             {item}
        //                         </p>
        //                     ))}
        //                 </div>

        //                 {/* Column 2 — Big EdTechs */}
        //                 <div className="border-r border-gray-300 bg-gray-100">
        //                     <p className="flex h-[60px] items-center justify-center border-b border-gray-300 text-lg font-semibold">Big EdTechs</p>
        //                     {[
        //                         'Huge (Above 500 always)',
        //                         'Streaming (1 way) Chat based',
        //                         'Expensive (10k to 50k)',
        //                         'Full year Lock - in package',
        //                         "Fixed, can't change",
        //                         'Mixed, competitions',
        //                         'No',
        //                         'Chat based only',
        //                         'Yes',
        //                         'No Refunds',
        //                     ].map((text, i) => (
        //                         <p
        //                             key={i}
        //                             className="flex h-[56px] items-center justify-center border-b border-gray-300 text-neutral-700 last:border-b-0"
        //                         >
        //                             {text}
        //                         </p>
        //                     ))}
        //                 </div>

        //                 {/* Column 3 — Local Coachings */}
        //                 <div className="border-r border-gray-300 bg-gray-100">
        //                     <p className="flex h-[60px] items-center justify-center border-b border-gray-300 text-lg font-semibold">
        //                         Local Coachings
        //                     </p>
        //                     {[
        //                         'Medium (100-300)',
        //                         'Mixed, no chance at all',
        //                         'Varies, often high',
        //                         'Package Only',
        //                         'Fixed, No chances',
        //                         'Local boards',
        //                         'Limited',
        //                         'After class (all time)',
        //                         'Often a concern',
        //                         'No, once enrolled',
        //                     ].map((text, i) => (
        //                         <p
        //                             key={i}
        //                             className="flex h-[56px] items-center justify-center border-b border-gray-300 text-neutral-700 last:border-b-0"
        //                         >
        //                             {text}
        //                         </p>
        //                     ))}
        //                 </div>

        //                 {/* Column 4 — TutStar */}
        //                 <div className="border-blueClr border-2 bg-white">
        //                     <p className="text-blueClr flex h-[60px] items-center justify-center border-b border-gray-300 text-center text-3xl font-bold">
        //                         TutStar
        //                     </p>
        //                     {[
        //                         'Only 10 students (Power of 10)',
        //                         'Direct interaction Real time (1 on 1)',
        //                         'Fully Affordable Max - 1500 Rs',
        //                         'No Lock in join-leave anytime',
        //                         'Highly Customizable',
        //                         'Expertise of CBSE and State boards',
        //                         'Student may connect',
        //                         '2 Ways during and after class',
        //                         'Yes, full home safety',
        //                         'Leave anytime pay as you go',
        //                     ].map((text, i) => (
        //                         <div key={i} className="flex h-[56px] items-center border-b border-gray-300 px-2 text-neutral-700 last:border-b-0">
        //                             <p className="flex items-start gap-1">
        //                                 <i className="fa-solid fa-check text-blueClr pt-1"></i>
        //                                 <span>{text}</span>
        //                             </p>
        //                         </div>
        //                     ))}
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </section>
    );
}
