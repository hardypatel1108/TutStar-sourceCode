import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

import contactUs from '@/assets/images/contact/contact-us.png';

export default function Contact() {
    const [form, setForm] = useState({ email: '', name: '', phone: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setForm({ email: '', name: '', phone: '', message: '' });
    };

    return (
        <>
            <Head title="Contact Us | TutStar">
                <meta
                    name="description"
                    content="Get in touch with TutStar. Reach out via phone, email, or our contact form. We're always happy to assist you."
                />
            </Head>

            {/* Navbar */}
            <div className="flex flex-col items-center bg-white p-8 text-[#1b1b18] lg:justify-center">
                <header className="w-full text-sm not-has-[nav]:hidden lg:max-w-7xl">
                    <Navbar />
                </header>
            </div>

            <main className="min-h-screen bg-white">
                {/* ── Hero Section ── */}
                <section className="relative bg-gradient-to-br from-[#e6ffff] to-[#a8a0f3]  pb-0">
                    <div className="customContainer relative z-10 py-10 sm:py-14 lg:py-16">
                        <div className="grid items-end gap-6 lg:grid-cols-2">
                            {/* Left Text */}
                            <div className="">
                                <h1 className="mb-3 text-4xl font-bold text-[#1a1a2e] sm:text-5xl">Contact Us</h1>
                                <p className="mb-2 text-lg font-semibold text-[#1a1a2e] sm:text-xl">
                                    Have questions or need help? We're here for you.
                                </p>
                                <p className="max-w-sm leading-7 text-neutral-600">
                                    Reach out to our team anytime – we'll guide you and support you at every step
                                </p>
                            </div>

                            {/* Right Image — arched frame */}
                            <div className="flex justify-center lg:justify-end relative">
                               <img 
                                src={contactUs} 
                                alt="Contact" 
                                className="h-auto w-[280px] mx-auto absolute top-[-8rem] left-1/2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Subtle wave divider */}
                </section>

                {/* ── Contact Info Cards ── */}
                <section className="customContainer py-12 sm:py-16">
                    <h2 className="mb-1 text-2xl font-bold text-[#1a1a2e]">Contact Info</h2>
                    <p className="mb-8 text-neutral-500">We are always happy to assist you</p>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
    
                        {/* Left Side (8 columns) */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-8">
                            {/* Phone */}
                            <div className="group flex flex-col gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#673DE6] text-[#673DE6] transition-colors group-hover:bg-[#673DE6] group-hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.36h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16.3z" />
                                </svg>
                            </div>
                            <p className="text-base font-semibold text-[#1a1a2e]">+91 895 455 3380</p>
                            <p className="text-sm text-neutral-500">
                                Assistance hours:<br />Monday – Friday 6 am to 8 pm EST
                            </p>
                        </div>

                        {/* Email */}
                        <div className="group flex flex-col gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#673DE6] text-[#673DE6] transition-colors group-hover:bg-[#673DE6] group-hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </div>
                            <p className="text-base font-semibold text-[#1a1a2e]">support@tutstar.com</p>
                            <p className="text-sm text-neutral-500">
                                Email us anytime-<br />we'll respond shortly
                            </p>
                        </div>

                        {/* Address */}
                        <div className="group flex flex-col gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#673DE6] text-[#673DE6] transition-colors group-hover:bg-[#673DE6] group-hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <p className="text-base font-semibold text-[#1a1a2e]">Noida</p>
                            <p className="text-sm text-neutral-500">
                                425, Knowledge Park,<br />Amity University Road,<br />Gr. Noida, 201310
                            </p>
                        </div>
                    </div>

                    {/* Right Side (4 columns) */}
                    <div className="lg:col-span-4">
                        
                    </div>

                    </div>
                </section>

                {/* ── Form + Map ── */}
                <section className="customContainer pb-14 sm:pb-20">
                    <div className="grid gap-8 lg:grid-cols-2">

                        {/* Contact Form */}
                        <div className="rounded-2xl bg-gradient-to-br from-[#dff5fe] to-[#d0ddfb] p-6 sm:p-8">
                            <h2 className="mb-1 text-2xl font-bold text-[#1a1a2e]">Send us a massage</h2>
                            <p className="mb-6 text-sm text-neutral-500">Fill the form and our team will get back to you shortly</p>

                            {submitted && (
                                <div className="mb-4 rounded-xl bg-[#673DE6] px-4 py-3 text-sm font-medium text-white">
                                    ✅ Message sent! We'll get back to you shortly.
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col gap-3" id="contact-form">
                                <input
                                    id="contact-email"
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-[#D4C8FF] bg-white px-4 py-3 text-sm text-neutral-700 placeholder-neutral-400 outline-none transition focus:border-[#673DE6] focus:ring-2 focus:ring-[#673DE6]/20"
                                />
                                <input
                                    id="contact-name"
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-[#D4C8FF] bg-white px-4 py-3 text-sm text-neutral-700 placeholder-neutral-400 outline-none transition focus:border-[#673DE6] focus:ring-2 focus:ring-[#673DE6]/20"
                                />
                                <input
                                    id="contact-phone"
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-[#D4C8FF] bg-white px-4 py-3 text-sm text-neutral-700 placeholder-neutral-400 outline-none transition focus:border-[#673DE6] focus:ring-2 focus:ring-[#673DE6]/20"
                                />
                                <textarea
                                    id="contact-message"
                                    name="message"
                                    placeholder="Message"
                                    rows={5}
                                    value={form.message}
                                    onChange={handleChange}
                                    className="w-full resize-none rounded-xl border border-[#D4C8FF] bg-white px-4 py-3 text-sm text-neutral-700 placeholder-neutral-400 outline-none transition focus:border-[#673DE6] focus:ring-2 focus:ring-[#673DE6]/20"
                                />
                                <div>
                                    <button
                                        id="contact-submit"
                                        type="submit"
                                        className="rounded-xl bg-[#673DE6] px-8 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(103,61,230,0.35)] transition-all hover:bg-[#5432c4] hover:shadow-[0_6px_18px_rgba(103,61,230,0.45)] active:scale-95"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Map + Social */}
                        <div className="flex flex-col gap-8">
                            {/* Map */}
                            <div>
                                <h2 className="mb-1 text-2xl font-bold text-[#1a1a2e]">Our Location</h2>
                                <p className="mb-4 text-sm text-neutral-500">We are always happy to assist you</p>
                                <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                                    <iframe
                                        title="TutStar Location"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.507348143168!2d77.43529037550395!3d28.496699775737826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cc1b7a2d5c0e3%3A0x5b7a2f3fcfd89a87!2sKnowledge%20Park%20III%2C%20Greater%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1713600000000!5m2!1sen!2sin"
                                        width="100%"
                                        height="300"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="block"
                                    />
                                </div>
                            </div>

                            {/* Social Media */}
                            <div>
                                <h2 className="mb-4 text-2xl font-bold text-[#1a1a2e]">Social Media</h2>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Facebook */}
                                    <a
                                        href="https://facebook.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Facebook"
                                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#673DE6] text-[#673DE6] transition-all hover:bg-[#673DE6] hover:text-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                        </svg>
                                    </a>

                                    {/* Instagram */}
                                    <a
                                        href="https://instagram.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Instagram"
                                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#673DE6] text-[#673DE6] transition-all hover:bg-[#673DE6] hover:text-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                                        </svg>
                                    </a>

                                    {/* X / Twitter */}
                                    <a
                                        href="https://x.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="X (Twitter)"
                                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#673DE6] text-[#673DE6] transition-all hover:bg-[#673DE6] hover:text-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    </a>

                                    {/* WhatsApp */}
                                    <a
                                        href="https://wa.me/918954553380"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="WhatsApp"
                                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#673DE6] text-[#673DE6] transition-all hover:bg-[#673DE6] hover:text-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                                        </svg>
                                    </a>

                                    {/* Telegram */}
                                    <a
                                        href="https://t.me"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Telegram"
                                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#673DE6] text-[#673DE6] transition-all hover:bg-[#673DE6] hover:text-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 14.55l-2.95-.924c-.642-.204-.654-.642.136-.953l11.527-4.448c.535-.194 1.003.131.679.023z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
