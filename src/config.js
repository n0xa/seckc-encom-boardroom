// Configuration file for encom-boardroom
// Edit the values below to customize your deployment.
// In production Docker deployments, this file is overwritten at startup by
// docker/entrypoint.sh using docker/config.js.template and environment variables.

module.exports = {
    // Base API URL for the SecKC API endpoint
    API_BASE_URL: "http://localhost:5000/",

    // Data delivery method: "websocket" or "polling"
    // Use "polling" if WebSocket compatibility issues occur
    DELIVERY_METHOD: "polling",

    // Maximum polling interval in milliseconds for exponential backoff
    MAX_POLLING_INTERVAL: 64000
};
