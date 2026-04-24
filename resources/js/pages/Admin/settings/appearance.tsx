import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/admin/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AdminLayout from '@/layouts/admin-layout';
import SettingsLayout from '@/layouts/admin/settings/layout';
import { appearance } from '@/routes/admin';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: appearance().url,
    },
];

export default function Appearance() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AdminLayout>
    );
}
