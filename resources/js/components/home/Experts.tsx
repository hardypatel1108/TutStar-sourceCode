'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export default function Experts() {
    return (
        <section className="relative w-full bg-white py-10 sm:py-14 md:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-20">
                {/* Heading */}
                <p className="text-sm text-neutral-600 sm:text-base">Minds Behind TutStar</p>
                <h6 className="text-2xl font-medium text-neutral-900 sm:text-3xl md:text-5xl">
                    Our board <span className="text-orangeClr">Experts</span>
                </h6>

                {/* Carousel */}
                <div className="relative mt-8 sm:mt-10">
                    <Carousel
                        opts={{
                            align: 'start',
                            loop: true,
                        }}
                        plugins={[
                            Autoplay({
                                delay: 2500,
                                stopOnInteraction: true,
                            }),
                        ]}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {experts.map((expert, index) => (
                                <CarouselItem key={index} className="basis-full pl-2 sm:basis-1/2 sm:pl-3 md:basis-1/3 md:pl-4 lg:basis-1/4">
                                    {index === 1 ? (
                                        <div
                                            className="relative h-64 rounded-2xl p-5 text-white shadow-md sm:h-72 md:h-80"
                                            style={{
                                                background:
                                                    'linear-gradient(145deg, rgba(103,61,230,0.9) 0%, rgba(168,124,255,0.92) 60%, rgba(126,87,194,0.95) 100%)',
                                                transform: 'rotate(-2deg)',
                                            }}
                                        >
                                            <div className="absolute inset-0 rounded-2xl opacity-30" style={{ boxShadow: '0 20px 40px rgba(103,61,230,0.25)' }} />
                                            <div className="relative">
                                                <p className="text-sm font-semibold sm:text-base">{expert.name}</p>
                                                <p className="text-xs opacity-90 sm:text-sm">{expert.role}</p>
                                                <p className="mt-16 text-xs leading-relaxed opacity-90 sm:text-sm">{expert.bio}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative h-64 overflow-hidden rounded-2xl bg-white shadow-md sm:h-72 md:h-80">
                                            <img src={expert.image} alt={expert.name} className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* Navigation Buttons */}
                        <CarouselPrevious className="top-1/2 left-2 -translate-y-1/2 bg-white/80 shadow-md hover:bg-white sm:left-4" />
                        <CarouselNext className="top-1/2 right-2 -translate-y-1/2 bg-white/80 shadow-md hover:bg-white sm:right-4" />
                    </Carousel>
                </div>
            </div>
        </section>
        // <section className="relative container mx-auto bg-white px-20 py-12">
        //     <div className="customContainer pb-12 sm:pb-16 md:pb-18 lg:pb-20">
        //         <p className="text-lg text-neutral-800">Minds Behind TutStar</p>
        //         <h6 className="text-3xl font-medium text-neutral-800 md:text-5xl">
        //             Our board <span className="text-orangeClr">Experts</span>
        //         </h6>

        //         {/* Carousel Section */}
        //         <div className="relative mt-10">
        //             <Carousel
        //                 opts={{
        //                     align: 'start',
        //                     loop: true,
        //                 }}
        //                 plugins={[
        //                     Autoplay({
        //                         delay: 2500,
        //                         stopOnInteraction: true,
        //                     }),
        //                 ]}
        //                 className="w-full"
        //             >
        //                 <CarouselContent className="-ml-2 md:-ml-4">
        //                     {experts.map((expert, index) => (
        //                         <CarouselItem key={index} className="basis-full pl-2 sm:basis-1/2 md:basis-1/3 md:pl-4 lg:basis-1/3">
        //                             <div className="group relative h-100 overflow-hidden rounded-2xl shadow-md duration-300">
        //                                 <img
        //                                     src={expert.image}
        //                                     alt={expert.name}
        //                                     className="h-full w-full object-cover duration-300 group-hover:scale-105"
        //                                 />
        //                                 <div
        //                                     className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 duration-300 group-hover:opacity-100"
        //                                     style={{
        //                                         background:
        //                                             'linear-gradient(135deg, rgba(103,61,230,0.85) 0%, rgba(182,140,255,0.8) 50%, rgba(128,128,128,0.6) 100%)',
        //                                     }}
        //                                 >
        //                                     {' '}
        //                                     <div>
        //                                         <p className="text-xl font-semibold text-white">{expert.name}</p>
        //                                         <p className="text-lg font-light text-gray-200">{expert.role}</p>
        //                                     </div>
        //                                     <p className="text-sm text-gray-100">{expert.bio}</p>
        //                                 </div>
        //                             </div>
        //                         </CarouselItem>
        //                     ))}
        //                 </CarouselContent>
        //                 <CarouselPrevious className="left-0" />
        //                 <CarouselNext className="right-0" />
        //             </Carousel>
        //         </div>
        //     </div>
        // </section>
    );
}

const experts = [
    {
        name: 'Dr. Ananya Sharma',
        role: 'Physics Mentor',
        bio: '10+ years of experience guiding IIT aspirants with top AIR results.',
        image: 'https://t4.ftcdn.net/jpg/05/23/62/91/360_F_523629123_RpAModBJXgCTPfilfYaCIbPaalFIjbvv.jpg',
    },
    {
        name: 'Prof. Rahul Mehta',
        role: 'Math Expert',
        bio: 'Mathematics specialist known for simplifying complex JEE topics.',
        image: 'https://t4.ftcdn.net/jpg/05/23/62/91/360_F_523629123_RpAModBJXgCTPfilfYaCIbPaalFIjbvv.jpg',
    },
    {
        name: 'Dr. Neha Gupta',
        role: 'Chemistry Head',
        bio: 'Published researcher with a deep passion for organic chemistry.',
        image: 'https://t4.ftcdn.net/jpg/05/23/62/91/360_F_523629123_RpAModBJXgCTPfilfYaCIbPaalFIjbvv.jpg',
    },
    {
        name: 'Amit Kumar',
        role: 'AI & Coding Mentor',
        bio: 'Ex-Google developer, teaching practical coding to school students.',
        image: 'https://t4.ftcdn.net/jpg/05/23/62/91/360_F_523629123_RpAModBJXgCTPfilfYaCIbPaalFIjbvv.jpg',
    },
    {
        name: 'Ritika Verma',
        role: 'English Faculty',
        bio: 'Cambridge-certified trainer helping students ace spoken English.',
        image: 'https://t4.ftcdn.net/jpg/05/23/62/91/360_F_523629123_RpAModBJXgCTPfilfYaCIbPaalFIjbvv.jpg',
    },
];
