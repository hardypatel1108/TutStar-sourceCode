import { Footer } from '@/components/footer';
import Experts from '@/components/home/Experts';
import Features from '@/components/home/Features';
import HeroCarousel from '@/components/home/HeroCarousel';
import HeroSection from '@/components/home/HeroSection';
import HowWeWork from '@/components/home/HowWeWork';
import Offers from '@/components/home/Offers';
import  Testimonial from '@/components/home/Testimonial';
import  CTA  from '@/components/home/CTA';
import WhyWe from '@/components/home/WhyWe';
import { Navbar } from '@/components/navbar';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import  Milestone  from "@/components/home/Milestone"
import  Faq  from "@/components/home/Faq"
export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Admin" />
            <div className="flex flex-col items-center bg-[#FDFDFC] p-8 text-[#1b1b18] lg:justify-center dark:bg-[#0a0a0a]">
                <header className="w-full text-sm not-has-[nav]:hidden lg:max-w-7xl">
                    <Navbar />
                </header>
            </div>
            <div className="min-h-screen bg-white">
               Admin
            </div>

            <Footer />
        </>
    );
}
