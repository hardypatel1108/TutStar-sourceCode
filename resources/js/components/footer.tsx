'use client';

import { Link } from '@inertiajs/react';
import { Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from 'lucide-react';

const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Courses', href: '/courses' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Pricing', href: '/pricing' },
];

const courses = [
    { label: 'CBSE Classes', href: '/courses?board=cbse' },
    { label: 'ICSE Classes', href: '/courses?board=icse' },
    { label: 'State Board', href: '/courses?board=state' },
    { label: 'All Subjects', href: '/courses' },
];

const company = [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms & Conditions', href: '/terms-and-conditions' },
    { label: 'Refund Policy', href: '/refund-policy' },
];

export const Footer = () => {
    return (
        <footer className="w-full bg-[#1E1B2E] text-white">
            {/* Main Footer */}
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-10 lg:px-20 lg:py-16">
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 lg:gap-10">

                    {/* Brand Column */}
                    <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-2">
                        <div className="max-w-[280px]">
                            {/* Logo */}
                            <div className="mb-4 flex items-center">
                                <span className="rounded-xl bg-white px-3 py-1.5 text-2xl font-extrabold tracking-tight text-[#673DE6]">
                                    Tut<span className="font-normal text-neutral-700">Star</span>
                                </span>
                            </div>
                            <p className="mb-3 text-base font-semibold text-gray-200">TutStar Online Courses</p>
                            <p className="text-sm leading-6 text-gray-400">
                                TutStar Learning is a trusted online education platform dedicated to empowering students with high-quality
                                courses, expert instructors, and interactive tools. From foundational subjects to advanced skills, we help
                                learners achieve success affordably.
                            </p>

                            {/* Social Icons */}
                            <div className="mt-6">
                                <p className="mb-3 text-sm font-semibold text-gray-300">Follow us</p>
                                <div className="flex gap-3">
                                    {[
                                        { icon: <Instagram className="h-4 w-4" />, href: '#', label: 'Instagram' },
                                        { icon: <Youtube className="h-4 w-4" />, href: '#', label: 'YouTube' },
                                        { icon: <Linkedin className="h-4 w-4" />, href: '#', label: 'LinkedIn' },
                                    ].map((s) => (
                                        <a
                                            key={s.label}
                                            href={s.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={s.label}
                                            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-600 bg-white/5 text-gray-300 transition-all hover:border-[#673DE6] hover:bg-[#673DE6] hover:text-white"
                                        >
                                            {s.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <p className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-300">Quick Links</p>
                        <ul className="space-y-3">
                            {quickLinks.map((l) => (
                                <li key={l.label}>
                                    <Link
                                        href={l.href}
                                        className="text-sm text-gray-400 transition-colors hover:text-[#B38EFF]"
                                    >
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Courses */}
                    <div>
                        <p className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-300">Courses</p>
                        <ul className="space-y-3">
                            {courses.map((l) => (
                                <li key={l.label}>
                                    <Link
                                        href={l.href}
                                        className="text-sm text-gray-400 transition-colors hover:text-[#B38EFF]"
                                    >
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <p className="mb-5 mt-8 text-sm font-bold uppercase tracking-wider text-gray-300">Legal</p>
                        <ul className="space-y-3">
                            {company.map((l) => (
                                <li key={l.label}>
                                    <Link
                                        href={l.href}
                                        className="text-sm text-gray-400 transition-colors hover:text-[#B38EFF]"
                                    >
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <p className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-300">Contact</p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B38EFF]" />
                                <p className="text-sm leading-5 text-gray-400">
                                    SF, 425, Swarn Nagri, Greater Noida, Near INOX Mall, 201310
                                </p>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-4 w-4 shrink-0 text-[#B38EFF]" />
                                <a href="tel:+918954553380" className="text-sm text-gray-400 hover:text-[#B38EFF]">
                                    +91 895 455 3380
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-4 w-4 shrink-0 text-[#B38EFF]" />
                                <a href="mailto:support@tutstar.com" className="text-sm text-gray-400 hover:text-[#B38EFF]">
                                    support@tutstar.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6 md:px-10 lg:px-20">
                    <p className="text-center text-xs text-gray-500 sm:text-left sm:text-sm">
                        © {new Date().getFullYear()} TutStar — All rights reserved.
                    </p>
                    <p className="flex items-center gap-1 text-xs text-gray-500 sm:text-sm">
                        Developed by{' '}
                        <a
                            href="https://cytnest.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#B38EFF] transition hover:text-[#9B6EFF]"
                        >
                            Cyt Nest
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};
