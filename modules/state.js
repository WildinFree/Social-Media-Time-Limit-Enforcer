// modules/state.js

// ==UserScript==
// @name         Social Media Time Limit Enforcer - State
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  State management for the Social Media Time Limit Enforcer script.
// @author       You
// ==/UserScript==

function getTimerState() {
    try {
        return JSON.parse(localStorage.getItem(SMTLE_CONFIG.SITE_KEY) || 'null');
    } catch (e) {
        console.error('Error parsing timer state:', e);
        return null;
    }
}

function saveTimerState(state) {
    try {
        localStorage.setItem(SMTLE_CONFIG.SITE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Error saving timer state:', e);
    }
}

function clearTimerState() {
    try {
        localStorage.removeItem(SMTLE_CONFIG.SITE_KEY);
    } catch (e) {
        console.error('Error clearing timer state:', e);
    }
}

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(SMTLE_CONFIG.HISTORY_KEY) || '[]');
    } catch (e) {
        console.error('Error parsing history:', e);
        return [];
    }
}

function saveHistory(history) {
    try {
        localStorage.setItem(SMTLE_CONFIG.HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('Error saving history:', e);
        alert('⚠️ Failed to save history. Please try again.');
    }
}

function getDailyState() {
    try {
        const state = JSON.parse(localStorage.getItem(SMTLE_CONFIG.DAILY_LIMIT_KEY) || '{}');
        const today = new Date().toLocaleDateString();
        if (state.date !== today) {
            return { date: today, totalUsed: 0 };
        }
        return state;
    } catch (e) {
        console.error('Error parsing daily state:', e);
        return { date: new Date().toLocaleDateString(), totalUsed: 0 };
    }
}

function saveDailyState(state) {
    try {
        localStorage.setItem(SMTLE_CONFIG.DAILY_LIMIT_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Error saving daily state:', e);
    }
}

function getTempLimitState() {
    try {
        return JSON.parse(localStorage.getItem(SMTLE_CONFIG.TEMP_LIMIT_KEY) || 'null');
    } catch (e) {
        console.error('Error parsing temp limit state:', e);
        return null;
    }
}

function saveTempLimitState(state) {
     try {
        localStorage.setItem(SMTLE_CONFIG.TEMP_LIMIT_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Error setting temp limit:', e);
        alert('⚠️ Failed to set temporary limit. Please try again.');
    }
}

function clearTempLimitState() {
    try {
        localStorage.removeItem(SMTLE_CONFIG.TEMP_LIMIT_KEY);
    } catch (e) {
        console.error('Error clearing temp limit state:', e);
    }
}
