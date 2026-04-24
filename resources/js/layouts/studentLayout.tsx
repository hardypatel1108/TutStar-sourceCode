import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Bell, BellRing, BookOpen, Calendar, CircleUserRound, LogOut, Megaphone, Menu, MessageCircleQuestion, School, Settings, X } from 'lucide-react';

import { useState } from 'react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const { url } = usePage();
    const page = usePage();
    const { auth, studentMeta } = page.props as any;
    const cleanup = useMobileNavigation();
    const initials = useInitials();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState(auth?.user?.student_profile?.board_id ? String(auth.user.student_profile.board_id) : '');
    const [selectedClass, setSelectedClass] = useState(auth?.user?.student_profile?.class_id ? String(auth.user.student_profile.class_id) : '');
    const hasProfileSelection = Boolean(auth?.user?.student_profile?.board_id && auth?.user?.student_profile?.class_id);
    const [popupOpen, setPopupOpen] = useState(!hasProfileSelection);

    const boards: Array<{ id: number; name: string }> = studentMeta?.boards ?? [];
    const classes: Array<{ id: number; name: string; board_id: number }> = studentMeta?.classes ?? [];

    const classesForSelectedBoard = classes.filter((item) => {
        return String(item.board_id) === String(selectedBoard);
    });

    const showClassSelectionPopup = Boolean(auth?.user?.student_profile) && !hasProfileSelection && popupOpen;

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const handleSavePreferredClass = () => {
        if (!selectedBoard || !selectedClass) return;

        router.patch(
            '/settings/profile',
            { board_id: selectedBoard, class_id: selectedClass },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPopupOpen(false);
                },
            },
        );
    };

    const menuItems = [
        { label: 'Home', href: '/my-classes', icon: School },
        { label: 'Calendar', href: '/schedule', icon: Calendar },
        { label: 'Notifications', href: '/notifications', icon: Bell },
        { label: 'Other Notifications', href: '/other-notifications', icon: Megaphone },
        { label: 'Home Work', href: '/home-work', icon: BookOpen },
        { label: 'Practice Test', href: '/practice-test', icon: BookOpen },
        { label: 'My Subscriptions', href: '/my-subscriptions', icon: BookOpen },
        { label: 'Post Doubt', href: '/post-doubt', icon: MessageCircleQuestion },
        { label: 'Settings', href: '/settings', icon: Settings },
    ];
    const isMyClassesPage = url.startsWith('/my-classes');
    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) return 'Good Morning';
        if (hour >= 12 && hour < 17) return 'Good Afternoon';
        if (hour >= 17 && hour < 22) return 'Good Evening';
        return 'Good Night';
    };
    return (
        <main className="relative min-h-screen bg-white md:bg-[linear-gradient(to_bottom,rgba(103,61,230,0.5)_0%,rgba(103,61,230,0.5)_3%,white_15%,white_100%)]">

            {/* Mobile-only purple banner gradient
                Figma Rectangle9 (/my-classes) → 270px banner
                Figma Rectangle8 (other student pages, e.g. /home-work) → 118px banner */}
            <div
                className={`pointer-events-none absolute top-0 right-0 left-0 z-0 md:hidden ${isMyClassesPage ? 'h-[270px]' : 'h-[140px]'}`}
                style={{
                    background:
                        'linear-gradient(180deg, #C9B6FF 0%, #D9C9FF 25%, #E8DEFF 55%, rgba(255,255,255,0) 100%)',
                }}
            />
            {/* ========================================================= */}
            {/* 📱 MOBILE HEADER (your requested UI style) */}
            {/* ========================================================= */}
            <header className="relative z-10 flex items-center justify-between px-2 py-4 pt-8 md:hidden">
                <div>
                    {isMyClassesPage ? (
                        <p className="mt-1 text-xl font-bold text-[#272727]">{getGreeting()},</p>
                    ) : (
                        <Link href="/my-classes" className="flex items-center gap-2 text-xs font-bold text-[#272727]">
                            <ArrowLeft className="h-5 w-5" />
                            DASHBOARD
                        </Link>
                    )}
                </div>

                {/* Notification + hamburger only on /my-classes — Figma shows
                    other student pages with no right-side icons */}
                {isMyClassesPage && (
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <Link href="/notifications" className="relative">
                            <BellRing className="h-6 w-6 text-[#673DE6]" />
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-500" />
                        </Link>

                        {/* Hamburger Menu */}
                        <button onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                            <Menu className="h-7 w-7 text-[#673DE6]" />
                        </button>
                    </div>
                )}
            </header>

            {/* ========================================================= */}
            {/* 🖥 DESKTOP HEADER */}
            {/* ========================================================= */}
            <header className="container mx-auto hidden px-4 pt-6 md:block">
                <nav className="flex items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2 text-3xl font-bold">
                        <span className="text-[#673DE6]">Tut</span>Star
                    </Link>

                    <Link href="/settings" className="flex items-center gap-3 rounded-full bg-white p-2 shadow">
                        <div className="text-right">
                            <p className="font-semibold">{auth.user.name}</p>
                        </div>
                        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                            {auth.user.profile_image ? (
                                <AvatarImage src={`/storage/${auth.user.profile_image}`} alt={auth.user.name} className="object-cover" />
                            ) : (
                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                    {initials(auth.user.name)}
                                </AvatarFallback>
                            )}
                        </Avatar>
                    </Link>
                </nav>
            </header>

            {/* ========================================================= */}
            {/* GRID LAYOUT (tablet + desktop keeps same look) */}
            {/* ========================================================= */}
            <div className="relative z-10 container mx-auto grid grid-cols-1 gap-4 px-4 md:mt-2 md:grid-cols-[220px_1fr] md:px-2">
                {/* <div className="container mx-auto mt-6 grid grid-cols-1 gap-4 px-4 sm:grid-cols-[180px_1fr] md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]"> */}
                {/* Sidebar for desktop/tablet */}
                <aside className="hidden self-start rounded-2xl bg-white/70 shadow md:sticky md:top-4 md:block">
                    <ul className="space-y-1">
                        {menuItems.map(({ label, href, icon: Icon }) => {
                            const isActive = url.startsWith(href);
                            return (
                                <li key={label}>
                                    <Link
                                        href={href}
                                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                            isActive ? 'bg-[#673DE6]/20 text-[#673DE6]' : 'text-gray-700 hover:bg-[#673DE6]/10'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="pt-6">
                        <Link
                            href={logout()}
                            as="button"
                            onClick={handleLogout}
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-[#673DE6]/10"
                        >
                            <LogOut className="h-5 w-5" /> Logout
                        </Link>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <section className="pb-20 md:pb-0 md:pl-4">{children}</section>
            </div>

            {/* ========================================================= */}
            {/* 📱 MOBILE SLIDE-IN SIDEBAR */}
            {/* ========================================================= */}
            {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}
            {/* <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white p-4 shadow-lg transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}
            >
                <button className="absolute top-4 right-4" onClick={() => setSidebarOpen(false)}>
                    <X className="h-6 w-6" />
                </button>

                <ul className="mt-10 space-y-3">
                    {menuItems.map(({ label, href, icon: Icon }) => (
                        <li key={label}>
                            <Link
                                href={href}
                                onClick={() => setSidebarOpen(false)}
                                className="flex items-center gap-3 rounded-xl p-3 text-gray-700 hover:bg-gray-100"
                            >
                                <Icon className="h-5 w-5" />
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <button onClick={handleLogout} className="mt-6 flex w-full items-center gap-3 rounded-xl p-3 text-red-600 hover:bg-red-50">
                    <LogOut className="h-5 w-5" /> Logout
                </button>
            </aside> */}
            <aside
                className={`fixed inset-y-0 right-0 z-50 w-64 transform bg-white p-4 shadow-lg transition-transform duration-300 md:hidden ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} `}
            >
                {/* Close button */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600 active:scale-95"
                >
                    <X className="h-3 w-3" />
                </button>

                <ul className="mt-10 space-y-3">
                    {menuItems.map(({ label, href, icon: Icon }) => (
                        <li key={label}>
                            <Link
                                href={href}
                                onClick={() => setSidebarOpen(false)}
                                className="flex items-center gap-3 rounded-xl p-3 text-gray-700 hover:bg-gray-100"
                            >
                                <Icon className="h-5 w-5" />
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>



                <Link  href={logout()}
                            as="button" onClick={handleLogout} className="mt-6 flex w-full items-center gap-3 rounded-xl p-3 text-red-600 hover:bg-red-50">
                    <LogOut className="h-5 w-5" /> Logout
                </Link>
            </aside>
            {/* ========================================================= */}
            {/* 📱 MOBILE BOTTOM NAVIGATION (hidden on /home-work and /post-doubt per Figma) */}
            {/* ========================================================= */}
            {!url.startsWith('/home-work') && !url.startsWith('/post-doubt') && (
                <nav className="fixed bottom-0 left-0 w-full border-t bg-white shadow md:hidden">
                    <div className="flex justify-around py-2">
                        <NavIcon href="/my-classes" label="Home" icon={School} url={url} />
                        <NavIcon href="/schedule" label="Calendar" icon={Calendar} url={url} />
                        {/* <NavIcon href="/my-classes" label="Courses" icon={HandCoins} url={url} /> */}
                        <NavIcon href="/settings" label="Me" icon={CircleUserRound} url={url} />
                    </div>
                </nav>
            )}

            <Dialog open={showClassSelectionPopup} onOpenChange={setPopupOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select Your Class</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">Please select your class to continue and see plans/offers.</p>
                    <div className="space-y-3 pt-2">
                        <div>
                            <p className="mb-1 text-sm font-medium">Board</p>
                            <Select
                                value={selectedBoard}
                                onValueChange={(value) => {
                                    setSelectedBoard(value);
                                    setSelectedClass('');
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select board" />
                                </SelectTrigger>
                                <SelectContent>
                                    {boards.map((board) => (
                                        <SelectItem key={board.id} value={String(board.id)}>
                                            {board.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <p className="mb-1 text-sm font-medium">Class</p>
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classesForSelectedBoard.map((item) => (
                                    <SelectItem key={item.id} value={String(item.id)}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setPopupOpen(false)}>
                            Close
                        </Button>
                        <Button type="button" onClick={handleSavePreferredClass} disabled={!selectedBoard || !selectedClass}>
                            Save Class
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}

/* Mobile bottom nav item */
function NavIcon({ href, label, icon: Icon, url }) {
    const isActive = url.startsWith(href);
    return (
        <Link href={href} className={`flex flex-col items-center text-xs ${isActive ? 'text-[#673DE6]' : 'text-gray-600'}`}>
            <Icon size={22} />
            <span className="text-[11px]">{label}</span>
        </Link>
    );
}
