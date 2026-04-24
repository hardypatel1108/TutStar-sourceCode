import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css'; // core styles
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';

export default function HeroTicker({ logos = [] }) {
    const defaultLogos = [
        'https://upload.wikimedia.org/wikipedia/commons/b/b6/Logo_-_NEOS_Gray.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/b/b6/Logo_-_NEOS_Gray.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/b/b6/Logo_-_NEOS_Gray.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/b/b6/Logo_-_NEOS_Gray.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/b/b6/Logo_-_NEOS_Gray.jpg',
        // 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        // 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
        // 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
        // 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    ];

    const items = logos.length ? logos : defaultLogos;

    const options = {
        type: 'loop',
        perPage: 8,
        gap: '1rem',
        pagination: false,
        arrows: false,
        drag: false,
        // AutoScroll extension options — smaller magnitude => slower smooth scroll
        autoScroll: {
            speed: -0.6, // negative -> scroll left, fractional for smoothness
            pauseOnHover: true, // pause on hover (set false if you don't want pause)
            pauseOnFocus: true, // pause when focused
            rewind: false,
        },
        breakpoints: {
            1024: { perPage: 7 },
            768: { perPage: 6 },
            640: { perPage: 5 },
            480: { perPage: 4 },
        },
    };

    return (
        <section className="container mx-auto   ">
            <div className="py-0  flex flex-col justify-center">
                <Splide options={options} extensions={{ AutoScroll }} aria-label="Partners ticker">
                    {items.map((logo, i) => (
                        <SplideSlide key={i}>
                            <div className="flex items-center justify-center p-2">
                                <img
                                    src={logo}
                                    alt={`logo-${i}`}
                                    className="h-auto w-24 object-contain opacity-90 transition-opacity hover:opacity-100"
                                    style={{ willChange: 'transform, opacity' }}
                                />
                            </div>
                        </SplideSlide>
                    ))}
                </Splide>
            </div>
        </section>
    );
}
