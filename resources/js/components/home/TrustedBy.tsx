export default function TrustedBy() {
    const items = [
        { icon: 'fa-user-group', title: '1000+', subtitle: 'Students' },
        { icon: 'fa-bullseye', title: '10', subtitle: 'per Batch' },
        { icon: 'fa-book', title: 'Board-Focused', subtitle: 'Learning' },
        { icon: 'fa-handshake', title: 'Guidance', subtitle: 'from Day One' },
        { icon: 'fa-comments', title: '2-Way', subtitle: 'Live Classes' },
        { icon: 'fa-coins', title: 'Affordable', subtitle: 'Plans' },
    ];

    return (
        <section className="w-full bg-white py-6 sm:py-8">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-20">
                {/* Gradient border wrapper */}
                <div
                    className="rounded-[28px] p-[2px] shadow-[0_18px_50px_rgba(85,96,210,0.4)]"
                    style={{
                        background: 'linear-gradient(135deg, #6E7BFF 0%, #7F8BFF 45%, #8B7BFF 100%)',
                    }}
                >
                    {/* Inner card */}
                    <div
                        className="rounded-[26px] px-4 py-5 sm:px-6 sm:py-6"
                        style={{
                            background:
                                'radial-gradient(1200px 300px at 10% 0%, rgba(255,255,255,0.85), transparent 60%), radial-gradient(900px 260px at 100% 0%, rgba(255,255,255,0.9), transparent 60%), #EEF2FF',
                        }}
                    >
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-center gap-2 text-[#3E4BAF]">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                                <i className="fa-solid fa-check text-sm text-[#3E4BAF]" />
                            </span>
                            <p className="text-base font-semibold sm:text-lg">Trusted by Students &amp; Parents</p>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white/70 p-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-0 lg:p-5">
                            {items.map((item, index) => (
                                <div
                                    key={item.title}
                                    className={`flex flex-col items-center justify-center gap-2 px-2 py-2 text-center ${
                                        index !== 0 ? 'lg:border-l lg:border-[#D7DEFF]' : ''
                                    }`}
                                >
                                    <i className={`fa-solid ${item.icon} text-3xl text-[#4C7CFF]`} />
                                    <div className="leading-tight">
                                        <p className="text-base font-semibold text-[#343C7A]">{item.title}</p>
                                        <p className="text-xs text-[#5D6696] sm:text-sm">{item.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
