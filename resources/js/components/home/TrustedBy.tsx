import trusted1 from '@/assets/svgs/home/trusted/trusted1.png';
import trusted2 from '@/assets/svgs/home/trusted/trusted2.png';
import trusted3 from '@/assets/svgs/home/trusted/trusted3.png';
import trusted4 from '@/assets/svgs/home/trusted/trusted4.png';
import trusted5 from '@/assets/svgs/home/trusted/trusted5.png';
import trusted6 from '@/assets/svgs/home/trusted/trusted6.png';

export default function TrustedBy() {
    const items = [
        { icon: trusted1, text: ['5000+', 'Students'] },
        { icon: trusted2, text: ['10', 'Per Batch'] },
        { icon: trusted3, text: ['Board Focused', 'Learning'] },
        { icon: trusted4, text: ['Guidance', 'From Day One'] },
        { icon: trusted5, text: ['2 Way', 'Live Class'] },
        { icon: trusted6, text: ['Affordable', 'Plans'] },
    ];

    return (
        <section className="w-full bg-white py-8 sm:py-12 font-sans">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-[32px] bg-[#F1F1F1] p-4 sm:p-6 md:p-8">
                    <h2 className="mb-8 text-center text-xl font-bold text-[#444444] sm:text-2xl md:text-3xl">
                        Trusted by <span className="text-[#6C3CF0]">Students and Parents</span>
                    </h2>

                    <div className="overflow-hidden rounded-[24px] bg-white">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className={`relative flex flex-col items-center justify-center px-2 py-8 text-center transition-all hover:bg-neutral-50/50
                                        ${index < items.length - 2 ? 'border-b border-[#E5E5E5] lg:border-b-0' : ''}
                                        ${index < items.length - 3 ? 'sm:border-b sm:border-[#E5E5E5] lg:border-b-0' : ''}
                                        lg:border-b-0
                                    `}
                                >
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14">
                                        <img src={item.icon} alt="" className="h-full w-full object-contain" />
                                    </div>
                                    <div className="space-y-0.5">
                                        {item.text.map((line, i) => (
                                            <p key={i} className="text-xs font-bold text-[#1A1A1A] leading-tight sm:text-sm md:text-base">
                                                {line}
                                            </p>
                                        ))}
                                    </div>

                                    {/* Vertical Divider - Floating Style */}
                                    {/* Desktop: Every item except the last one */}
                                    {index !== items.length - 1 && (
                                        <div className="absolute right-0 top-1/2 hidden h-1/2 w-[1.5px] -translate-y-1/2 bg-[#E5E5E5] lg:block" />
                                    )}

                                    {/* Tablet: Every item except the last in each row (3-col) */}
                                    {(index + 1) % 3 !== 0 && (
                                        <div className="absolute right-0 top-1/2 hidden h-1/2 w-[1.5px] -translate-y-1/2 bg-[#E5E5E5] sm:block lg:hidden" />
                                    )}

                                    {/* Mobile: Every item except the last in each row (2-col) */}
                                    {(index + 1) % 2 !== 0 && (
                                        <div className="absolute right-0 top-1/2 block h-1/2 w-[1.5px] -translate-y-1/2 bg-[#E5E5E5] sm:hidden" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
