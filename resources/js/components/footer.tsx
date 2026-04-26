'use client';

import { Link } from '@inertiajs/react';
import { Facebook, Instagram, Mail, MapPin, Phone, Send, Twitter } from 'lucide-react';
import expert_img from '@/assets/images/home/cta/inquiry_img.png';

const quickLinks = ['Home', 'About us', 'Contact us', 'Content', 'Integrations'];
const courses = ['Web-designers', 'Marketers', 'Small Business', 'Website Builder'];
const resources = ['Academy', 'Blog', 'Themes', 'Hosting', 'Developers', 'Support'];
const company = ['Privacy Policy', 'Terms & Conditions', 'Refund Policy', 'Teams', 'Contact Us'];

export const Footer = () => {
    return (
        <div className="w-full bg-white font-sans p-5 md:pt-5">
            {/* CTA Section - Floating Style */}
            <div className="mx-auto max-w-7xl pb-20 sm:px-6 lg:px-8 relative z-30">
                <div className="relative rounded-[50px] bg-[#EBF2FF] p-6 md:p-8 lg:px-8 lg:py-8 overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-xl">
                    <div className="z-10 max-w-4xl text-center md:text-left">
                        <h2 className="text-[18px] md:text-[25px] lg:text-[30px] font-medium text-[#1a1a1a] mb-2 tracking-tight leading-tight">
                            Have questions about subscription or something else ?
                        </h2>
                        <p className="text-base md:text-lg text-[#666666] mb-8 font-medium">
                            Our expert can answer all your questions
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <button className="bg-[#A1B9FF] text-[#2D2E32] font-bold px-10 py-4 rounded-[18px] hover:bg-[#88A6FF] transition-all shadow-md text-base">
                                Get a call from us
                            </button>
                            <div className="flex items-center gap-6 border-l border-[#C5D3ED] pl-8">
                                <div className="text-left">
                                    <p className="text-[11px] text-[#888888] font-bold uppercase tracking-widest mb-0.5">Or call us</p>
                                    <p className="text-lg font-bold text-[#1a1a1a] flex items-center gap-2">
                                        <Phone className="w-4 h-4 fill-current" />
                                        +91 00000000
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 md:mt-0 relative">
                        {/* Smaller White Oval for Expert */}
                        <div className="w-full h-auto lg:w-[220px] lg:h-auto">
                            <img 
                                src={expert_img} 
                                alt="Expert" 
                                className="w-[100%] h-[100%] object-cover" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <footer className="bg-[#33353A] text-white pt-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 mb-20">
                        
                        {/* Brand Section */}
                        <div className="w-full lg:w-[28%]">
                            <div className="inline-block bg-white px-4 py-2 rounded-lg mb-8">
                                <span className="text-3xl font-bold tracking-tighter text-[#6C3CF0]">
                                    Tut<span className="text-[#1a1a1a]">Star</span>
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-5 flex items-center gap-2 text-white">
                                The Real Difference <span className="text-2xl">🥇</span>
                            </h3>
                            <p className="text-[#BBBBBB] text-sm leading-[1.8] font-medium">
                                TutStar is a student-focused learning platform built for real results — with small batches, personal attention, and interactive live classes that make learning simple and effective. Our aim is to provide expert teachers, personal guidance from day one, and affordable pricing for every student and parent.
                            </p>
                        </div>

                        {/* All Links & Contact in One Row */}
                        <div className="flex flex-wrap md:flex-nowrap justify-between gap-8 flex-1">
                            {/* Quick Links */}
                            <div className="min-w-[120px]">
                                <h4 className="font-bold text-[17px] mb-8 text-white">Quick Links</h4>
                                <ul className="space-y-5">
                                    {quickLinks.map((l) => (
                                        <li key={l}>
                                            <Link href="#" className="text-sm font-medium text-[#BBBBBB] hover:text-white transition-colors">{l}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Courses */}
                            <div className="min-w-[120px]">
                                <h4 className="font-bold text-[17px] mb-8 text-white">Courses</h4>
                                <ul className="space-y-5">
                                    {courses.map((l) => (
                                        <li key={l}>
                                            <Link href="#" className="text-sm font-medium text-[#BBBBBB] hover:text-white transition-colors">{l}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Resources */}
                            <div className="min-w-[120px]">
                                <h4 className="font-bold text-[17px] mb-8 text-white">Resources</h4>
                                <ul className="space-y-5">
                                    {resources.map((l) => (
                                        <li key={l}>
                                            <Link href="#" className="text-sm font-medium text-[#BBBBBB] hover:text-white transition-colors">{l}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Company */}
                            <div className="min-w-[120px]">
                                <h4 className="font-bold text-[17px] mb-8 text-white">Company</h4>
                                <ul className="space-y-5">
                                    {company.map((l) => (
                                        <li key={l}>
                                            <Link href="#" className="text-sm font-medium text-[#BBBBBB] hover:text-white transition-colors">{l}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Contact Us */}
                            <div className="min-w-[240px]">
                                <h4 className="font-bold text-[17px] mb-8 text-white">Contact Us</h4>
                                <ul className="space-y-6 mb-12">
                                    <li className="flex items-start gap-4">
                                        <div className="w-9 h-9 rounded-full border border-neutral-600 flex items-center justify-center shrink-0">
                                            <MapPin className="w-4 h-4 text-neutral-300" />
                                        </div>
                                        <p className="text-sm font-medium text-[#BBBBBB] leading-relaxed">
                                            425, Knowledge Park, Amity University Road, Gr. Noida, 201310
                                        </p>
                                    </li>
                                    <li className="flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-full border border-neutral-600 flex items-center justify-center shrink-0">
                                            <Mail className="w-4 h-4 text-neutral-300" />
                                        </div>
                                        <a href="mailto:support@tutstar.com" className="text-sm font-medium text-[#BBBBBB] hover:text-white">support@tutstar.com</a>
                                    </li>
                                    <li className="flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-full border border-neutral-600 flex items-center justify-center shrink-0">
                                            <Phone className="w-4 h-4 text-neutral-300" />
                                        </div>
                                        <a href="tel:+918954553380" className="text-sm font-medium text-[#BBBBBB] hover:text-white">+91 895 455 3380</a>
                                    </li>
                                </ul>
                                
                                <div>
                                    <h4 className="font-bold text-[17px] mb-6 text-white">Follow us</h4>
                                    <div className="flex gap-4">
                                        {[
                                            { icon: <Facebook className="w-5 h-5" />, href: '#' },
                                            { icon: <Instagram className="w-5 h-5" />, href: '#' },
                                            { icon: <Twitter className="w-5 h-5" />, href: '#' },
                                            { icon: <Mail className="w-5 h-5" />, href: '#' },
                                            { icon: <Send className="w-5 h-5" />, href: '#' },
                                        ].map((social, i) => (
                                            <a 
                                                key={i} 
                                                href={social.href} 
                                                className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#33353A] hover:bg-[#6C3CF0] hover:text-white transition-all shadow-md"
                                            >
                                                {social.icon}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-[#232529] py-8 border-t border-white/5">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <p className="text-xs font-medium text-neutral-500">
                            © 2026 All Rights Reserved
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
