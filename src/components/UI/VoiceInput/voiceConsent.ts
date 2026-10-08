const STORAGE_KEY = 'voice-input-consent-v1';

let memoryConsent = false;

export function hasVoiceConsent(): boolean {
    if (memoryConsent) return true;
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

export function grantVoiceConsent(): void {
    memoryConsent = true;
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
    }
}

export function revokeVoiceConsent(): void {
    memoryConsent = false;
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {}
}