const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || '';

let liffObject: any = null;
let initPromise: Promise<void> | null = null;

export async function initLiff(): Promise<void> {
    if (typeof window === 'undefined') return;

    if (initPromise) return initPromise;

    initPromise = (async () => {
        const liff = (await import('@line/liff')).default;
        await liff.init({ liffId: LIFF_ID });
        liffObject = liff;
    })();

    return initPromise;
}

export function getLiff() {
    return liffObject;
}

export async function getLiffProfile(): Promise<{
    userId: string;
    displayName: string;
    pictureUrl?: string;
} | null> {
    if (!liffObject) return null;

    if (!liffObject.isLoggedIn()) {
        liffObject.login();
        return null;
    }

    try {
        const profile = await liffObject.getProfile();
        return {
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
        };
    } catch (error) {
        console.error('Error getting LIFF profile:', error);
        return null;
    }
}

export function isInLiffClient(): boolean {
    if (!liffObject) return false;
    return liffObject.isInClient();
}

export function closeLiff(): void {
    if (liffObject && liffObject.isInClient()) {
        liffObject.closeWindow();
    }
}
