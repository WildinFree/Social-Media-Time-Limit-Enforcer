// modules/config.js

// ==UserScript==
// @name         Social Media Time Limit Enforcer - Config
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Configuration file for the Social Media Time Limit Enforcer script.
// @author       You
// ==/UserScript==

const SITE_KEY_PREFIX = 'usage_timer_';
const HISTORY_KEY = 'usage_history';
const DAILY_LIMIT_KEY_PREFIX = 'daily_limit_';
const TEMP_LIMIT_KEY_PREFIX = 'temp_limit_';

const CHECK_INTERVAL = 1000; // 1 second
const MAX_HISTORY = 5000;
const CLOSE_DELAY = 30 * 1000; // 30 seconds
const DAILY_MAX_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

const GIF_URL = "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZHYzMzYxMHB1b3c2cHA3dGxrOXl5eTRwcmlqNjR4Y2g5MnJkM21uayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oz8xKaR836UJOYeOc/giphy.gif";
const HISTORY_GIF_URL = "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3F5MGNheHE3cmhhcjc5aXJpcXowMDdqbjdtN2F1NG1qM3kxdWU5ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UtM7mkJEMq76u8WsFn/giphy.gif";

// It's good practice to wrap modules in a global object if not using a module loader.
var SMTLE_CONFIG = {
    SITE_KEY: `${SITE_KEY_PREFIX}${location.hostname}`,
    HISTORY_KEY,
    DAILY_LIMIT_KEY: `${DAILY_LIMIT_KEY_PREFIX}${location.hostname}`,
    TEMP_LIMIT_KEY: `${TEMP_LIMIT_KEY_PREFIX}${location.hostname}`,
    CHECK_INTERVAL,
    MAX_HISTORY,
    CLOSE_DELAY,
    DAILY_MAX_MS,
    GIF_URL,
    HISTORY_GIF_URL
};
