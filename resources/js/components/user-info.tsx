import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { useMemo, useState } from 'react';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();
    const [hasImageError, setHasImageError] = useState(false);

    const imageSrc = useMemo(() => {
        const value = user.profile_image as string | undefined;

        if (!value) {
            return null;
        }

        // Support both absolute URLs and storage-relative paths.
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
            return value;
        }

        return `/storage/${value}`;
    }, [user.profile_image]);

    const displayName = user.first_name || user.name || 'User';

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                {imageSrc && !hasImageError && <AvatarImage src={imageSrc} alt={user.name} onError={() => setHasImageError(true)} />}
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name || displayName)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Hi {displayName} !</span>
                {showEmail && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
            </div>
        </>
    );
}
