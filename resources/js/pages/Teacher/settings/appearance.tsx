import { Head } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import AppearanceTabs from '@/components/teacher/appearance-tabs';
import { type BreadcrumbItem } from '@/types';

import SettingsLayout from '@/layouts/teacher/settings/layout';
import TeacherLayout from '@/layouts/teacher-layout';
import { appearance } from '@/routes/teacher';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: appearance().url,
    },
];

export default function Appearance() {
    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </TeacherLayout>
    );
}
