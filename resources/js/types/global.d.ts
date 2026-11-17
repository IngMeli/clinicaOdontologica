import type { Auth, MenuItem, Preferences } from '@/types/auth';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            menu: MenuItem[];
            preferences: Preferences | null;
            visits: {
                current: number;
                total: number;
            };
            flash: {
                success?: string | null;
                error?: string | null;
            };
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
