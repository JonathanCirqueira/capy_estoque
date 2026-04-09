// Components
import { Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { logout } from '@/routes';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form className="space-y-6 text-center">
                <Button variant="secondary">
                    Resend verification email
                </Button>

                <TextLink href={logout()} className="mx-auto block text-sm">
                    Log out
                </TextLink>
            </form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verify email',
    description: 'Please verify your email address by clicking on the link we just emailed to you.',
};
