import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link } from '@inertiajs/react';
import { Clock, CreditCard, Info, Layers, Lock, Users } from 'lucide-react';
import feature1png from '@/assets/images/home/feature/feature-1.png';
import feature2png from '@/assets/images/home/feature/feature-2.png';
import feature3png from '@/assets/images/home/feature/feature-3.jpg';
import feature4png from '@/assets/images/home/feature/feature-4.jpg';
import feature5png from '@/assets/images/home/feature/feature-5.jpg';
import feature6png from '@/assets/images/home/feature/feature-6.jpg';
import featureimg from '@/assets/images/home/feature/feature-img.png';
import feature1svg from '@/assets/svgs/home/feature/feature-1.svg';
import feature2svg from '@/assets/svgs/home/feature/feature-2.svg';
import feature3svg from '@/assets/svgs/home/feature/feature-3.svg';
import feature4svg from '@/assets/svgs/home/feature/feature-4.svg';
import feature5svg from '@/assets/svgs/home/feature/feature-5.svg';
import feature6svg from '@/assets/svgs/home/feature/feature-6.svg';
import featureshape from '@/assets/svgs/home/feature/feature-shape.svg';

const features = [
    {
        id: 'feature1',
        title: 'Power of 10',
        subtitle: 'For more personal attention, just like in a high-quality tuition.',
        img: feature1png,
        svg: feature1svg,
        icon: <Users className="h-5 w-5 text-white" />,
        iconBg: 'bg-[#6C3CF0]',
    },
    {
        id: 'feature2',
        title: 'No Lock-in',
        subtitle: 'Students can stay or leave next month, if not satisfied.',
        img: feature2png,
        svg: feature2svg,
        icon: <Lock className="h-5 w-5 text-white" />,
        iconBg: 'bg-[#F28C28]',
    },
    {
        id: 'feature3',
        title: '1 to 1 Interaction',
        subtitle: 'Direct Interaction — speak and ask questions any time during the class.',
        img: feature3png,
        svg: feature3svg,
        icon: <Layers className="h-5 w-5 text-white" />,
        iconBg: 'bg-[#8BC34A]',
    },
    {
        id: 'feature4',
        title: 'Affordable Fees',
        subtitle: 'Very affordable, No Advance Pay.',
        img: feature4png,
        svg: feature4svg,
        icon: <CreditCard className="h-5 w-5 text-white" />,
        iconBg: 'bg-[#52B6F4]',
    },
    {
        id: 'feature5',
        title: 'Full Academic Support',
        subtitle: 'Weekly tests, regular practice & progress tracking.',
        img: feature5png,
        svg: feature5svg,
        icon: <Info className="h-5 w-5 text-white" />,
        iconBg: 'bg-[#E94B3C]',
    },
    {
        id: 'feature6',
        title: 'Evening Classes',
        subtitle: 'Students can stay or leave next month, if not satisfied. Flexible timings.',
        img: feature6png,
        svg: feature6svg,
        icon: <Clock className="h-5 w-5 text-white" />,
        iconBg: 'bg-[#E94DCB]',
    },
];

export default function Features() {
    return (
        <section className="relative overflow-hidden px-4 pb-10 sm:px-6 md:px-10 lg:px-20 lg:pb-20">
            <div className="absolute inset-x-0 -bottom-10 h-48 bg-[radial-gradient(60%_80%_at_50%_100%,rgba(127,95,255,0.45),rgba(127,95,255,0))]" />
            <img
                src={featureshape}
                className="absolute -bottom-6 left-0 right-0 mx-auto w-[90%] opacity-80"
                alt="blur-shape"
            />

            <div className="container relative mx-auto grid gap-8 py-8 sm:py-12 md:grid-cols-3 md:gap-10 lg:gap-12">

                {/* LEFT COLUMN */}
                <div className="col-span-2 flex flex-col gap-6 md:col-span-1">
                    <div className="space-y-3 md:space-y-4">
                        <h2 className="text-2xl font-semibold leading-6 text-neutral-800 sm:text-3xl md:text-5xl md:leading-tight">
                            Features that make us <span className="text-[#FF972F]">Unique</span>
                        </h2>

                        <p className="text-sm text-neutral-700 sm:text-base">
                            The top choice Platform for students seeking help after school
                        </p>

                        <div className="mt-4 md:mt-6">
                            <Link href="/courses">
                                <Button className="rounded-full border-[#6C3CF0] bg-[#6C3CF0] tracking-wide text-white hover:bg-[#5a30d6] md:!px-10 md:!py-6 md:text-lg">
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative z-0 mt-4 md:mt-2 md:translate-x-16 lg:translate-x-20">
                        <img src={featureimg} alt="feature-image" className="h-36 w-full object-contain sm:h-48 md:h-auto" />
                    </div>
                </div>

                {/* RIGHT COLUMN — FEATURE CARDS */}
                <div className="col-span-2 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                    {features.map((f, idx) => (
                        <div
                            key={f.id}
                            className="relative rounded-2xl bg-gradient-to-b from-[#E9E7FF] to-[#FFE7C8] p-5 shadow-[0_12px_24px_rgba(103,61,230,0.18)]"
                        >
                            <div className="absolute left-4 top-4">
                                <div className={`flex items-center justify-center rounded-full p-2 ${f.iconBg}`}>
                                    {f.icon}
                                </div>
                            </div>

                            <div className="flex h-full flex-col">
                                <img src={f.svg} className="mb-6 mt-12 h-20 w-full object-contain" alt={f.title} />

                                <div className="flex-1 space-y-1">
                                    <p className="text-base text-orange-500 md:text-lg">{f.title}</p>
                                    <p className="text-xs leading-5 text-neutral-700 md:text-sm">{f.subtitle}</p>
                                </div>

                                <div className="mt-4 flex items-end justify-between">
                                    <p className="text-4xl text-[#6C3CF0] md:text-5xl">
                                        {String(idx + 1).padStart(2, '0')}
                                    </p>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button className="flex cursor-pointer items-center text-xs md:text-sm">
                                                <span className="mr-1 underline">Explore</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 -rotate-45"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl">
                                            <DialogHeader>
                                                <DialogTitle>{f.title}</DialogTitle>
                                                <DialogDescription className="mb-4">{f.subtitle}</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <img src={f.img} alt={f.title} className="h-[300px] w-full rounded-md object-cover sm:h-[360px]" />
                                                </div>
                                                <div className="flex flex-col justify-center p-4">
                                                    <p className="text-lg">{f.title}</p>
                                                    <p className="mt-2 text-sm text-muted-foreground">{f.subtitle}</p>
                                                    <div className="mt-6">
                                                        <DialogClose asChild>
                                                            <Button>Close</Button>
                                                        </DialogClose>
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
