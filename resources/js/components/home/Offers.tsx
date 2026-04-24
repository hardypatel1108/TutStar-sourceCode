import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { index } from '@/routes/clazz';

type Board = {
    id: number;
    name: string;
    description?: string;
    logo: string;
    slug: string;
};

export default function Offers({ boards = [] }: { boards?: Board[] }) {
    return (
        <section className="w-full bg-white py-10 sm:py-12 md:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-20">
                {/* Heading */}
                <div className="mb-8 text-center md:mb-12">
                    <h3 className="text-2xl font-semibold sm:text-3xl md:text-4xl">We offer Classes</h3>
                    <p className="text-sm text-neutral-700 sm:text-base md:text-lg">Choose your Board and go...</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-6">
                    {boards.map((board) => (
                        <Link
                            key={board.id}
                            href={index.url({ query: { board: board.slug } })}
                            className="flex items-center gap-2 rounded-2xl border border-[#d6c6ff] bg-[#F6F0FF] p-2 shadow-[0_6px_18px_rgba(145,95,255,0.18)] transition-transform hover:scale-[1.03] sm:gap-3 sm:p-3 md:gap-4 md:p-4"
                        >
                            {/* Logo */}
                            <img
                                src={`/storage/${board.logo}`}
                                alt={board.name}
                                className="h-10 w-10 object-contain sm:h-14 sm:w-14 md:h-16 md:w-16"
                            />

                            {/* Text */}
                            <p className="min-w-0 flex-1 break-words text-xs font-semibold uppercase text-neutral-900 sm:text-sm md:text-lg">
                                {board.name}
                            </p>

                            {/* Arrow */}
                            <div className="shrink-0 rounded-full bg-white p-1 shadow sm:p-2">
                                <ChevronRight className="h-4 w-4 text-[#8b5cf6] sm:h-5 sm:w-5 md:h-6 md:w-6" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
