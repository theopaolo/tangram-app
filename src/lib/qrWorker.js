// QR Code Web Worker for background processing
// This keeps the main thread responsive while scanning

import jsQR from 'jsqr';

self.onmessage = function(e) {
    const { imageData, width, height, scanAttempts } = e.data;

    try {
        // Multiple scan attempts with different configurations
        const attempts = scanAttempts || [
            // Attempt 1: Standard scan (good for normal distance)
            { inversionAttempts: "dontInvert" },

            // Attempt 2: Try inversion (helps with close-range/lighting issues)
            { inversionAttempts: "attemptBoth" },

            // Attempt 3: Only inverted (for challenging lighting)
            { inversionAttempts: "onlyInvert" }
        ];

        let code = null;

        // Try each configuration until we find a QR code
        for (const attempt of attempts) {
            code = jsQR(imageData, width, height, attempt);
            if (code) {
                break; // Found QR code, stop trying
            }
        }

        if (code) {
            // Successfully found QR code
            self.postMessage({
                success: true,
                data: code.data,
                location: code.location
            });
        } else {
            // No QR code found with any configuration
            self.postMessage({
                success: false,
                data: null
            });
        }
    } catch (error) {
        // Error during processing
        self.postMessage({
            success: false,
            error: error.message
        });
    }
};
