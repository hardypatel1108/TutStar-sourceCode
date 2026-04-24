import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/teacher/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard, todayClasses } from '@/routes/teacher';
// import { index as batchIndex } from '@/routes/teacher/batches';

import { index as batchIndex } from '@/routes/teacher/allotted-batches';
import { index as doubts } from '@/routes/teacher/doubts';
import { index as homeworks } from '@/routes/teacher/homeworks';
import { index as practiceTests } from '@/routes/teacher/practiceTests';
import { index as classSessions } from '@/routes/teacher/upcoming-classes';

import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Bell, ClipboardClock, LayoutGrid, MessageCircleQuestionMark, Notebook, Shapes, SwatchBook } from 'lucide-react';
import AppLogo from './../app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
    {
        title: 'Batches',
        href: batchIndex().url,
        icon: SwatchBook,
    },
    // {
    //     title: 'Batch Schedules',
    //     href: batchSchedule().url,
    //     icon: ClipboardClock,
    // },
    // {
    //     title: 'Batch Students',
    //     href: batchStudents().url,
    //     icon: FileUser,
    // },
    // {
    //     title: 'Checkout Offers',
    //     href: checkoutOffers().url,
    //     icon: PackageSearch,
    // },
    {
        title: 'Upcoming Classes',
        href: classSessions().url,
        icon: Shapes,
    },
    {
        title: 'Today Classes',
        href: todayClasses().url,
        icon: ClipboardClock,
    },
    {
        title: 'Doubts',
        href: doubts().url,
        icon: MessageCircleQuestionMark,
    },
    {
        title: 'Notifications',
        href: '/teacher/notifications',
        icon: Bell,
    },
    // {
    //     title: 'Events',
    //     href: events().url,
    //     icon: CalendarFold,
    // },
    // {
    //     title: 'Feedbacks',
    //     href: feedbacks().url,
    //     icon: MessageSquareWarning,
    // },
    {
        title: 'Homeworks',
        href: homeworks().url,
        icon: Notebook,
    },
    // {
    //     title: 'Payments',
    //     href: payments().url,
    //     icon: BadgeIndianRupee,
    // },
    // {
    //     title: 'Plans',
    //     href: plans().url,
    //     icon: NotebookPen,
    // },
    // {
    //     title: 'Plan Offers',
    //     href: planOffers().url,
    //     icon: BadgePercent,
    // },
    {
        title: 'Practice Tests',
        href: practiceTests().url,
        icon: Notebook,
    },
    // {
    //     title: 'Students',
    //     href: students().url,
    //     icon: BookUser,
    // },
    // {
    //     title: 'Student Subscriptions',
    //     href: studentSubscriptions().url,
    //     icon: Podcast,
    // },
    // {
    //     title: 'Subjects',
    //     href: subjects().url,
    //     icon: Captions,
    // },
    // {
    //     title: 'Teachers',
    //     href: teachers().url,
    //     icon: HatGlasses,
    // },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
