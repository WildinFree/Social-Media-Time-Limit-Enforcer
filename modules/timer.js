// modules/timer.js

// ==UserScript==
// @name         Social Media Time Limit Enforcer - Timer
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Timer logic for the Social Media Time Limit Enforcer script.
// @author       WildinFree
// ==/UserScript==

/**
 * Sets a new timer for the current session.
 * @param {number} minutes - The duration of the timer in minutes.
 * @param {string} purpose - The user's stated purpose for the session.
 */
function setTimer(minutes, purpose) {
    const now = Date.now();
    let sessionDuration = minutes * 60 * 1000;
    const dailyState = getDailyState();

    // Check if the requested time exceeds the daily limit
    if (dailyState.totalUsed + sessionDuration > SMTLE_CONFIG.DAILY_MAX_MS) {
        const remainingDaily = SMTLE_CONFIG.DAILY_MAX_MS - dailyState.totalUsed;
        if (remainingDaily <= 0) {
            alert("⚠️ Daily 6-hour limit reached for this platform. Access blocked until midnight.");
            redirectToLimitPage();
            return;
        }
        alert(`⚠️ Requested time exceeds daily limit. Setting timer for remaining ${formatTime(remainingDaily)}.`);
        sessionDuration = remainingDaily;
    }

    const data = {
        start: now,
        duration: sessionDuration,
        purpose,
        site: location.hostname,
        timestamp: new Date(now).toLocaleString(),
        pausedTime: null
    };
    saveTimerState(data);
    logSession(data);
    updateDailyUsage(data.duration);
    location.reload(); // Reload to start the timer monitoring
}

/**
 * Extends the current active timer.
 * @param {number} minutes - The number of minutes to add to the timer.
 */
function extendTimer(minutes) {
    const state = getTimerState();
    if (!state) {
        alert("⚠️ No active timer to extend.");
        return;
    }
    const dailyState = getDailyState();
    let additionalTime = minutes * 60 * 1000;

    // Check if the extension exceeds the daily limit
    if (dailyState.totalUsed + additionalTime > SMTLE_CONFIG.DAILY_MAX_MS) {
        const remainingDaily = SMTLE_CONFIG.DAILY_MAX_MS - dailyState.totalUsed;
        if (remainingDaily <= 0) {
            alert("⚠️ Cannot extend: Daily 6-hour limit reached.");
            redirectToLimitPage();
            return;
        }
        alert(`⚠️ Extension exceeds daily limit. Extending by ${formatTime(remainingDaily)}.`);
        additionalTime = remainingDaily;
    }
    state.duration += additionalTime;
    saveTimerState(state);
    updateDailyUsage(additionalTime);
    updateTimerDisplay(state);
    alert(`✅ Timer extended by ${additionalTime / 60000} minutes.`);
}

/**
 * Pauses the currently active timer.
 */
function pauseTimer() {
    const state = getTimerState();
    if (!state || isPaused) {
        alert(isPaused ? "⚠️ Timer is already paused." : "⚠️ No active timer to pause.");
        return;
    }
    state.pausedTime = Date.now();
    saveTimerState(state);
    isPaused = true;
    updateTimerDisplay(state);
    alert("✅ Timer paused.");
}

/**
 * Resumes a paused timer.
 */
function startTimer() {
    const state = getTimerState();
    if (!state || !isPaused) {
        alert(!isPaused ? "⚠️ Timer is already running." : "⚠️ No active timer to start.");
        return;
    }
    if (state.pausedTime) {
        const pauseDuration = Date.now() - state.pausedTime;
        state.start += pauseDuration; // Adjust start time to account for the pause
        state.pausedTime = null;
        saveTimerState(state);
        isPaused = false;
        updateTimerDisplay(state);
        alert("✅ Timer resumed.");
    }
}

/**
 * Ends the current timer prematurely and refunds the unused time to the daily limit.
 */
function endTimer() {
    const state = getTimerState();
    if (!state) {
        alert("⚠️ No active timer to end.");
        return;
    }
    const now = Date.now();
    const elapsed = isPaused ? (state.pausedTime - state.start) : (now - state.start);
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

/**
 * The main checking function, run by setInterval to monitor the timer.
 */
function checkTimer() {
    const state = getTimerState();
    if (!state) return;

    const dailyState = getDailyState();
    if (dailyState.totalUsed >= SMTLE_CONFIG.DAILY_MAX_MS) {
        clearTimerState();
        redirectToLimitPage();
        return;
    }

    isPaused = !!state.pausedTime;
    updateTimerDisplay(state);

    if (!isPaused) {
        const now = Date.now();
        const elapsed = now - state.start;
        const remaining = state.duration - elapsed;

        if (remaining <= 0) {
            // Use a delay before redirecting to allow the user to see the "expired" message.
            if (!warningStart) {
                warningStart = now;
            } else if (now - warningStart >= SMTLE_CONFIG.CLOSE_DELAY) {
                clearTimerState();
                redirectToExpiryPage(state);
            }
        }
    }
}

/**
 * Updates the total daily usage time.
 * @param {number} duration - The duration in milliseconds to add to the daily total.
 */
function updateDailyUsage(duration) {
    const state = getDailyState();
    state.totalUsed = (state.totalUsed || 0) + duration;
    saveDailyState(state);
}

/**
 * Checks if the date has changed and resets the daily usage if so.
 */
function checkDailyReset() {
    const dailyState = getDailyState(); // This function already handles the check
    // No further action needed here as getDailyState returns a fresh object for a new day.
}

/**
 * Sets a temporary block on a site for a specified duration.
 * @param {number} durationMinutes - The duration of the block in minutes.
 */
function setTempLimit(durationMinutes) {
    const now = Date.now();
    const tempLimit = {
        start: now,
        duration: durationMinutes * 60 * 1000,
        originalState: getDailyState()
    };
    saveTempLimitState(tempLimit);
    // To enforce the block, we temporarily max out the daily usage.
    saveDailyState({ date: new Date().toLocaleDateString(), totalUsed: SMTLE_CONFIG.DAILY_MAX_MS });
}

/**
 * Checks if a temporary limit is active and removes it if it has expired.
 * @returns {boolean} - True if a limit is active, false otherwise.
 */
function checkTempLimit() {
    const tempLimit = getTempLimitState();
    if (!tempLimit) return false;

    const elapsed = Date.now() - tempLimit.start;
    if (elapsed >= tempLimit.duration) {
        // Temp limit has expired, restore the original state.
        clearTempLimitState();
        saveDailyState(tempLimit.originalState);
        return false; // Limit is no longer active
    }
    return true; // Limit is still active
}
