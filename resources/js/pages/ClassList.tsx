import rightimage from '@/assets/images/class/image.png';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

type Board = {
    id: number;
    name: string;
    description?: string;
    slug: string;
};

type Clazz = {
    id: number;
    name: string;
    description?: string;
    ordinal: number;
    status: boolean;
    slug: string;
};

export default function ClassList() {
    const { auth } = usePage<SharedData>().props;
    const { board, classes } = usePage().props as {
        board: Board;
        classes: Clazz[];
    };

    // Group classes logically (for example by ordinal or category)
    const juniorClasses = classes.filter((c) => c.ordinal >= 5 && c.ordinal <= 8);
    const seniorClasses = classes.filter((c) => c.ordinal >= 9 && c.ordinal <= 10);
    const seniorSecondary = classes.filter((c) => c.ordinal >= 11 && c.ordinal <= 12);

    return (
        <>
            <Head title={`${board.name} Classes`} />
            <div className="flex flex-col items-center bg-[#FDFDFC] p-8 text-[#1b1b18] lg:justify-center dark:bg-[#0a0a0a] dark:text-gray-50">
                <header className="w-full text-sm not-has-[nav]:hidden lg:max-w-7xl">
                    <Navbar />
                </header>
            </div>
            <div className="flex min-h-screen flex-col bg-[#c4bbe0] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-gray-300">
                <section className="py-10 sm:py-14 md:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
                        {/* GRID CONTAINER */}
                        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
                            {/* LEFT COLUMN */}
                            <div className="space-y-8">
                                {/* HEADING + DESCRIPTION */}
                                <div className="space-y-2">
                                    <h2 className="text-2xl leading-snug font-semibold sm:text-3xl md:text-4xl dark:text-gray-50">
                                        Crack Showing {board.name} Classes with
                                        <span className="text-[#673de6]"> TutStar</span>
                                    </h2>

                                    <p className="text-sm leading-relaxed text-gray-700 sm:text-base md:text-lg dark:text-gray-400">
                                        {board.description || 'Over 10 crore learners trust us for online and offline coaching.'}
                                    </p>
                                </div>

                                {/* JUNIOR CLASSES */}
                                {juniorClasses.length > 0 && (
                                    <div className="space-y-3">
                                        <h2 className="text-sm font-medium text-gray-500 sm:text-xl dark:text-gray-300">Junior Classes</h2>
                                        <div className="grid gap-4 grid-cols-2 sm:gap-6">
                                            {juniorClasses.map((cls) => (
                                                <Link
                                                    key={cls.id}
                                                    href={`/plan/${board.slug}/${cls.slug}`}
                                                    className="border-blueClr hover:bg-blueClr grid place-items-center rounded-xl border py-3 text-center text-sm font-medium transition hover:text-white sm:py-4 sm:text-base"
                                                >
                                                    {cls.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SENIOR CLASSES */}
                                {seniorClasses.length > 0 && (
                                    <div className="space-y-3">
                                        <h2 className="text-sm font-medium text-gray-500 sm:text-xl dark:text-gray-300">Senior Classes</h2>
                                        <div className="grid gap-4 grid-cols-2 sm:gap-6">
                                            {seniorClasses.map((cls) => (
                                                <Link
                                                    key={cls.id}
                                                    href={`/plan/${board.slug}/${cls.slug}`}
                                                    className="border-blueClr hover:bg-blueClr grid place-items-center rounded-xl border py-3 text-center text-sm font-medium transition hover:text-white sm:py-4 sm:text-base"
                                                >
                                                    {cls.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SENIOR SECONDARY */}
                                {seniorSecondary.length > 0 && (
                                    <div className="space-y-3">
                                        <h2 className="text-sm font-medium text-gray-500 sm:text-xl dark:text-gray-300">
                                            Senior Secondary Classes
                                        </h2>
                                        <div className="grid gap-4 grid-cols-2 sm:gap-6">
                                            {seniorSecondary.map((cls) => (
                                                <Link
                                                    key={cls.id}
                                                    href={`/plan/${board.slug}/${cls.slug}`}
                                                    className="border-blueClr hover:bg-blueClr grid place-items-center rounded-xl border py-3 text-center text-sm font-medium transition hover:text-white sm:py-4 sm:text-base"
                                                >
                                                    {cls.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT IMAGE */}
                            <div className="flex items-center justify-center md:justify-end">
                                <img
                                    src={rightimage}
                                    alt={`${board.name} Classes`}
                                    className="max-h-[260px] w-auto object-contain sm:max-h-[300px] md:max-h-[400px]"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
            {/* <div className="flex min-h-screen flex-col bg-[#c4bbe0] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-gray-300">
                <section className="my-8 min-h-screen flex-1">
                    <div className="mx-auto grid min-h-[80vh] max-w-7xl grid-cols-1 gap-8 px-6 md:grid-cols-2">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-4xl font-semibold dark:text-gray-50">
                                    Crack Showing {board.name} Classes with <span className="text-[#673de6]">TutStar</span>
                                </h2>
                                <p className="text-gray-600">
                                    {board.description || 'Over 10 crore learners trust us for online and offline coaching.'}
                                </p>
                            </div>

                            {juniorClasses.length > 0 && (
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400">Junior Classes</h2>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
                                        {juniorClasses.map((cls) => (
                                            <Link
                                                key={cls.id}
                                                href={`/plan/${board.slug}/${cls.slug}`}
                                                // href={`/student/classes/${cls.id}`}
                                                className="border-blueClr hover:bg-blueClr grid place-items-center rounded-xl border py-4 text-center font-medium transition hover:text-white"
                                            >
                                                {cls.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {seniorClasses.length > 0 && (
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400">Senior Classes</h2>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
                                        {seniorClasses.map((cls) => (
                                            <Link
                                                key={cls.id}
                                                href={`/plan/${board.slug}/${cls.slug}`}
                                                className="border-blueClr hover:bg-blueClr grid place-items-center rounded-xl border py-4 text-center font-medium transition hover:text-white"
                                            >
                                                {cls.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {seniorSecondary.length > 0 && (
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400">Senior Secondary Classes</h2>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
                                        {seniorSecondary.map((cls) => (
                                            <Link
                                                key={cls.id}
                                                href={`/plan/${board.slug}/${cls.slug}`}
                                                className="border-blueClr hover:bg-blueClr grid place-items-center rounded-xl border py-4 text-center font-medium transition hover:text-white"
                                            >
                                                {cls.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-center">
                            <img src={rightimage} alt={`${board.name} Classes`} className="max-h-[400px]" />
                        </div>
                    </div>
                </section>

                <Footer />
            </div> */}
        </>
    );
}
