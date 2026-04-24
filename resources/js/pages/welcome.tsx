import { Footer } from '@/components/footer';
import CTA from '@/components/home/CTA';
import Faq from '@/components/home/Faq';
import Features from '@/components/home/Features';
import TrustedBy from '@/components/home/TrustedBy';
import HeroSection from '@/components/home/HeroSection';
import HowWeWork from '@/components/home/HowWeWork';
import Milestone from '@/components/home/Milestone';
import Offers from '@/components/home/Offers';
import TestimonialHighlight from '@/components/home/TestimonialHighlight';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import BoardExpertsShowcase from '@/components/home/BoardExpertsShowcase';
import { Navbar } from '@/components/navbar';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth, boards } = usePage<SharedData>().props;
    return (
        <>
            <Head title="TutStar — Be the Star of Your Class With Real Learning" />
            <Navbar />
            <main className="min-h-screen bg-white text-gray-700">
                <HeroSection />
                <TrustedBy />
                <Features />
                <Offers boards={boards ?? []} />
                <HowWeWork />
                <WhyChooseSection />
                <BoardExpertsShowcase />
                <TestimonialHighlight />
                <CTA />
                <Milestone />
                <Faq />
            </main>
            <Footer />
        </>
    );
}
