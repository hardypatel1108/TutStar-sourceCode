import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link } from '@inertiajs/react';
import { Clock, CreditCard, Info, Layers, Lock, Users } from 'lucide-react';
import feature1png from '@/assets/images/home/feature/feature-1.png';
import feature2png from '@/assets/images/home/feature/feature-2.png';
import feature3png from '@/assets/images/home/feature/feature-3.png';
import feature4png from '@/assets/images/home/feature/feature-4.png';
import feature5png from '@/assets/images/home/feature/feature-5.png';
import feature6png from '@/assets/images/home/feature/feature-6.png';
import featureimg from '@/assets/images/home/feature/feature-img.png';

const features = [
    {
        id: 'feature1',
        title: 'Power of 10',
        subtitle: 'TutStar keeps only 10 students in a batch for true personal attention — not 100, not even 50, just 10. tuition.',
        img: feature1png,
    },
    {
        id: 'feature2',
        title: 'No Lock In',
        subtitle: 'Stay or leave next month, if not satisfied...Full Freedom, No Lock- ins',
        img: feature2png,
    },
    {
        id: 'feature3',
        title: '1 to 1 Interaction',
        subtitle: 'Real 2-way live classes where you can study, ask questions, and interact — just like a real classroom.',
        img: feature3png,
    },
    {
        id: 'feature4',
        title: 'Affordable Fees',
        subtitle: 'Learn without financial pressure — affordable pricing with no advance fees.',
        img: feature4png,
    },
    {
        id: 'feature5',
        title: 'Full Academic Support',
        subtitle: 'Regular tests, doubt support, and progress tracking to help you improve consistently.',
        img: feature5png,
    },
    {
        id: 'feature6',
        title: 'Flexible Timings',
        subtitle: 'Choose class timings that fit your schedule — especially after school hours.',
        img: feature6png,
    },
];

export default function Features() {
    return (
        <section className="relative overflow-hidden bg-white px-4 pb-20 pt-16 sm:px-6 md:px-10 lg:px-20">
            {/* Background Decorative Elements */}
            {/* <div className="absolute left-10 top-20 opacity-20">
                <img src={feature1svg} alt="decoration" className="h-10 w-10 animate-pulse" />
            </div>
            <div className="absolute right-20 top-40 opacity-20">
                <img src={feature2svg} alt="decoration" className="h-12 w-12 animate-bounce" />
            </div>
            <div className="absolute bottom-40 right-10 opacity-20">
                <img src={feature3svg} alt="decoration" className="h-8 w-8 animate-spin-slow" />
            </div> */}

            <div className="container relative mx-auto">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1a1a1a] sm:text-4xl md:text-5xl lg:text-6xl">
                        Features that make <br className="hidden sm:block" />
                        us <span className="text-[#FF972F]">Unique</span>
                    </h2>
                    <p className="mx-auto mb-8 max-w-2xl text-base text-neutral-600 md:text-lg">
                        Built with everything students and parents truly needed
                    </p>
                    <div className="flex justify-center">
                        <Button
                            className="h-12 rounded-lg border border-[#444444] px-8 text-lg font-medium text-[#6C3CF0] bg-white hover:bg-[#6C3CF0] hover:text-white"
                        >
                            Read All
                        </Button>
                    </div>
                    {/* Student Graphic (Decorative) */}
                    <div className="absolute -left-10 top-0 z-0 hidden lg:block">
                        <div className="relative h-[400px] w-[400px]">
                            {/* Orange Blob Background */}
                            <div className="absolute inset-0 rounded-full bg-[#FFD6A5] opacity-60 blur-3xl" />
                            <div className="absolute left-10 top-10 h-80 w-80 rounded-full bg-[#FFB347] opacity-40 blur-2xl" />
                            <img
                                src={featureimg}
                                alt="student"
                                className="relative z-10 h-full w-full object-contain"
                            />
                            {/* Floating Icons around student */}
                        </div>
                    </div>

                </div>

                <div className="relative">
                    
                    {/* Feature Grid */}
                    <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f) => (
                            <div
                                key={f.id}
                                className="group flex flex-col overflow-hidden rounded-[2rem] border-2 border-[#B68CFF] bg-white transition-all duration-300 hover:shadow-xl hover:shadow-[#6C3CF0]/10"
                            >
                                {/* Top Image Area */}
                                <div className="flex items-center justify-center bg-[#F3F4F6] overflow-hidden">
                                    <img
                                        src={f.img}
                                        alt={f.title}
                                        className="h-auto w-full object-contain transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>

                                {/* Bottom Content Area */}
                                <div className="flex flex-1 flex-col p-6">
                                    <h3 className="mb-3 text-2xl font-bold text-[#6C3CF0]">
                                        {f.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-neutral-500 line-clamp-3">
                                        {f.subtitle}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
