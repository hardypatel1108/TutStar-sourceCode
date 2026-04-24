import female from '@/assets/images/home/testimonial/female.jpeg';
import male from '@/assets/images/home/testimonial/male.png';
import shape from '@/assets/svgs/home/testimonial/testimonial-shape.svg';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

export default function Testimonial() {
    const options = {
        type: 'loop',
        perPage: 2,
        gap: '1rem',
        arrows: false,
        pagination: false,
        autoplay: true,
        interval: 3000,
        pauseOnHover: false,
        drag: true,
        breakpoints: {
            1024: { perPage: 1.25 },
            768: { perPage: 2 },
            640: { perPage: 1, gap: '0.5rem' },
            480: { perPage: 1 },
            0: { perPage: 1 },
        },
    };

    const testimonials = [
        {
            name: 'Shivam',
            class: 'Class 9',
            image: male,
            review: 'TutStar’s small batches make every class interactive. Teachers clear all doubts patiently, and I feel more confident in exams now.',
        },
        {
            name: 'Saqlain Ahmad',
            class: 'Class 10',
            image: male,
            review: 'I love the Post Your Doubt feature! Even after class, I can ask questions and get help. No other platform offers this.',
        },
        {
            name: 'Saurabh Patel',
            class: 'Class 12',
            image: male,
            review: 'The regular tests and assignments keep me disciplined. My marks have improved a lot since I joined TutStar.',
        },
        {
            name: 'Alangkrita',
            class: 'Class 12',
            image: female,
            review: 'Affordable fees with such great teachers and personal attention—TutStar is the best decision for my studies.',
        },
        {
            name: 'Khushi',
            class: 'Class 8',
            image: female,
            review: 'I used to miss concepts in school, but here the 1-to-1 interaction in small groups helps me understand everything clearly.',
        },
    ];

    return (
      <section className="w-full bg-white py-10 sm:py-14 md:py-20 overflow-hidden">
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-20">

        <div className="grid gap-10 md:grid-cols-2 md:gap-12">

            {/* LEFT SECTION */}
            <div className="space-y-3">
                <p className="text-sm sm:text-base md:text-lg text-neutral-800">
                    Testimonies from our users
                </p>

                <h2 className="text-2xl sm:text-3xl md:text-5xl font-medium leading-tight text-neutral-800 break-words">
                    See what our lovely <span className="text-orangeClr">Students</span> say about us
                </h2>

                <p className="max-w-sm text-sm sm:text-base md:text-lg text-neutral-700 leading-6">
                    Their words reflect our impact & prove every step is built on Trust.
                    Some real voices of students' journey with{' '}
                    <span className="font-medium text-blueClr">TutStar</span>.
                </p>
            </div>

            {/* RIGHT SECTION / CAROUSEL */}
            <div className="relative w-full overflow-hidden">

                {/* SHAPE (now safely contained) */}
                <img
                    src={shape}
                    alt=""
                    className="absolute top-1/2 left-1/2 h-[140%] w-[140%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none overflow-hidden"
                />

                <div className="splide relative w-full overflow-hidden">
                    <Splide options={options}>
                        {testimonials.map((item, i) => (
                            <SplideSlide key={i}>
                                <div className="
                                    rounded-2xl border border-blueClr bg-white p-4 shadow-md 
                                    hover:shadow-lg transition-all duration-300
                                    min-h-[240px] sm:min-h-[260px] md:min-h-[300px]
                                    flex flex-col justify-start
                                ">
                                    
                                    {/* Avatar */}
                                    <div className="mx-auto h-20 w-20 overflow-hidden rounded-full">
                                        <img
                                            src={item.image}
                                            className="h-full w-full object-cover"
                                            alt={item.name}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="mt-3 text-center">
                                        <p className="font-bold text-sm sm:text-base md:text-lg">
                                            {item.name}, {item.class}
                                        </p>

                                        <p className="text-xs sm:text-sm mb-1">⭐⭐⭐⭐⭐</p>

                                        <p className="mt-2 text-xs sm:text-sm leading-5 text-gray-700 break-words">
                                            “{item.review}”
                                        </p>
                                    </div>
                                </div>
                            </SplideSlide>
                        ))}
                    </Splide>
                </div>

            </div>
        </div>
    </div>
</section>
        // <section  className=" container mx-auto bg-white px-20 py-12">
        //   <div className="customContainer grid gap-8 overflow-hidden py-12 sm:py-16 md:grid-cols-2 md:py-18 lg:py-20">
        //     {/* Left Section */}
        //     <div className="space-y-2">
        //       <p className="md:text-lg">Testimonies from our users</p>
        //       <p className="text-3xl font-medium md:text-5xl">
        //         See what our lovely{" "}
        //         <span className="text-orangeClr">Students</span> say about us
        //       </p>
        //       <p className="max-w-sm md:text-lg">
        //         Their words reflect our impact & prove every step is built on
        //         Trust. Some real voices of students' journey with{" "}
        //         <span className="text-blueClr font-medium">TutStar</span>.
        //       </p>
        //     </div>

        //     {/* Right Section - Carousel */}
        //     <div className="relative w-full">
        //       <img
        //         src={shape}
        //         className="absolute left-[50%] top-[50%] h-[200%] w-full -translate-x-1/2 -translate-y-1/2"
        //         alt="background shape"
        //       />
        //       <div className="splide w-full">
        //         <Splide options={options}>
        //           {testimonials.map((item, i) => (
        //             <SplideSlide key={i}>
        //               <div className="border-blueClr h-full rounded-2xl border bg-white p-4 shadow-md hover:shadow-lg transition-all duration-300">
        //                 <div className="mx-auto h-20 w-20 overflow-hidden rounded-full">
        //                   <img
        //                     src={item.image}
        //                     className="h-full w-full object-contain"
        //                     alt={item.name}
        //                   />
        //                 </div>
        //                 <div className="text-center mt-2">
        //                   <p className="font-bold">
        //                     {item.name}, {item.class}
        //                   </p>
        //                   <p className="text-xs mb-1">⭐⭐⭐⭐⭐</p>
        //                   <p className="mt-2 text-sm leading-5 text-gray-700">
        //                     “{item.review}”
        //                   </p>
        //                 </div>
        //               </div>
        //             </SplideSlide>
        //           ))}
        //         </Splide>
        //       </div>
        //     </div>
        //   </div>
        // </section>
    );
}
