'use client';

import hamburger_menu from '@/assets/images/hamburger-menu.svg';
import site_logo from '@/assets/images/site_logo.svg';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LogIn, Phone, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

const navLinks = [
    { name: 'Contact', href: '/contact' },
    { name: 'About us', href: '/about-us' },
    { name: 'Courses', href: '/courses' },
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
                <div className="flex h-16 items-center justify-between sm:h-[80px]">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <img src={site_logo} alt="TutStar Logo" className="h-8 w-auto sm:h-10" />
                    </Link>

                    {/* Desktop Navigation & Buttons */}
                    <div className="hidden items-center gap-2 md:flex lg:gap-3">
                        {/* Nav Links */}
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="rounded-full border border-gray-800 bg-white px-5 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Call us */}
                        <a
                            href="tel:+918954553380"
                            className="inline-flex items-center gap-2 rounded-full bg-[#FF972F] px-5 py-2 text-sm font-medium text-white transition-all hover:bg-[#e57f15]"
                        >
                            <Phone className="h-4 w-4" />
                            Call us
                        </a>

                        {/* Login/Dashboard */}
                        {auth?.user ? (
                            <Link
                                href={dashboard().url}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#673DE6] px-8 py-2 text-sm font-medium text-white transition-all hover:bg-[#5432c4]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#673DE6] px-8 py-2 text-sm font-medium text-white transition-all hover:bg-[#5432c4]"
                            >
                                Login
                            </Link>
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
                                            <img src={site_logo} alt="TutStar Logo" className="h-8 w-auto" />
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
                                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF972F] px-5 py-3 text-sm font-medium text-white"
                                        >
                                            <Phone className="h-4 w-4" />
                                            Call us
                                        </a>
                                        {auth?.user ? (
                                            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                                <Button variant="default" className="w-full rounded-full bg-[#673DE6] hover:bg-[#5432c4]">Dashboard</Button>
                                            </Link>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Link
                                                    href={login()}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#673DE6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5432c4]"
                                                >
                                                    <LogIn className="h-3.5 w-3.5" />
                                                    Login
                                                </Link>
                                                <Link
                                                    href={register()}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-gray-800 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
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

