import { usePage } from '@inertiajs/react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import type { Preferences, ThemeMode, ThemeSegment } from '@/types';

type PreferencesContextValue = {
    preferences: Preferences;
    resolvedMode: 'light' | 'dark';
    updatePreferences: (changes: Partial<Preferences>) => void;
    setSegment: (segment: ThemeSegment) => void;
    setMode: (mode: ThemeMode) => void;
    setFontScale: (scale: number) => void;
    toggleHighContrast: () => void;
};

const defaultPreferences: Preferences = {
    theme_segment: 'adultos',
    theme_mode: 'auto',
    font_scale: 100,
    high_contrast: false,
    sidebar_open: true,
};

const STORAGE_KEY = 'clinica.preferences';

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function prefersDark(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveMode(mode: ThemeMode): 'light' | 'dark' {
    return mode === 'dark' || (mode === 'auto' && prefersDark())
        ? 'dark'
        : 'light';
}

function storedPreferences(): Partial<Preferences> {
    if (typeof window === 'undefined') {
        return {};
    }

    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    } catch {
        return {};
    }
}

function applyPreferences(preferences: Preferences): void {
    if (typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;
    const resolved = resolveMode(preferences.theme_mode);

    root.dataset.segment = preferences.theme_segment;
    root.dataset.contrast = preferences.high_contrast ? 'high' : 'normal';
    root.style.setProperty(
        '--font-scale',
        String(preferences.font_scale / 100),
    );
    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;
}

function csrfToken(): string {
    const cookie = document.cookie
        .split('; ')
        .find((item) => item.startsWith('XSRF-TOKEN='));

    return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const page = usePage();
    const serverPreferences = page.props.preferences;

    const [preferences, setPreferences] = useState<Preferences>(() => {
        return {
            ...defaultPreferences,
            ...storedPreferences(),
            ...serverPreferences,
        };
    });

    const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>(() =>
        resolveMode(preferences.theme_mode),
    );

    useEffect(() => {
        if (!serverPreferences) {
            return;
        }

        setPreferences((current) => ({ ...current, ...serverPreferences }));
    }, [serverPreferences]);

    useEffect(() => {
        const resolved = resolveMode(preferences.theme_mode);
        setResolvedMode(resolved);
        applyPreferences(preferences);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    }, [preferences]);

    useEffect(() => {
        if (preferences.theme_mode !== 'auto') {
            return;
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            setResolvedMode(resolveMode('auto'));
            applyPreferences(preferences);
        };

        media.addEventListener('change', handler);

        return () => media.removeEventListener('change', handler);
    }, [preferences]);

    const updatePreferences = useCallback((changes: Partial<Preferences>) => {
        setPreferences((current) => {
            const next = { ...current, ...changes };

            void fetch('/api/v1/preferences', {
                method: 'PATCH',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify(next),
            }).catch(() => undefined);

            return next;
        });
    }, []);

    const value = useMemo<PreferencesContextValue>(
        () => ({
            preferences,
            resolvedMode,
            updatePreferences,
            setSegment: (theme_segment) => updatePreferences({ theme_segment }),
            setMode: (theme_mode) => updatePreferences({ theme_mode }),
            setFontScale: (font_scale) => updatePreferences({ font_scale }),
            toggleHighContrast: () =>
                updatePreferences({
                    high_contrast: !preferences.high_contrast,
                }),
        }),
        [preferences, resolvedMode, updatePreferences],
    );

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences(): PreferencesContextValue {
    const context = useContext(PreferencesContext);

    if (!context) {
        throw new Error(
            'usePreferences debe usarse dentro de PreferencesProvider',
        );
    }

    return context;
}
