import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    childrendivClassName?: string;
    mainDivClassName?: string;
}

export default function AuthSimpleLayout({ children, title, description,  titleClassName, descriptionClassName, childrendivClassName, mainDivClassName }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className={`w-full max-w-sm ${mainDivClassName}`}>
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={home()} className="flex flex-col items-center gap-2 font-medium">
                            <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                {/* <AppLogoIcon className="size-9 fill-current text-[var(--foreground)] dark:text-white" /> */}
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className={`text-xl font-medium ${titleClassName}`}>{title}</h1>
                            <p className={`text-center text-sm text-muted-foreground ${descriptionClassName}`}>{description}</p>
                        </div>
                    </div>
                    <div className={`w-full max-w-sm ${childrendivClassName}`}>{children}</div>
                </div>
            </div>
        </div>
    );
}
