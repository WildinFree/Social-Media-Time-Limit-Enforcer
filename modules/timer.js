// modules/timer.js
// Contains all core timer logic.

var SMTLE = window.SMTLE || {};

SMTLE.timer = {
    setTimer: function(minutes, purpose) {
        const now = Date.now();
        const sessionDuration = minutes * 60 * 1000;
        const dailyState = SMTLE.state.getDailyState();
        const today = new Date().toLocaleDateString();

        if (dailyState.date === today && dailyState.totalUsed + sessionDuration > SMTLE.config.DAILY_MAX_MS) {
            const remaining = SMTLE.config.DAILY_MAX_MS - dailyState.totalUsed;
            if (remaining <= 0) {
                alert("⚠️ Daily 6-hour limit reached for this platform. Access blocked until midnight.");
                SMTLE.ui.redirectToLimitPage();
                return;
            }
            alert(`⚠️ Requested time exceeds daily limit. Setting timer for remaining ${SMTLE.ui.formatTime(remaining)}.`);
            minutes = remaining / (60 * 1000);
        }

        const data = {
            start: now,
            duration: minutes * 60 * 1000,
            purpose,
            site: location.hostname,
            timestamp: new Date(now).toLocaleString(),
            pausedTime: null
        };
        SMTLE.state.saveTimerState(data);
        SMTLE.history.logSession(data);
        this.updateDailyUsage(data.duration);
        SMTLE.ui.updateTimerDisplay(data);
        location.reload();
    },

    extendTimer: function(minutes) {
        const state = SMTLE.state.getTimerState();
        if (!state) {
            alert("⚠️ No active timer to extend.");
            return;
        }
        const dailyState = SMTLE.state.getDailyState();
        const additionalTime = minutes * 60 * 1000;
        if (dailyState.totalUsed + additionalTime > SMTLE.config.DAILY_MAX_MS) {
            const remaining = SMTLE.config.DAILY_MAX_MS - dailyState.totalUsed;
            if (remaining <= 0) {
                alert("⚠️ Cannot extend: Daily 6-hour limit reached.");
                SMTLE.ui.redirectToLimitPage();
                return;
            }
            alert(`⚠️ Extension exceeds daily limit. Extending by ${SMTLE.ui.formatTime(remaining)}.`);
            minutes = remaining / (60 * 1000);
        }
        state.duration += minutes * 60 * 1000;
        SMTLE.state.saveTimerState(state);
        this.updateDailyUsage(minutes * 60 * 1000);
        SMTLE.ui.updateTimerDisplay(state);
        alert(`✅ Timer extended by ${minutes} minutes.`);
    },

    pauseTimer: function() {
        const state = SMTLE.state.getTimerState();
        if (!state) {
            alert("⚠️ No active timer to pause.");
            return;
        }
        if (SMTLE.ui.isPaused) {
            alert("⚠️ Timer is already paused.");
            return;
        }
        state.pausedTime = Date.now();
        SMTLE.state.saveTimerState(state);
        SMTLE.ui.isPaused = true;
        SMTLE.ui.updateTimerDisplay(state);
        alert("✅ Timer paused.");
    },

    startTimer: function() {
        const state = SMTLE.state.getTimerState();
        if (!state) {
            alert("⚠️ No active timer to start.");
            return;
        }
        if (!SMTLE.ui.isPaused) {
            alert("⚠️ Timer is already running.");
            return;
        }
        if (state.pausedTime) {
            const pauseDuration = Date.now() - state.pausedTime;
            state.start += pauseDuration;
            state.pausedTime = null;
            SMTLE.state.saveTimerState(state);
            SMTLE.ui.isPaused = false;
            SMTLE.ui.updateTimerDisplay(state);
            alert("✅ Timer resumed.");
        }
    },

    endTimer: function() {
        const state = SMTLE.state.getTimerState();
        if (!state) {
            alert("⚠️ No active timer to end.");
            return;
        }
        const now = Date.now();
        const elapsed = now - state.start;
        const remaining = Math.max(0, state.duration - elapsed);
        if (remaining > 0) {
            const dailyState = SMTLE.state.getDailyState();
            dailyState.totalUsed = Math.max(0, dailyState.totalUsed - remaining);
            SMTLE.state.saveDailyState(dailyState);
        }
        SMTLE.state.clearTimerState();
        alert("✅ Timer ended. Remaining time refunded to daily limit.");
        location.reload();
    },

    checkTimer: function() {
        const state = SMTLE.state.getTimerState();
        if (!state) {
            console.warn("⛔ No timer set. Reloading...");
            setTimeout(() => location.reload(), 500);
            return;
        }

        const dailyState = SMTLE.state.getDailyState();
        if (dailyState.totalUsed >= SMTLE.config.DAILY_MAX_MS) {
            SMTLE.state.clearTimerState();
            alert("⚠️ Daily 6-hour limit reached for this platform. Access blocked until midnight.");
            SMTLE.ui.redirectToLimitPage();
            return;
        }

        if (!SMTLE.ui.isPaused) {
            SMTLE.ui.updateTimerDisplay(state);
        }

        const now = Date.now();
        const elapsed = SMTLE.ui.isPaused ? (state.pausedTime - state.start) : (now - state.start);
        const remaining = state.duration - elapsed;

        if (remaining <= 0) {
            if (!SMTLE.ui.warningStart) {
                SMTLE.ui.warningStart = now;
                alert("⚠️ Time's up. Redirecting to summary page...");
            } else if (now - SMTLE.ui.warningStart >= SMTLE.config.CLOSE_DELAY) {
                SMTLE.state.clearTimerState();
                SMTLE.ui.redirectToExpiryPage(state);
            }
        }
    },

    updateDailyUsage: function(duration) {
        const state = SMTLE.state.getDailyState();
        state.totalUsed = (state.totalUsed || 0) + duration;
        SMTLE.state.saveDailyState(state);
    },

    resetDailyUsage: function() {
        const today = new Date().toLocaleDateString();
        SMTLE.state.saveDailyState({ date: today, totalUsed: 0 });
        const history = SMTLE.state.getHistory().filter(entry => {
            const entryDate = new Date(entry.start).toLocaleDateString();
            return entryDate === today;
        });
        SMTLE.state.saveHistory(history);
    },

    checkDailyReset: function() {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() < 2) {
            this.resetDailyUsage();
        }
    },

    setTempLimit: function(durationMinutes) {
        const now = Date.now();
        const tempLimit = {
            start: now,
            duration: durationMinutes * 60 * 1000,
            originalState: SMTLE.state.getDailyState()
        };
        SMTLE.state.saveTempLimitState(tempLimit);
        SMTLE.state.saveDailyState({ date: new Date().toLocaleDateString(), totalUsed: SMTLE.config.DAILY_MAX_MS });
    },

    checkTempLimit: function() {
        const tempLimit = SMTLE.state.getTempLimitState();
        if (!tempLimit) return;

        const now = Date.now();
        const elapsed = now - tempLimit.start;
        if (elapsed >= tempLimit.duration) {
            SMTLE.state.clearTempLimitState();
            SMTLE.state.saveDailyState(tempLimit.originalState);
        }
    }
};
