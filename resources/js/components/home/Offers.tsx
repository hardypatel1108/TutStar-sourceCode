import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { index } from '@/routes/clazz';

import classes1 from '@/assets/svgs/home/Classes/classes1.png';
import classes2 from '@/assets/svgs/home/Classes/classes2.png';
import classes3 from '@/assets/svgs/home/Classes/classes3.png';
import classes4 from '@/assets/svgs/home/Classes/classes4.png';
import classes5 from '@/assets/svgs/home/Classes/classes5.png';
import classes6 from '@/assets/svgs/home/Classes/classes6.png';

type BoardProp = {
    id: number;
    name: string;
    description?: string;
    logo: string;
    slug: string;
};

export default function Offers({ boards: propBoards = [] }: { boards?: BoardProp[] }) {
    // Static mapping for design matching, fall back to propBoards if needed
    const staticBoards = [
        { name: 'CBSC', logo: classes1, slug: 'cbsc' },
        { name: 'ICSC', logo: classes2, slug: 'icsc' },
        { name: 'MP Board', logo: classes3, slug: 'mp-board' },
        { name: 'UP Board', logo: classes4, slug: 'up-board' },
        { name: 'RAJ Board', logo: classes5, slug: 'raj-board' },
        { name: 'UK Board', logo: classes6, slug: 'uk-board' },
    ];

    // Use static boards if propBoards is empty (for demo/design phase)
    const boardsToDisplay = propBoards.length > 0 
        ? propBoards.map((b, i) => ({
            name: b.name,
            logo: staticBoards[i % staticBoards.length].logo, // Use high quality assets
            slug: b.slug
        }))
        : staticBoards;

    return (
        <section className="w-full bg-white py-12 md:py-24 font-sans">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="mb-14 text-center">
                    <h2 className="text-4xl font-bold text-[#1a1a1a] mb-3 sm:text-5xl">We offer Classes</h2>
                    <p className="text-xl text-neutral-600">Choose your Board and go...</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {boardsToDisplay.map((board, idx) => (
                        <Link
                            key={idx}
                            href={index.url({ query: { board: board.slug } })}
                            className="group flex items-center justify-between rounded-[24px] border border-[#E9E4FF] bg-[#F3EFFF] p-4 transition-all hover:border-[#6C3CF0] hover:shadow-[0_10px_30px_rgba(108,60,240,0.1)] sm:p-5"
                        >
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 sm:h-24 sm:w-24 overflow-hidden p-1">
                                    <img 
                                        src={board.logo} 
                                        alt={board.name} 
                                        className="h-full w-full object-contain p-2" 
                                    />
                                </div>
                                <span className="text-xl font-bold text-[#1a1a1a] sm:text-2xl">{board.name}</span>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#6C3CF0] shadow-sm transition-transform group-hover:translate-x-1 sm:h-12 sm:w-12">
                                <ChevronRight className="h-6 w-6" strokeWidth={3} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
