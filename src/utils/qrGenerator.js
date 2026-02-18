/**
 * LAYER 4: QR CODE GENERATION & ENCRYPTION UTILITY
 * 
 * Purpose: Generate rotating QR codes that expire every 10 seconds
 * QR contains encrypted data: Subject + Faculty ID + Timestamp + Random Salt
 * 
 * Security features:
 * - AES encryption of QR payload
 * - 10-second expiration
 * - Random salt to prevent replay attacks
 * - Timestamp validation
 */

/**
 * Simple AES-like encryption (for demonstration - use crypto-js in production)
 * @param {string} text - Text to encrypt
 * @param {string} key - Encryption key
 * @returns {string} Encrypted text (base64)
 */
const encrypt = (text, key) => {
    // Simple XOR encryption for demonstration
    // In production, use crypto-js AES encryption
    const keyBytes = new TextEncoder().encode(key);
    const textBytes = new TextEncoder().encode(text);
    const encrypted = new Uint8Array(textBytes.length);

    for (let i = 0; i < textBytes.length; i++) {
        encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    return btoa(String.fromCharCode(...encrypted));
};

/**
 * Simple decryption
 * @param {string} encryptedText - Encrypted text (base64)
 * @param {string} key - Decryption key
 * @returns {string} Decrypted text
 */
const decrypt = (encryptedText, key) => {
    try {
        const keyBytes = new TextEncoder().encode(key);
        const encrypted = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
        const decrypted = new Uint8Array(encrypted.length);

        for (let i = 0; i < encrypted.length; i++) {
            decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
        }

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        throw new Error('Decryption failed');
    }
};

/**
 * Generates random salt
 * @param {number} length - Salt length
 * @returns {string} Random salt
 */
const generateSalt = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let salt = '';
    for (let i = 0; i < length; i++) {
        salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return salt;
};

/**
 * Generates QR code payload with encryption
 * @param {Object} classData - Class session data
 * @param {string} classData.subjectId - Subject ID
 * @param {string} classData.facultyId - Faculty ID
 * @param {string} classData.classroomId - Classroom ID
 * @param {string} classData.sessionId - Session ID
 * @param {string} secretKey - Encryption secret key
 * @returns {Object} QR data with encrypted payload and expiry
 */
export const generateQRPayload = (classData, secretKey) => {
    const timestamp = Date.now();
    const expiresAt = timestamp + 10000; // 10 seconds from now
    const salt = generateSalt();

    const payload = {
        subjectId: classData.subjectId,
        facultyId: classData.facultyId,
        classroomId: classData.classroomId,
        sessionId: classData.sessionId,
        timestamp: timestamp,
        expiresAt: expiresAt,
        salt: salt
    };

    // Encrypt payload
    const payloadString = JSON.stringify(payload);
    const encrypted = encrypt(payloadString, secretKey);

    return {
        encrypted: encrypted,
        expiresAt: expiresAt,
        payload: payload // For debugging only - don't send to client
    };
};

/**
 * Validates and decrypts QR code payload
 * @param {string} encryptedPayload - Encrypted QR payload
 * @param {string} secretKey - Decryption secret key
 * @returns {Object} Validation result with payload if valid
 */
export const validateQRPayload = (encryptedPayload, secretKey) => {
    try {
        // Decrypt payload
        const decryptedString = decrypt(encryptedPayload, secretKey);
        const payload = JSON.parse(decryptedString);

        // Validate expiry
        const now = Date.now();
        if (now > payload.expiresAt) {
            return {
                valid: false,
                error: 'QR code expired',
                errorCode: 'EXPIRED'
            };
        }

        // Validate required fields
        if (!payload.subjectId || !payload.facultyId || !payload.sessionId) {
            return {
                valid: false,
                error: 'Invalid QR code data',
                errorCode: 'INVALID_DATA'
            };
        }

        return {
            valid: true,
            payload: payload,
            remainingTime: payload.expiresAt - now
        };

    } catch (error) {
        return {
            valid: false,
            error: 'Failed to decrypt QR code',
            errorCode: 'DECRYPTION_FAILED'
        };
    }
};

/**
 * Generates QR code data URL (requires qrcode library or use API)
 * @param {string} data - Data to encode in QR
 * @returns {Promise<string>} QR code as data URL
 */
export const generateQRCodeDataURL = async (data) => {
    // Simple QR generation using API (for demonstration)
    // In production, use qrcode library
    const size = 300;
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;

    try {
        const response = await fetch(apiUrl);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('QR generation failed:', error);
        return null;
    }
};

/**
 * Starts QR rotation (generates new QR every 10 seconds)
 * @param {Object} classData - Class session data
 * @param {string} secretKey - Encryption key
 * @param {Function} callback - Callback function to receive new QR
 * @returns {Function} Cleanup function to stop rotation
 */
export const startQRRotation = (classData, secretKey, callback) => {
    // Generate initial QR
    const generateAndSend = async () => {
        const qrData = generateQRPayload(classData, secretKey);
        const qrImageUrl = await generateQRCodeDataURL(qrData.encrypted);

        callback({
            qrImageUrl: qrImageUrl,
            encrypted: qrData.encrypted,
            expiresAt: qrData.expiresAt,
            remainingTime: 10000
        });
    };

    // Generate first QR immediately
    generateAndSend();

    // Set up rotation interval
    const intervalId = setInterval(generateAndSend, 10000);

    // Return cleanup function
    return () => clearInterval(intervalId);
};

/**
 * Calculates remaining time for QR code
 * @param {number} expiresAt - Expiry timestamp
 * @returns {number} Remaining milliseconds
 */
export const getRemainingTime = (expiresAt) => {
    const remaining = expiresAt - Date.now();
    return Math.max(0, remaining);
};

/**
 * Generates a 6-digit OTP for a session (valid for 60 seconds)
 * OTP is derived from sessionId + current 60s time window
 * Faculty and student both compute the same OTP independently
 *
 * @param {string} sessionId - The active session ID
 * @param {string} secretKey - Shared secret key
 * @returns {{ otp: string, expiresAt: number }}
 */
export const generateSessionOTP = (sessionId, secretKey) => {
    const window = Math.floor(Date.now() / 60000); // 60-second window
    const raw = `${sessionId}:${secretKey}:${window}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
    }
    const otp = String(Math.abs(hash) % 1000000).padStart(6, '0');
    const expiresAt = (window + 1) * 60000;
    return { otp, expiresAt };
};

/**
 * Validates an OTP entered by the student
 * Checks current window AND previous window (to handle edge cases)
 *
 * @param {string} enteredOTP - 6-digit OTP entered by student
 * @param {string} sessionId - The active session ID
 * @param {string} secretKey - Shared secret key
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateSessionOTP = (enteredOTP, sessionId, secretKey) => {
    if (!enteredOTP || enteredOTP.length !== 6) {
        return { valid: false, error: 'OTP must be 6 digits' };
    }
    const now = Math.floor(Date.now() / 60000);
    // Check current and previous window (grace period)
    for (const w of [now, now - 1]) {
        const raw = `${sessionId}:${secretKey}:${w}`;
        let hash = 0;
        for (let i = 0; i < raw.length; i++) {
            hash = ((hash << 5) - hash) + raw.charCodeAt(i);
            hash |= 0;
        }
        const expected = String(Math.abs(hash) % 1000000).padStart(6, '0');
        if (enteredOTP === expected) {
            return { valid: true };
        }
    }
    return { valid: false, error: 'Invalid or expired OTP. Ask faculty for the current code.' };
};


/**
 * Example usage:
 * 
 * // Faculty Dashboard - Generate rotating QR
 * const classData = {
 *   subjectId: "CS101",
 *   facultyId: "faculty123",
 *   classroomId: "CS-LAB-1",
 *   sessionId: "session456"
 * };
 * 
 * const secretKey = "your-secret-key-here";
 * 
 * const stopRotation = startQRRotation(classData, secretKey, (qrData) => {
 *   console.log("New QR generated:", qrData.qrImageUrl);
 *   console.log("Expires in:", qrData.remainingTime, "ms");
 *   // Update UI with new QR
 * });
 * 
 * // Stop rotation when session ends
 * // stopRotation();
 * 
 * 
 * // Student Side - Validate scanned QR
 * const scannedData = "encrypted-qr-payload-here";
 * const validation = validateQRPayload(scannedData, secretKey);
 * 
 * if (validation.valid) {
 *   console.log("QR valid! Session:", validation.payload.sessionId);
 * } else {
 *   console.error("QR invalid:", validation.error);
 * }
 */
