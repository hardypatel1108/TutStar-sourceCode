import TeacherLayoutTemplate from '@/layouts/teacher/sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AdminLayoutProps) => (
    <TeacherLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
    </TeacherLayoutTemplate>
);
