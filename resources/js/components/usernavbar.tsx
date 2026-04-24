'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import { SidebarMenuButton } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';

import { dashboard, logout } from '@/routes';
import { edit } from '@/routes/profile';
import { index as roles } from '@/routes/roles';
import { index as users } from '@/routes/users';
import { type NavItem, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, LayoutGrid, LogOut, Menu, Presentation, Settings, UsersRound } from 'lucide-react';

import { useEffect, useState } from 'react';

export const UserNavbar = () => {
    const { url } = usePage();

    const { auth } = usePage<SharedData>().props;
    const cleanup = useMobileNavigation();

    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < lastScrollY || currentScrollY < 10) setShowNavbar(true);
            else if (currentScrollY > lastScrollY && currentScrollY > 100) setShowNavbar(false);
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const mainNavItems: NavItem[] = [
        ...(auth?.user
            ? [
                  { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
                  // ...(hasRole('admin')
                  // ? [
                //   { title: 'User', href: users().url, icon: UsersRound },
                  //   { title: 'Freebies', href: freebies().url, icon: FileText },
                  //   { title: 'Useful tools', href: usefulTools().url, icon: FileText },
                  //   { title: 'Club meetups', href: clubMeetups().url, icon: Presentation },
                //   { title: 'Roles', href: roles().url, icon: Presentation },
                  //   ]
                  // : []),
              ]
            : []),
        // { title: 'About us', href: about().url, icon: LayoutGrid },
        // { title: 'Freebies pdf\'s', href: freebies_pdf().url, icon: LayoutGrid },
        // { title: 'Tools', href: tools().url, icon: LayoutGrid },
        // { title: 'Meetups', href: meetups().url, icon: LayoutGrid },
    ];

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <div className={`fixed top-16 right-0 left-0 z-40 transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="container mx-auto px-4">
                <div className="flex h-14 items-center justify-between">
                    {/* Left Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Menu />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <UserInfo user={auth.user} showEmail={true} />
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                {mainNavItems.map((item) => (
                                    <DropdownMenuItem key={item.title}>
                                        <Link
                                            href={item.href}
                                            prefetch
                                            className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition ${
                                                url.startsWith(typeof item.href === 'string' ? item.href : item.href.url)
                                                    ? 'bg-muted font-medium text-primary'
                                                    : 'text-muted-foreground hover:bg-muted'
                                            }`}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link className="block w-full" href={edit()} as="button" prefetch onClick={cleanup}>
                                        <Settings className="mr-2" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link className="block w-full" href={logout()} as="button" onClick={handleLogout}>
                                    <LogOut className="mr-2" />
                                    Log out
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Right - Notifications */}
                    {auth.user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <div className="border-b border-border px-4 py-3">
                                    <h3 className="text-sm font-semibold">Notifications</h3>
                                </div>
                                <div className="p-4 text-sm text-muted-foreground">No new notifications</div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </div>
    );
};
