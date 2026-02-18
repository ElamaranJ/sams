/**
 * LAYER 2: DEVICE BINDING UTILITY
 *
 * Strategy: Generate a UUID on first visit and store it in localStorage.
 * This UUID acts as the "device ID" — it's unique per browser installation.
 *
 * - First visit: generate UUID → save to localStorage → register in Firestore
 * - Next visits: read UUID from localStorage → compare with Firestore
 * - If localStorage is cleared: treated as new device (re-registration needed)
 *
 * This is simple, reliable, and works on all browsers without any permissions.
 */

const DEVICE_ID_KEY = 'sams_device_id';

/**
 * Generate a UUID v4
 */
const generateUUID = () => {
    if (crypto?.randomUUID) return crypto.randomUUID();
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * Get or create the device ID from localStorage.
 * Always returns the same ID for the same browser installation.
 */
export const getOrCreateDeviceId = () => {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = generateUUID();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
};

/**
 * Get basic device info for display purposes (not used for matching)
 */
export const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    if (ua.includes('Firefox')) browser = `Firefox ${ua.match(/Firefox\/([\d.]+)/)?.[1] || ''}`;
    else if (ua.includes('Edg')) browser = `Edge ${ua.match(/Edg\/([\d.]+)/)?.[1] || ''}`;
    else if (ua.includes('Chrome')) browser = `Chrome ${ua.match(/Chrome\/([\d.]+)/)?.[1] || ''}`;
    else if (ua.includes('Safari')) browser = `Safari ${ua.match(/Version\/([\d.]+)/)?.[1] || ''}`;

    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return {
        browser,
        os,
        screenResolution: `${screen.width}×${screen.height}`,
        platform: navigator.platform || 'Unknown',
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
};

/**
 * Generate device fingerprint — now just returns the localStorage UUID
 * Kept for backward compatibility with DeviceRegistration component
 */
export const generateDeviceFingerprint = async () => {
    const deviceId = getOrCreateDeviceId();
    const info = getDeviceInfo();
    return {
        deviceHash: deviceId,
        deviceInfo: info,
        confidence: 'high'
    };
};

/**
 * Compare two device IDs
 */
export const compareDeviceFingerprints = (id1, id2) => id1 === id2;

/**
 * Always supported — just needs localStorage
 */
export const isDeviceFingerprintingSupported = () => {
    try {
        localStorage.setItem('_test', '1');
        localStorage.removeItem('_test');
        return true;
    } catch {
        return false;
    }
};
