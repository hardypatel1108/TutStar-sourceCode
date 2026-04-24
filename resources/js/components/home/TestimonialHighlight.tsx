import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const highlightCards = [
    {
        name: 'Jack Black',
        time: '12 Days ago',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
        text: 'TutStar changed the way I study. Small batches mean the teacher actually knows my weaknesses and helps me improve every session.',
    },
    {
        name: 'Leo S',
        time: '12 Days ago',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
        text: 'I love that I can ask doubts in real time during the class. No more waiting — the teacher answers immediately. Highly recommended!',
    },
    {
        name: 'Jack Black',
        time: '12 Days ago',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
        text: 'The no lock-in policy is the best. I tried one month and loved it. Affordable and genuinely effective for board exam prep.',
    },
    {
        name: 'Leo S',
        time: '12 Days ago',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
        text: 'My parents were skeptical about online classes but TutStar changed their mind. The feedback and transparency is unmatched.',
    },
];

export default function TestimonialHighlight() {
    return (
        <section className="relative w-full bg-white py-10 sm:py-14 md:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-20">
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">

                    {/* Left */}
                    <div className="min-w-0">
                        <p className="text-sm text-neutral-600">Testimonies from our users</p>
                        <h3 className="mt-2 text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl md:text-4xl">
                            Real Stories from
                            <br />
                            Real Students
                        </h3>
                        <p className="mt-3 text-sm text-neutral-700 sm:text-base">
                            Their words reflect our impact &amp; proves every step is built on Trust.
                        </p>
                        <p className="mt-2 text-sm text-neutral-700 sm:text-base">
                            Some Real Voices of student's journey with{' '}
                            <span className="text-[#5B3DF5]">TutStar.</span>
                        </p>
                    </div>

                    {/* Right carousel */}
                    <div className="relative min-w-0">
                        <div className="pointer-events-none absolute -right-10 top-10 h-40 w-40 rounded-full bg-[#F7C65F] opacity-30 blur-2xl" />
                        <Carousel
                            opts={{ align: 'start', loop: true }}
                            plugins={[
                                Autoplay({
                                    delay: 2200,
                                    stopOnInteraction: false,
                                    stopOnMouseEnter: true,
                                }),
                            ]}
                            className="w-full overflow-visible"
                        >
                            <CarouselContent className="-ml-6 overflow-visible">
                                {highlightCards.map((card, idx) => (
                                    <CarouselItem key={idx} className="basis-[78%] pl-6 sm:basis-[78%]">
                                        <div className="relative mx-auto w-full max-w-[400px] rounded-2xl border border-[#8C76FF] bg-white px-7 pb-4 pt-5 shadow-[0_12px_26px_rgba(103,61,230,0.16)]">
                                            <div className="flex flex-col items-center text-center">
                                                <img
                                                    src={card.image}
                                                    alt={card.name}
                                                    className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm"
                                                />
                                                <p className="text-sm font-semibold text-neutral-900">{card.name}</p>
                                                <div className="mt-1 flex items-center justify-center gap-0.5 text-[10px] text-[#F5B324]">
                                                    <i className="fa-solid fa-star" />
                                                    <i className="fa-solid fa-star" />
                                                    <i className="fa-solid fa-star" />
                                                    <i className="fa-solid fa-star" />
                                                    <i className="fa-solid fa-star" />
                                                </div>
                                            </div>
                                            <p className="mt-3 text-xs leading-relaxed text-neutral-700">{card.text}</p>
                                            <div className="mt-2 flex justify-end text-[10px] text-neutral-500">{card.time}</div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                    </div>
                </div>
            </div>
        </section>
    );
}
