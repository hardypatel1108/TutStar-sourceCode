import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import testimonial1 from '@/assets/images/testimonial/testimonial1.png';
import testimonial2 from '@/assets/images/testimonial/testimonial2.png';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Jack Black',
        location: 'Noida',
        time: '12 Days ago',
        image: testimonial1,
        text: 'TutStar changed the way I study. Small batches mean the teacher actually knows my weaknesses and helps me improve every session.',
    },
    {
        name: 'Leo S',
        location: 'Pune',
        time: '12 Days ago',
        image: testimonial2,
        text: 'I love that I can ask doubts in real time during the class. No more waiting — the teacher answers immediately. Highly recommended!',
    },
    {
        name: 'Jack Black',
        location: 'Delhi',
        time: '12 Days ago',
        image: testimonial1,
        text: 'The no lock-in policy is the best. I tried one month and loved it. Affordable and genuinely effective for board exam prep.',
    },
    {
        name: 'Leo S',
        location: 'Mumbai',
        time: '12 Days ago',
        image: testimonial2,
        text: 'My parents were skeptical about online classes but TutStar changed their mind. The feedback and transparency is unmatched.',
    },
];

export default function TestimonialHighlight() {
    return (
        <section className="relative w-full bg-white py-12 md:py-24 font-sans overflow-hidden">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    
                    {/* Left Column - Heading */}
                    <div className="max-w-[500px]">
                        <p className="text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wide">Testimonies from our users</p>
                        <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.1] mb-6">
                            <span className="text-[#6C3CF0]">Real Stories</span>
                            <br />
                            <span className="text-[#1a1a1a]">from TutStar Students</span>
                        </h2>
                        <p className="text-lg text-neutral-600">
                            Their words reflect our impact and the <span className="text-[#FF8A00] font-bold">trust we build</span> every day.
                        </p>
                    </div>

                    {/* Right Column - Carousel with Glow */}
                    <div className="relative">
                        {/* Glow Effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#FF8A00] opacity-20 blur-[80px] rounded-full pointer-events-none" />
                        
                        <Carousel
                            opts={{ align: 'start', loop: true }}
                            plugins={[
                                Autoplay({
                                    delay: 3000,
                                    stopOnInteraction: false,
                                    stopOnMouseEnter: true,
                                }),
                            ]}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4">
                                {testimonials.map((t, idx) => (
                                    <CarouselItem key={idx} className="basis-[100%] pl-4 sm:basis-[80%] lg:basis-[100%] xl:basis-[85%]">
                                        <div className="mx-auto w-full max-w-[420px] rounded-[32px] border-2 border-[#8C76FF]/30 bg-white p-8 shadow-[0_12px_40px_rgba(108,60,240,0.08)] transition-all hover:border-[#8C76FF]/60">
                                            <div className="flex flex-col items-center text-center">
                                                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-[#F3EFFF] shadow-md mb-4">
                                                    <img
                                                        src={t.image}
                                                        alt={t.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <h3 className="text-lg font-bold text-[#1a1a1a]">{t.name}, {t.location}</h3>
                                                <div className="mt-2 flex items-center justify-center gap-1 text-[#FFB800]">
                                                    <Star className="h-4 w-4 fill-current" />
                                                    <Star className="h-4 w-4 fill-current" />
                                                    <Star className="h-4 w-4 fill-current" />
                                                    <Star className="h-4 w-4 fill-current" />
                                                    <Star className="h-4 w-4 fill-current" />
                                                </div>
                                            </div>
                                            
                                            <p className="mt-6 text-sm leading-relaxed text-neutral-600 text-left">
                                                {t.text.substring(0, 120)}... <span className="text-[#6C3CF0] font-bold cursor-pointer hover:underline">More</span>
                                            </p>
                                            
                                            <div className="mt-6 flex justify-end">
                                                <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-tighter italic">
                                                    {t.time}
                                                </span>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>

                        {/* Pagination indicator (Visual only for now) */}
                        <div className="flex justify-center gap-2 mt-10">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]/40" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]/10" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]/10" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]/10" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
