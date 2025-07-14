// modules/timer.js

// ==UserScript==
// @name         Social Media Time Limit Enforcer - Timer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Timer logic for the Social Media Time Limit Enforcer script.
// @author       You
// ==/UserScript==

function setTimer(minutes, purpose) {
    const now = Date.now();
    const sessionDuration = minutes * 60 * 1000;
    const dailyState = getDailyState();
    const today = new Date().toLocaleDateString();

    if (dailyState.date === today && dailyState.totalUsed + sessionDuration > SMTLE_CONFIG.DAILY_MAX_MS) {
        const remaining = SMTLE_CONFIG.DAILY_MAX_MS - dailyState.totalUsed;
        if (remaining <= 0) {
            alert("⚠️ Daily 6-hour limit reached for this platform. Access blocked until midnight.");
            redirectToLimitPage();
            return;
        }
        alert(`⚠️ Requested time exceeds daily limit. Setting timer for remaining ${formatTime(remaining)}.`);
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
    saveTimerState(data);
    logSession(data);
    updateDailyUsage(data.duration);
    updateTimerDisplay(data);
    location.reload();
}

function extendTimer(minutes) {
    const state = getTimerState();
    if (!state) {
        alert("⚠️ No active timer to extend.");
        return;
    }
    const dailyState = getDailyState();
    const additionalTime = minutes * 60 * 1000;
    if (dailyState.totalUsed + additionalTime > SMTLE_CONFIG.DAILY_MAX_MS) {
        const remaining = SMTLE_CONFIG.DAILY_MAX_MS - dailyState.totalUsed;
        if (remaining <= 0) {
            alert("⚠️ Cannot extend: Daily 6-hour limit reached.");
            redirectToLimitPage();
            return;
        }
        alert(`⚠️ Extension exceeds daily limit. Extending by ${formatTime(remaining)}.`);
        minutes = remaining / (60 * 1000);
    }
    state.duration += minutes * 60 * 1000;
    saveTimerState(state);
    updateDailyUsage(minutes * 60 * 1000);
    updateTimerDisplay(state);
    alert(`✅ Timer extended by ${minutes} minutes.`);
}

function pauseTimer() {
    const state = getTimerState();
    if (!state) {
        alert("⚠️ No active timer to pause.");
        return;
    }
    if (isPaused) {
        alert("⚠️ Timer is already paused.");
        return;
    }
    state.pausedTime = Date.now();
    saveTimerState(state);
    isPaused = true;
    updateTimerDisplay(state);
    alert("✅ Timer paused.");
}

function startTimer() {
    const state = getTimerState();
    if (!state) {
        alert("⚠️ No active timer to start.");
        return;
    }
    if (!isPaused) {
        alert("⚠️ Timer is already running.");
        return;
    }
    if (state.pausedTime) {
        const pauseDuration = Date.now() - state.pausedTime;
        state.start += pauseDuration;
        state.pausedTime = null;
        saveTimerState(state);
        isPaused = false;
        updateTimerDisplay(state);
        alert("✅ Timer resumed.");
    }
}

function endTimer() {
    const state = getTimerState();
    if (!state) {
        alert("⚠️ No active timer to end.");
        return;
    }
    const now = Date.now();
    const elapsed = now - state.start;
    const remaining = Math.max(0, state.duration - elapsed);
    if (remaining > 0) {
        const dailyState = getDailyState();
        dailyState.totalUsed = Math.max(0, dailyState.totalUsed - remaining);
        saveDailyState(dailyState);
    }
    clearTimerState();
    alert("✅ Timer ended. Remaining time refunded to daily limit.");
    location.reload();
}

function checkTimer() {
    const state = getTimerState();
    if (!state) {
        console.warn("⛔ No timer set. Reloading...");
        setTimeout(() => location.reload(), 500);
        return;
    }

    const dailyState = getDailyState();
    if (dailyState.totalUsed >= SMTLE_CONFIG.DAILY_MAX_MS) {
        clearTimerState();
        alert("⚠️ Daily 6-hour limit reached for this platform. Access blocked until midnight.");
        redirectToLimitPage();
        return;
    }

    if (!isPaused) {
        updateTimerDisplay(state);
    }

    const now = Date.now();
    const elapsed = isPaused ? (state.pausedTime - state.start) : (now - state.start);
    const remaining = state.duration - elapsed;

    if (remaining <= 0) {
        if (!warningStart) {
            warningStart = now;
            alert("⚠️ Time's up. Redirecting to summary page...");
        } else if (now - warningStart >= SMTLE_CONFIG.CLOSE_DELAY) {
            clearTimerState();
            redirectToExpiryPage(state);
        }
    }
}

function updateDailyUsage(duration) {
    const state = getDailyState();
    state.totalUsed = (state.totalUsed || 0) + duration;
    saveDailyState(state);
}

function resetDailyUsage() {
    const today = new Date().toLocaleDateString();
    saveDailyState({ date: today, totalUsed: 0 });
    const history = getHistory().filter(entry => {
        const entryDate = new Date(entry.start).toLocaleDateString();
        return entryDate === today;
    });
    saveHistory(history);
}

function checkDailyReset() {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() < 1) {
        resetDailyUsage();
    }
}

function setTempLimit(durationMinutes) {
    const now = Date.now();
    const tempLimit = {
        start: now,
        duration: durationMinutes * 60 * 1000,
        originalState: getDailyState()
    };
    saveTempLimitState(tempLimit);
    saveDailyState({ date: new Date().toLocaleDateString(), totalUsed: SMTLE_CONFIG.DAILY_MAX_MS });
}

function checkTempLimit() {
    const tempLimit = getTempLimitState();
    if (!tempLimit) return;

    const now = Date.now();
    const elapsed = now - tempLimit.start;
    if (elapsed >= tempLimit.duration) {
        clearTempLimitState();
        saveDailyState(tempLimit.originalState);
    }
}
