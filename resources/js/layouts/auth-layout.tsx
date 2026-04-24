import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({ children, title, description, titleClassName, descriptionClassName, childrendivClassName, mainDivClassName, ...props }: { children: React.ReactNode; title: string; description: string; titleClassName: string; descriptionClassName: string, childrendivClassName: string, mainDivClassName: string  }) {
    return (
        <AuthLayoutTemplate title={title} description={description} titleClassName={titleClassName} descriptionClassName={descriptionClassName} childrendivClassName={childrendivClassName} mainDivClassName={mainDivClassName} {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}
