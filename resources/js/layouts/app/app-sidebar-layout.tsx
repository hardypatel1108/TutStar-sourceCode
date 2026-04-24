import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { Navbar } from '@/components/navbar';
import { UserNavbar } from '@/components/usernavbar';
import { Head, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
        const { auth } = usePage<SharedData>().props;
    
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                 {/* <div className="flex flex-col items-center bg-[#FDFDFC] p-8 text-[#1b1b18] lg:justify-center dark:bg-[#0a0a0a]">
                <header className="w-full text-sm not-has-[nav]:hidden lg:max-w-7xl">
                    <Navbar />
                    {auth.user && <UserNavbar />}
                </header>
            </div> */}
                {/* <AppSidebarHeader breadcrumbs={breadcrumbs} /> */}
                {children}
            </AppContent>
        </AppShell>
    );
}
