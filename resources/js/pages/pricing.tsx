'use client';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { UserNavbar } from '@/components/usernavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check, Gem } from 'lucide-react';

export default function Pricing() {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth?.user;

    const freeFeatures = [
        'Get listed to our freelancers list',
        'Create your freelancing portfolio',
        'Exclusive entry to our social media groups',
        'Weekly virtual meetups for growth and networking',
        'Member stories and spotlight features',
        'Free PDFs packed with freelancing insights',
        'Starter guides and resources to kickstart growth',
        'Ready-to-use proposal and invoice templates',
        'Peer-to-peer support and advice',
        'Invitations to online networking sessions',
        'Guest speaker sessions with industry experts',
        'Freelance market insights and trend updates',
    ];

    const premiumFeatures = [
        'Add video-intro to introduce yourself',
        'Direct hiring option from your portfolio page',
        'Premium badge for instant recognition in the club',
        'Publish blogs to share your expertise and story',
        'Featured video interview on our YouTube channel',
        'Top priority in client recommendations',
        'First access to exclusive opportunities and collaborations',
    ];

    return (
        <>
            <Head title="Plans & Pricing">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex flex-col items-center bg-[#FDFDFC] p-8 text-[#1b1b18] lg:justify-center dark:bg-[#0a0a0a]">
                <header className="w-full text-sm not-has-[nav]:hidden lg:max-w-7xl">
                    <Navbar />
                    {auth.user && <UserNavbar />}
                </header>
            </div>
            <div className="min-h-screen bg-background px-4 py-12">
                <div className="mx-auto max-w-4xl">
                    <h1 className="mb-12 text-center text-4xl font-bold">Plans & Pricing</h1>

                    <div className="space-y-10">
                        {/* Free Plan */}
                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle className="text-2xl">Basic plan</CardTitle>
                                <CardDescription className="text-base">Get everything you need to connect and learn more.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {freeFeatures.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                {isAuthenticated ? (
                                    <Button variant="outline" className="w-full sm:w-auto" disabled>
                                        You’re already a member
                                    </Button>
                                ) : (
                                    <Link href="/register">
                                        <Button size="lg" className="w-full sm:w-auto">
                                            Join Freelance Club
                                        </Button>
                                    </Link>
                                )}
                            </CardFooter>
                        </Card>

                        {/* Premium Plan */}
                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <Gem className="h-6 w-6 text-primary" />
                                    effiClub Premium (Coming Soon)
                                </CardTitle>
                                <CardDescription className="text-base">Build authority, win better clients & unlock higher earnings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {premiumFeatures.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
