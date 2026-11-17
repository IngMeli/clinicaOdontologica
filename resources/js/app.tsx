import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType, ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PreferencesProvider } from '@/hooks/use-preferences';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Clínica Odontológica';

function withPreferences<P extends object>(Layout: ComponentType<P>) {
    return function LayoutWithPreferences(props: P) {
        return (
            <PreferencesProvider>
                <Layout {...props} />
            </PreferencesProvider>
        );
    };
}

const AppLayoutWithPreferences = withPreferences(AppLayout);
const AuthLayoutWithPreferences = withPreferences(AuthLayout);
const SettingsLayoutWithPreferences = withPreferences(SettingsLayout);

function WelcomeLayout({ children }: { children: ReactNode }) {
    return <PreferencesProvider>{children}</PreferencesProvider>;
}

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return WelcomeLayout;
            case name.startsWith('auth/'):
                return AuthLayoutWithPreferences;
            case name.startsWith('settings/'):
                return [
                    AppLayoutWithPreferences,
                    SettingsLayoutWithPreferences,
                ];
            default:
                return AppLayoutWithPreferences;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#0f766e',
    },
});
