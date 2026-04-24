'use client';

import hamburger_menu from '@/assets/images/hamburger-menu.svg';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LogIn, PhoneCall, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Contact', href: '/contact' },
];

export const Navbar = () => {
    const { auth } = usePage<SharedData>().props;
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrolled(currentScrollY > 10);
            if (currentScrollY < lastScrollY || currentScrollY < 10) setShowNavbar(true);
            else if (currentScrollY > lastScrollY && currentScrollY > 100) setShowNavbar(false);
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <nav
            className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
                showNavbar ? 'translate-y-0' : '-translate-y-full'
            } ${
                scrolled
                    ? 'border-b border-gray-100 bg-white/95 shadow-[0_2px_20px_rgba(0,0,0,0.08)] backdrop-blur-md'
                    : 'border-b border-transparent bg-white/90 backdrop-blur-sm'
            }`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between sm:h-[68px]">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex items-center">
                            <span className="text-2xl font-extrabold tracking-tight text-[#673DE6] sm:text-3xl">
                                Tut
                            </span>
                            <span className="text-2xl font-extrabold tracking-tight text-neutral-800 sm:text-3xl">
                                Star
                            </span>
                            <span className="ml-1.5 hidden rounded-full bg-[#ECE8FF] px-2 py-0.5 text-[10px] font-bold text-[#673DE6] sm:inline-block">
                                BETA
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden items-center gap-1 md:flex lg:gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-[#F4F0FF] hover:text-[#673DE6] lg:px-4"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden items-center gap-2 md:flex">
                        <a
                            href="tel:+918954553380"
                            className="inline-flex items-center gap-2 rounded-full bg-[#FF972F] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(255,151,47,0.35)] transition-all hover:bg-[#e57f15] hover:shadow-[0_6px_16px_rgba(255,151,47,0.45)]"
                        >
                            <PhoneCall className="h-3.5 w-3.5" />
                            Call Now
                        </a>
                        {auth?.user ? (
                            <Link
                                href={dashboard().url}
                                className="inline-flex items-center gap-2 rounded-full border border-[#673DE6] px-4 py-2 text-sm font-semibold text-[#673DE6] transition-all hover:bg-[#673DE6] hover:text-white"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:border-[#673DE6] hover:text-[#673DE6]"
                                >
                                    <LogIn className="h-3.5 w-3.5" />
                                    Login
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#673DE6] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(103,61,230,0.35)] transition-all hover:bg-[#5432c4] hover:shadow-[0_6px_16px_rgba(103,61,230,0.45)]"
                                >
                                    <UserPlus className="h-3.5 w-3.5" />
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10">
                                    <img src={hamburger_menu} className="w-6" alt="menu" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72 bg-white p-0">
                                <SheetHeader className="border-b border-gray-100 px-6 py-5">
                                    <SheetTitle>
                                        <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                                            <span className="text-2xl font-extrabold text-[#673DE6]">Tut</span>
                                            <span className="text-2xl font-extrabold text-neutral-800">Star</span>
                                        </Link>
                                    </SheetTitle>
                                </SheetHeader>

                                <div className="flex flex-col gap-1 px-4 py-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className="rounded-xl px-4 py-3 text-base font-medium text-neutral-700 transition-colors hover:bg-[#F4F0FF] hover:text-[#673DE6]"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>

                                <div className="border-t border-gray-100 px-4 py-4">
                                    <div className="flex flex-col gap-3">
                                        <a
                                            href="tel:+918954553380"
                                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF972F] px-5 py-3 text-sm font-semibold text-white"
                                        >
                                            <PhoneCall className="h-4 w-4" />
                                            Call Now
                                        </a>
                                        {auth?.user ? (
                                            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                                <Button variant="default" className="w-full rounded-full">Dashboard</Button>
                                            </Link>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Link
                                                    href={login()}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-[#673DE6] px-4 py-2.5 text-sm font-semibold text-[#673DE6] hover:bg-[#F4F0FF]"
                                                >
                                                    <LogIn className="h-3.5 w-3.5" />
                                                    Login
                                                </Link>
                                                <Link
                                                    href={register()}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#673DE6] px-4 py-2.5 text-sm font-semibold text-white"
                                                >
                                                    <UserPlus className="h-3.5 w-3.5" />
                                                    Sign Up
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
};
