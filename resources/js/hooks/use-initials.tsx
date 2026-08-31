import { useCallback } from 'react';

export type GetInitialsFn = (fullName?: string | null) => string;

export function useInitials(): GetInitialsFn {
    return useCallback((fullName?: string | null): string => {
        const names = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];

        if (names.length === 0) {
            return '';
        }

        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase();
        }

        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }, []);
}
