export type ThemeSegment = 'ninos' | 'jovenes' | 'adultos';

export type ThemeMode = 'light' | 'dark' | 'auto';

export type Preferences = {
    id?: number;
    theme_segment: ThemeSegment;
    theme_mode: ThemeMode;
    font_scale: number;
    high_contrast: boolean;
    sidebar_open: boolean;
};

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    phone: string | null;
    active: boolean;
    last_login_at: string | null;
    roles: string[];
    permissions: string[];
    patient_id: number | null;
    doctor_id: number | null;
    preferences: Preferences | null;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type MenuItem = {
    id: number;
    label: string;
    icon: string | null;
    routeName: string | null;
    url: string | null;
    permission: string | null;
    children: MenuItem[];
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
