// Configuration file for encom-boardroom
// Edit the values below to customize your deployment

module.exports = {
    // Base API URL for the SecKC API endpoint
    API_BASE_URL: "http://10.13.37.200:5000/",
    
    // Data delivery method: "websocket" or "polling"
    // Use "polling" if WebSocket compatibility issues occur
    DELIVERY_METHOD: "polling",
    
    // Maximum polling interval in milliseconds for exponential backoff
    MAX_POLLING_INTERVAL: 64000
};
