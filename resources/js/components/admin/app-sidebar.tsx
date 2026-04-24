import { NavUser } from '@/components/admin/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes/admin';
import { index as batchIndex } from '@/routes/admin/batches';
import { index as batchStudents } from '@/routes/admin/batchStudents';
import { index as boardIndex } from '@/routes/admin/boards';
import { index as checkoutOffers } from '@/routes/admin/checkoutOffers';
import { index as checkoutPlans } from '@/routes/admin/checkoutPlans';
import { index as clazzes } from '@/routes/admin/classes';
import { index as classSessions } from '@/routes/admin/classSessions';
import { index as doubts } from '@/routes/admin/doubts';
import { index as events } from '@/routes/admin/events';
import { index as homeworks } from '@/routes/admin/homeworks';
import { index as payments } from '@/routes/admin/payments';
import { index as planOffers } from '@/routes/admin/planOffers';
import { index as plans } from '@/routes/admin/plans';
import { index as practiceTests } from '@/routes/admin/practiceTests';
import { index as students } from '@/routes/admin/students';
// import { index as studentSubscriptions } from '@/routes/admin/studentSubscriptions';
import { index as pendingEnrollments } from '@/routes/admin/pendingEnrollments';
import { index as subjects } from '@/routes/admin/subjects';
import { index as teachers } from '@/routes/admin/teachers';

import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BadgeIndianRupee,
    BadgePercent,
    BookUser,
    CalendarFold,
    // Podcast,
    Captions,
    FileUser,
    HatGlasses,
    LayoutGrid,
    MessageCircleQuestionMark,
    Notebook,
    NotebookPen,
    PackageSearch,
    Presentation,
    School,
    Shapes,
    SwatchBook,
} from 'lucide-react';
import AppLogo from './../app-logo';

const navSections: NavSection[] = [
    {
        heading: 'Dashboard',
        items: [{ title: 'Dashboard', href: dashboard().url, icon: LayoutGrid }],
    },
    {
        heading: 'Academics',
        items: [
            { title: 'Boards', href: boardIndex().url, icon: School },
            { title: 'Classes', href: clazzes().url, icon: Presentation },
            { title: 'Subjects', href: subjects().url, icon: Captions },
            { title: 'Teachers', href: teachers().url, icon: HatGlasses },
        ],
    },
    {
        heading: 'Batches',
        items: [
            { title: 'Batches', href: batchIndex().url, icon: SwatchBook },
            { title: 'Batch Students', href: batchStudents().url, icon: FileUser },
            { title: 'Class Sessions', href: classSessions().url, icon: Shapes },
            { title: 'Homeworks', href: homeworks().url, icon: Notebook },
            { title: 'Practice Tests', href: practiceTests().url, icon: Notebook },
        ],
    },
    {
        heading: 'Student Services',
        items: [
            { title: 'Students', href: students().url, icon: BookUser },
            { title: 'Doubts', href: doubts().url, icon: MessageCircleQuestionMark },
            { title: 'Events', href: events().url, icon: CalendarFold },
        ],
    },
    {
        heading: 'Billing & Plans',
        items: [
            { title: 'Plans', href: plans().url, icon: NotebookPen },
            { title: 'Plan Offers', href: planOffers().url, icon: BadgePercent },
            { title: 'Checkout Plans', href: checkoutPlans().url, icon: PackageSearch },
            { title: 'Checkout Offers', href: checkoutOffers().url, icon: PackageSearch },
            { title: 'Payments', href: payments().url, icon: BadgeIndianRupee },
            { title: 'Pending Enrollments', href: pendingEnrollments().url, icon: BadgeIndianRupee },
        ],
    },
];

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
    {
        title: 'Boards',
        href: boardIndex().url,
        icon: School,
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
    {
        title: 'Batch Students',
        href: batchStudents().url,
        icon: FileUser,
    },
    {
        title: 'Checkout Plans',
        href: checkoutPlans().url,
        icon: PackageSearch,
    },
    {
        title: 'Checkout Offers',
        href: checkoutOffers().url,
        icon: PackageSearch,
    },
    {
        title: 'Class Sessions',
        href: classSessions().url,
        icon: Shapes,
    },
    {
        title: 'Classes',
        href: clazzes().url,
        icon: Presentation,
    },
    {
        title: 'Doubts',
        href: doubts().url,
        icon: MessageCircleQuestionMark,
    },
    {
        title: 'Events',
        href: events().url,
        icon: CalendarFold,
    },
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
    {
        title: 'Payments',
        href: payments().url,
        icon: BadgeIndianRupee,
    },
    {
        title: 'Pending Enrollments',
        href: pendingEnrollments().url,
        icon: BadgeIndianRupee,
    },

    {
        title: 'Plans',
        href: plans().url,
        icon: NotebookPen,
    },
    {
        title: 'Plan Offers',
        href: planOffers().url,
        icon: BadgePercent,
    },
    {
        title: 'Practice Tests',
        href: practiceTests().url,
        icon: Notebook,
    },
    {
        title: 'Students',
        href: students().url,
        icon: BookUser,
    },
    // {
    //     title: 'Student Subscriptions',
    //     href: studentSubscriptions().url,
    //     icon: Podcast,
    // },
    {
        title: 'Subjects',
        href: subjects().url,
        icon: Captions,
    },
    {
        title: 'Teachers',
        href: teachers().url,
        icon: HatGlasses,
    },
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
                {navSections.map((section) => (
                    <div key={section.heading} className="mb-4">
                        <p className="px-4 pb-2 text-xs font-semibold text-gray-500 uppercase">{section.heading}</p>

                        <SidebarMenu>
                            {section.items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.href}>
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.title}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </div>
                ))}
                {/* <NavMain items={mainNavItems} /> */}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
