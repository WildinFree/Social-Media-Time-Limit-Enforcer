// modules/state.js
// Manages all interactions with localStorage.

var SMTLE = window.SMTLE || {};

SMTLE.state = {
    getTimerState: function() {
        try {
            return JSON.parse(localStorage.getItem(SMTLE.config.SITE_KEY) || 'null');
        } catch (e) {
            console.error('Error parsing timer state:', e);
            return null;
        }
    },

    saveTimerState: function(state) {
        try {
            localStorage.setItem(SMTLE.config.SITE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Error saving timer state:', e);
        }
    },

    clearTimerState: function() {
        try {
            localStorage.removeItem(SMTLE.config.SITE_KEY);
        } catch (e) {
            console.error('Error clearing timer state:', e);
        }
    },

    getHistory: function() {
        try {
            return JSON.parse(localStorage.getItem(SMTLE.config.HISTORY_KEY) || '[]');
        } catch (e) {
            console.error('Error parsing history:', e);
            return [];
        }
    },

    saveHistory: function(history) {
        try {
            localStorage.setItem(SMTLE.config.HISTORY_KEY, JSON.stringify(history));
        } catch (e) {
            console.error('Error saving history:', e);
            alert('⚠️ Failed to save history. Please try again.');
        }
    },

    getDailyState: function() {
        try {
            const state = JSON.parse(localStorage.getItem(SMTLE.config.DAILY_LIMIT_KEY) || '{}');
            const today = new Date().toLocaleDateString();
            if (state.date !== today) {
                return { date: today, totalUsed: 0 };
            }
            return state;
        } catch (e) {
            console.error('Error parsing daily state:', e);
            return { date: new Date().toLocaleDateString(), totalUsed: 0 };
        }
    },

    saveDailyState: function(state) {
        try {
            localStorage.setItem(SMTLE.config.DAILY_LIMIT_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Error saving daily state:', e);
        }
    },

    getTempLimitState: function() {
        try {
            return JSON.parse(localStorage.getItem(SMTLE.config.TEMP_LIMIT_KEY) || 'null');
        } catch (e) {
            console.error('Error parsing temp limit state:', e);
            return null;
        }
    },

    saveTempLimitState: function(state) {
         try {
            localStorage.setItem(SMTLE.config.TEMP_LIMIT_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Error setting temp limit:', e);
            alert('⚠️ Failed to set temporary limit. Please try again.');
        }
    },

    clearTempLimitState: function() {
        try {
            localStorage.removeItem(SMTLE.config.TEMP_LIMIT_KEY);
        } catch (e) {
            console.error('Error clearing temp limit state:', e);
        }
    }
};
