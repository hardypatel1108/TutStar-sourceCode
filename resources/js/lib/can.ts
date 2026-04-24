import { usePage } from '@inertiajs/react';

export function can(permission: string): boolean {
    const { auth } = usePage().props as {
        auth: {
            permissions: string[];
            roles: string[];
        };
    };
    return auth.permissions.includes(permission);
}

export function hasRole(role: string): boolean {
    const { auth } = usePage().props as {
        auth: { roles: string[] };
    };
    return auth.roles.includes(role);
}