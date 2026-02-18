/**
 * LAYER 1: NETWORK DETECTION UTILITY
 *
 * Uses multiple CORS-safe public IP APIs with fallback chain.
 * Validates college network by IP range (111.93.108.x / 111.93.109.x)
 * and ISP name (Tata Teleservices).
 */

// Try multiple APIs in order until one works
const IP_APIS = [
    () => fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(4000) })
        .then(r => r.json()).then(d => ({ query: d.ip })),

    () => fetch('https://api4.my-ip.io/v2/ip.json', { signal: AbortSignal.timeout(4000) })
        .then(r => r.json()).then(d => ({ query: d.ip })),

    () => fetch('https://ipinfo.io/json', { signal: AbortSignal.timeout(4000) })
        .then(r => r.json()).then(d => ({ query: d.ip, org: d.org })),

    () => fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(4000) })
        .then(r => r.json()).then(d => ({ query: d.ipAddress, org: d.isp })),
];

const FULL_INFO_APIS = [
    () => fetch('https://ipinfo.io/json', { signal: AbortSignal.timeout(5000) })
        .then(r => r.json()).then(d => ({
            query: d.ip, org: d.org, city: d.city, status: 'success'
        })),

    () => fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(5000) })
        .then(r => r.json()).then(d => ({
            query: d.ipAddress, org: d.isp, city: d.cityName, status: 'success'
        })),
];

/**
 * Try each API in sequence, return first successful result
 */
const tryAPIs = async (apis) => {
    for (const apiFn of apis) {
        try {
            const result = await apiFn();
            if (result?.query) return result;
        } catch {
            // Try next
        }
    }
    return null;
};

/**
 * Main: detect public IP
 */
export const detectLocalIP = async () => {
    const info = await tryAPIs(IP_APIS);
    if (info?.query) return info.query;
    throw new Error('Could not detect IP. Check your internet connection.');
};

/**
 * Get full network info (IP + ISP)
 */
export const getFullNetworkInfo = async () => {
    const info = await tryAPIs(FULL_INFO_APIS);
    return info || {};
};

/**
 * Get subnet pattern from IP
 */
export const getSubnetFromIP = (ip) => {
    if (!ip) return null;
    const p = ip.split('.');
    if (p.length !== 4) return null;
    return `${p[0]}.${p[1]}.${p[2]}.xxx`;
};

/**
 * Validate IP against subnet patterns
 * Supports: '111.93.108.xxx', '*', exact IP
 */
export const validateClassroomNetwork = (ip, allowedSubnets) => {
    if (!ip) return false;
    if (!allowedSubnets || allowedSubnets.length === 0) return true;
    if (allowedSubnets.includes('*') || allowedSubnets.includes('any')) return true;

    return allowedSubnets.some(subnet => {
        if (subnet === ip) return true;
        const pattern = subnet
            .replace(/\./g, '\\.')
            .replace(/xxx/g, '[0-9]{1,3}')
            .replace(/\*/g, '.*');
        try {
            return new RegExp(`^${pattern}$`).test(ip);
        } catch {
            return false;
        }
    });
};

/**
 * Validate by ISP/ASN name
 */
export const validateByISP = (ipInfo, allowedKeywords) => {
    if (!ipInfo || !allowedKeywords?.length) return false;
    const orgStr = `${ipInfo.org || ''} ${ipInfo.isp || ''}`.toLowerCase();
    return allowedKeywords.some(kw => orgStr.includes(kw.toLowerCase()));
};

export const isWebRTCSupported = () =>
    !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection);

export const isPrivateIP = (ip) => ip && (
    ip.startsWith('10.') || ip.startsWith('192.168.') || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip)
);
