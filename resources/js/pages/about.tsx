import about12 from '@/assets/images/about/about-1-2.png';
import about1 from '@/assets/images/about/about-1.png';
import about22 from '@/assets/images/about/about-2-2.png';
import about2 from '@/assets/images/about/about-2.png';
import visionbg from '@/assets/images/about/vision-bg-img.png';
import pencil from '@/assets/svgs/about/pencil.svg';
import yellowLine from '@/assets/svgs/about/yellow-line.svg';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Linkedin } from 'lucide-react';

export default function About() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex flex-col items-center bg-[#FDFDFC] p-8 text-[#1b1b18] lg:justify-center dark:bg-[#0a0a0a]">
                <header className="w-full text-sm not-has-[nav]:hidden lg:max-w-7xl">
                    <Navbar />
                </header>
            </div>
            <div className="min-h-screen bg-white">
                <section className="">
                    <div className="mx-auto max-w-6xl">
                        {/* Section 1 */}
                        <section className="customContainer py-10 sm:py-12 md:py-14 lg:py-16">
                            <div className="grid items-center gap-8 lg:grid-cols-2">
                                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                                    <h1 className="my-6 text-3xl font-semibold text-pretty lg:text-5xl text-[#222222]">
                                        We{' '}
                                        <span className="relative">
                                            are... <img src={yellowLine} className="absolute -bottom-1 left-0" alt="" />
                                        </span>
                                    </h1>
                                    <p className="mb-1 max-w-xl leading-6 text-neutral-700 lg:text-lg">
                                        If you haven't found what you're looking for, please check this out. Got any questions or feedback? Feel free
                                        to reach out to us by giving us a call.
                                    </p>
                                    <p className="mb-1 max-w-xl leading-6 text-neutral-700 lg:text-lg">
                                        Before sending a message, you may want to review our documentation page.
                                    </p>
                                    <p className="mb-1 max-w-xl leading-6 text-neutral-700 lg:text-lg">
                                        If you can't find what you need, connect to live support for quick assistance.
                                    </p>
                                    <p className="mb-1 max-w-xl leading-6 text-neutral-700 lg:text-lg">
                                        Please select the product, enter your details, and submit your message via the contact form.
                                    </p>
                                </div>
                                <div className="relative">
                                    <img src={about1} alt="" className="relative z-10 max-h-80 w-full rounded-md object-contain" />
                                    <img
                                        src={about12}
                                        className="absolute top-1/2 left-1/2 max-h-60 -translate-x-1/2 -translate-y-1/2 rounded-md object-contain"
                                        alt=""
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Founder Thought */}
                        <section className="customContainer py-10 sm:py-12 md:py-14 lg:py-16">
                            <div className="grid items-center gap-8 lg:grid-cols-2">
                                <div className="order-2 md:order-1">
                                    <div className="relative">
                                        <img src={about2} alt="" className="relative z-10 max-h-60 w-full rounded-md object-contain" />
                                        <img
                                            src={about22}
                                            className="absolute bottom-0 left-1/2 max-h-42 w-full -translate-x-1/2 rounded-md object-contain"
                                            alt=""
                                        />
                                    </div>
                                    <div className="mt-2 flex flex-col items-center">
                                        <p className="text-lg font-semibold text-[#000000]">Priya Ray</p>
                                        <p className="mb-1 text-sm text-[#353333]">Founder, CEO</p>
                                        <Link href="/" >
                                            <Linkedin className="h-5 w-5 text-[#353333]" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="order-1 flex flex-col items-end text-right md:order-2">
                                    <h1 className="my-6 text-3xl font-semibold text-pretty lg:text-5xl text-[#222222]">Founder Thought</h1>
                                    <p className="mb-2 max-w-xl leading-6 font-medium text-neutral-700 lg:text-xl">
                                        Because Students Need Much More Than Just Videos
                                    </p>
                                    <p className="mb-1 max-w-xl leading-6 text-neutral-700 lg:text-lg">
                                        For too long, students were forced to settle for one-way streaming courses where real interaction was missing.
                                        TutStar changes that — offering live classes with real 1:1 teacher-student interaction.
                                    </p>
                                    <p className="mb-1 max-w-xl leading-6 text-neutral-700 lg:text-lg">
                                        “And that’s not all — we’re ensuring TutStar brings benefits that help both students and parents choose the
                                        best educational platform.” ✍️
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Team */}
                        <section className="customContainer grid grid-cols-2 gap-4 py-10 sm:py-12 md:py-14 lg:py-16">
                            {[...Array(2)].map((_, i) => (
                                <div key={i}>
                                    <div className="relative">
                                        <img src={about2} alt="" className="relative z-10 max-h-28 w-full rounded-md object-contain md:max-h-60" />
                                        <img
                                            src={about22}
                                            className="absolute bottom-0 left-1/2 max-h-48 w-full -translate-x-3/4 rounded-md object-contain"
                                            alt=""
                                        />
                                    </div>
                                    <div className="mt-2 flex flex-col items-center">
                                        <p className="text-lg font-semibold text-[#000000]">Priya Ray</p>
                                        <p className="mb-1 text-sm text-[#353333]">Founder, CEO</p>
                                        <a href="https://linkedin.com/">
                                            <Linkedin className="h-5 w-5 text-[#353333]" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Section 4: Vision / Milestones */}
                        <section className="customContainer">
                            <p className="mb-4 flex items-center justify-end gap-2 text-3xl font-semibold md:text-4xl text-[#222222]">
                                Milestones Ahead <img src={pencil} className="max-h-8" alt="" />
                            </p>
                            <div
                                className="rounded-3xl bg-cover bg-center bg-no-repeat p-8 text-white"
                                style={{ backgroundImage: `url(${visionbg})` }}
                            >
                                <p className="text-yellowClr text-2xl font-semibold">Broad Vision</p>
                                <p className="mb-4 text-sm md:text-base">
                                    We aim to create a stress-free learning environment focused on real growth and affordable education.
                                </p>

                                <p className="text-sm">VISION 02</p>
                                <p className="text-yellowClr text-2xl font-semibold">The Next Chapter</p>
                                <p className="mb-4 text-sm md:text-base">
                                    TutStar is expanding into every village, town, and city — reaching every learner.
                                </p>

                                <ol className="list-decimal ps-4">
                                    {[
                                        {
                                            title: 'Empowering Students',
                                            text: 'Personal support and real interaction to help students learn better.',
                                        },
                                        {
                                            title: 'Supporting Parents',
                                            text: 'Affordable, flexible plans with no lock-ins.',
                                        },
                                        {
                                            title: 'Bridging the Education Gap',
                                            text: 'Bringing quality teachers to both rural and urban students.',
                                        },
                                        {
                                            title: 'Generating Employment',
                                            text: 'Creating jobs for teachers and support teams across India.',
                                        },
                                        {
                                            title: 'Comfort & Safety for Girls',
                                            text: 'Helping girls learn safely from home.',
                                        },
                                    ].map((item, idx) => (
                                        <li key={idx} className="mb-2 text-sm md:text-base">
                                            <p className="text-lg font-semibold md:text-xl">{item.title}</p>
                                            <p>{item.text}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </section>

                        {/* Section 5: Contact */}
                        <section className="customContainer py-10 text-center sm:py-12 md:py-14 md:pb-0 lg:py-16">
                            <p className="mb-2 text-4xl font-semibold text-[#222222]">For any queries</p>
                            <p className="text-xl font-medium text-[#222222]">
                                Contact us on{' '}
                                <a href="mailto:vcare@tutstar.com" className="text-blueClr text-[#673DE6]">
                                    vcare@tutstar.com
                                </a>
                            </p>
                        </section>
                        {/* <div className="space-y-6 leading-relaxed text-foreground/90">
                            <p>We are a team of freelancers, building this club for freelancers.</p>
                            <p>And, it all started with a LinkedIn poll.</p>
                            <p>Here's it ....</p>


                            <p>I knew about the freelancing struggles, but I was not expecting the situation to be this poor.</p>
                            <p>
                                Not many freelancers are able to make it. Freelancers are scared, worried and confused. They are struggling to get
                                clients, learn, build a work-life balance, meet deadlines, and much more. And, guess what, they are trying to do all
                                that alone.
                            </p>
                            <p>Where's the team? Where are your people?</p>
                            <p>If not a team? Then, where's the community?</p>
                            <p>And this is how effiClub.com was born.</p>
                            <p>
                                It's a very specific club for freelancers. Designed for freelancers. Featured to improve the life of the freelancers.
                                This club is home to freelancers. To connect, collaborate and rise.
                            </p>
                            <p>
                                Read the full story:{' '}
                                <a href="/why-efficlub" className="font-semibold text-primary hover:underline">
                                    Why effiClub?
                                </a>
                            </p>

                            <h2 className="mt-10 mb-4 text-2xl font-bold sm:text-3xl">
                                Our Vision
                            </h2>
                            <p>
                                We vision to build a freelance club where every freelancer could identify a clear path to their freelancing success.
                                And, open up premium opportunities for themselves with premium services. All of these, ultimately leading to a
                                fulfilling happy life.
                            </p>

                            <h2 className="mt-10 mb-4 text-2xl font-bold sm:text-3xl">
                                Our Mission
                            </h2>
                            <p>
                                Our mission is to collect and connect 1000+ freelancers and help them communicate with each other easily to learn,
                                collaborate and recommend projects so that there are ample opportunities for all freelancers at the premium level.
                            </p>

                            <div className="my-8">
                                {!auth?.user && (
                                    <>
                                        <h2 className="mt-10 mb-4 text-2xl font-bold sm:text-3xl">
                                            Joining Invitation
                                        </h2>
                                        <p>
                                            If you are a freelancer, beginner or experienced, I invite you to join our club. We are built for all
                                            freelancers from any area of expertise, from creative writing to techie coding. We are currently welcoming
                                            only Indian freelancers.
                                        </p>

                                        <Button size="lg" className="mt-8 px-8">
                                            <Link
                                                href={login()}
                                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                            >
                                                Join now for FREE
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>

                            <h2 className="mt-10 mb-4 text-2xl font-bold sm:text-3xl">
                                Contact us
                            </h2>
                            <p>For any queries, suggestions or discussion, reach out to us:</p>

                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-primary" />
                                    <a href="mailto:in.efficlub@gmail.com" className="text-primary hover:underline">
                                        in.efficlub@gmail.com
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Linkedin className="h-5 w-5 text-primary" />
                                    <Link
                                        href="https://www.linkedin.com/in/satya-prakash-mourya/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        Satya Prakash
                                    </Link>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Instagram className="h-5 w-5 text-primary" />
                                    <Link
                                        href="https://www.instagram.com/efficlub/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        DM Satya
                                    </Link>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
