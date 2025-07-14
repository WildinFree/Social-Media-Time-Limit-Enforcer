// modules/config.js
// Establishes the global namespace and adds configuration to it.

var SMTLE = window.SMTLE || {};

SMTLE.config = {
    SITE_KEY: `usage_timer_${location.hostname}`,
    HISTORY_KEY: 'usage_history',
    DAILY_LIMIT_KEY: `daily_limit_${location.hostname}`,
    TEMP_LIMIT_KEY: `temp_limit_${location.hostname}`,
    CHECK_INTERVAL: 1000,
    MAX_HISTORY: 5000,
    CLOSE_DELAY: 30 * 1000,
    DAILY_MAX_MS: 6 * 60 * 60 * 1000,
    GIF_URL: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZHYzMzYxMHB1b3c2cHA3dGxrOXl5eTRwcmlqNjR4Y2g5MnJkM21uayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oz8xKaR836UJOYeOc/giphy.gif",
    HISTORY_GIF_URL: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3F5MGNheHE3cmhhcjc5aXJpcXowMDdqbjdtN2F1NG1qM3kxdWU5ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UtM7mkJEMq76u8WsFn/giphy.gif"
};
