const showcaseCards = [
    {
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop',
        name: 'Dr. Abcd Efg',
        role: 'MA, Phd',
        bio: 'architecto ratione corrupti laudantium molestias error dolores eum atque sequi, incidunt, asperiores veniam.',
    },
    {
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop',
        name: 'Dr. Abcd Efg',
        role: 'MA, Phd',
        bio: 'architecto ratione corrupti laudantium molestias error dolores eum atque sequi, incidunt, asperiores veniam.',
    },
    {
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop',
        name: 'Dr. Abcd Efg',
        role: 'MA, Phd',
        bio: 'architecto ratione corrupti laudantium molestias error dolores eum atque sequi, incidunt, asperiores veniam.',
    },
    {
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1200&auto=format&fit=crop',
        name: 'Dr. Abcd Efg',
        role: 'MA, Phd',
        bio: 'architecto ratione corrupti laudantium molestias error dolores eum atque sequi, incidunt, asperiores veniam.',
    },
];

export default function BoardExpertsShowcase() {
    return (
        <section className="relative w-full bg-white py-10 sm:py-14 md:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-20">
                <p className="text-sm text-neutral-600 sm:text-base">Minds Behind Tutstar</p>
                <h6 className="text-2xl font-medium text-neutral-900 sm:text-3xl md:text-5xl">
                    Our Board <span className="text-[#FF972F]">Experts</span>
                </h6>

                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {showcaseCards.map((card, idx) => (
                        <div
                            key={idx}
                            className="group relative h-72 overflow-hidden rounded-2xl bg-white shadow-md transition-transform duration-300 [transform-origin:center] hover:-translate-y-1 hover:-rotate-3 hover:shadow-lg"
                        >
                            <img src={card.image} alt="expert" className="h-full w-full object-cover" />

                            <div
                                className="absolute inset-0 flex flex-col p-5 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                style={{
                                    background:
                                        'linear-gradient(155deg, rgba(124,86,255,0.95) 0%, rgba(182,140,255,0.95) 70%, rgba(154,105,240,0.95) 100%)',
                                }}
                            >
                                <p className="text-sm font-semibold">{card.name}</p>
                                <p className="text-xs opacity-90">{card.role}</p>
                                <p className="mt-auto text-xs leading-relaxed opacity-90">{card.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
