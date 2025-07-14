// modules/ui.js

// ==UserScript==
// @name         Social Media Time Limit Enforcer - UI
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  UI components for the Social Media Time Limit Enforcer script.
// @author       WildinFree
// ==/UserScript==

// Global state variables for the UI module
let warningStart = null;
let isPaused = false;

/**
 * Formats milliseconds into a "Xm Ys" string.
 * @param {number} ms - The time in milliseconds.
 * @returns {string} The formatted time string.
 */
function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
}

/**
 * Creates or gets the timer display element and injects it into the page.
 * @returns {HTMLElement} The timer display div.
 */
function injectTimerDisplay() {
    let div = document.getElementById("__wildinfree_timer__");
    if (!div) {
        div = document.createElement("div");
        div.id = "__wildinfree_timer__";
        Object.assign(div.style, {
            position: "fixed",
            bottom: "10px",
            right: "10px",
            background: "#000",
            color: "#0f0",
            padding: "6px 12px",
            fontSize: "14px",
            fontFamily: "monospace",
            zIndex: "999999",
            borderRadius: "6px",
            opacity: "0.85",
            pointerEvents: "none"
        });
        document.body.appendChild(div);
    }
    return div;
}

/**
 * Updates the content of the timer display based on the current state.
 * @param {object} state - The current timer state object.
 */
function updateTimerDisplay(state) {
    const div = injectTimerDisplay();
    const now = Date.now();
    const elapsed = isPaused ? (state.pausedTime - state.start) : (now - state.start);
    const remaining = state.duration - elapsed;
    const dailyState = getDailyState();
    const dailyRemaining = Math.max(0, SMTLE_CONFIG.DAILY_MAX_MS - dailyState.totalUsed);

    if (remaining > 0) {
        div.textContent = `✅ Active: ${formatTime(elapsed)} | Left: ${formatTime(remaining)} | Daily: ${formatTime(dailyRemaining)}${isPaused ? ' | Paused' : ''}`;
    } else {
        const sinceExpired = now - (state.start + state.duration);
        const countdown = Math.max(0, SMTLE_CONFIG.CLOSE_DELAY - sinceExpired);
        div.textContent = `⛔ Expired. Closing in: ${formatTime(countdown)} | Daily: ${formatTime(dailyRemaining)}`;
    }
}

/**
 * Creates and displays a modal to prompt the user for their purpose and desired time.
 */
function createPromptModal() {
    const modalHTML = `
        <div id="smtle-modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000000; display: flex; align-items: center; justify-content: center;">
            <div id="smtle-modal-content" style="background: #2c2c2c; color: #f1f1f1; padding: 25px; border-radius: 12px; width: 90%; max-width: 450px; font-family: sans-serif; box-shadow: 0 5px 25px rgba(0,0,0,0.5);">
                <h2 style="margin-top: 0; margin-bottom: 20px; text-align: center; font-weight: 600;">Set Your Intention</h2>
                <p style="margin-bottom: 15px;">What is your purpose for visiting ${location.hostname}?</p>
                <input type="text" id="smtle-purpose-input" placeholder="e.g., Check messages for 10 mins" style="width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #555; background: #333; color: #f1f1f1; font-size: 16px; margin-bottom: 20px; box-sizing: border-box;">
                <p style="margin-bottom: 15px;">How many minutes do you need?</p>
                <input type="number" id="smtle-minutes-input" placeholder="e.g., 15" style="width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #555; background: #333; color: #f1f1f1; font-size: 16px; margin-bottom: 25px; box-sizing: border-box;">
                <button id="smtle-start-btn" style="width: 100%; padding: 14px; border-radius: 8px; border: none; background: #4a90e2; color: white; font-size: 18px; font-weight: bold; cursor: pointer;">Start Timer</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('smtle-start-btn').addEventListener('click', () => {
        const purpose = document.getElementById('smtle-purpose-input').value;
        const minutes = parseFloat(document.getElementById('smtle-minutes-input').value);

        if (!purpose.trim()) {
            alert("Please state your purpose.");
            return;
        }
        if (isNaN(minutes) || minutes <= 0) {
            alert("Please enter a valid number of minutes.");
            return;
        }

        // This function is in timer.js but available globally in the script's scope
        setTimer(minutes, purpose);
        const modal = document.getElementById('smtle-modal-overlay');
        if (modal) modal.remove();
    });
}


/**
 * Redirects the user to a self-contained HTML page indicating the session has expired.
 * @param {object} state - The timer state object at the time of expiry.
 */
function redirectToExpiryPage(state) {
    fetch(SMTLE_CONFIG.GIF_URL)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch expiry GIF');
            return response.blob();
        })
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = function () {
                const gifBase64 = reader.result;
                const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Session Expired</title>
    <style>
        :root {
            --background-primary: #1a1c23; --background-secondary: #2a2d37; --background-card: #252831;
            --text-primary: #e0e0e5; --text-secondary: #a0a0af; --border-color: #353842;
            --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        body {
            background: linear-gradient(270deg, var(--background-primary), var(--background-secondary));
            color: var(--text-primary); font-family: var(--font-family); display: flex; flex-direction: column;
            align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 20px;
        }
        .container {
            background-color: var(--background-card); padding: 30px 40px; border-radius: 16px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.25); width: 90%; max-width: 550px; border: 1px solid var(--border-color);
        }
        h1 { margin-bottom: 15px; font-size: 28px; }
        .details { margin: 25px 0; text-align: left; }
        .details p { font-size: 15px; color: var(--text-secondary); margin-bottom: 10px; display: flex; justify-content: space-between; }
        .details .label { color: var(--text-primary); font-weight: 500; }
        .details .value { word-break: break-all; text-align: right; }
        img { margin-top: 20px; max-width: 180px; border-radius: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>⏱️ Your Session Has Expired</h1>
        <div class="details">
            <p><span class="label">Site:</span><span class="value">${state.site}</span></p>
            <p><span class="label">Purpose:</span><span class="value">${state.purpose}</span></p>
            <p><span class="label">Duration:</span><span class="value">${state.duration / 60000} minutes</span></p>
            <p><span class="label">Started At:</span><span class="value">${state.timestamp}</span></p>
        </div>
        <p>Thanks for staying intentional. Please log in again if you wish to continue.</p>
        <img src="${gifBase64}" alt="Hourglass indicating time up">
    </div>
</body>
</html>`;
                const blob = new Blob([html], { type: "text/html" });
                window.location.href = URL.createObjectURL(blob);
            };
            reader.readAsDataURL(blob);
        })
        .catch(e => {
            console.error('Error redirecting to expiry page:', e);
            alert('⚠️ Failed to load expiry page. Reloading...');
            setTimeout(() => location.reload(), 500);
        });
}

/**
 * Redirects the user to a self-contained HTML page indicating the daily limit has been reached.
 */
function redirectToLimitPage() {
    const siteName = location.hostname;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Limit Exceeded</title>
    <style>
        :root {
            --primary-text-color: #f8f9fa; --secondary-text-color: #adb5bd; --background-start: #181818;
            --background-end: #212529; --dialogue-bg: rgba(33, 37, 41, 0.85); --dialogue-border-color: #e63946;
            --font-primary: 'Space Grotesk', sans-serif;
        }
        body {
            background: linear-gradient(135deg, var(--background-start), var(--background-end));
            color: var(--primary-text-color); font-family: var(--font-primary), sans-serif; display: flex;
            justify-content: center; align-items: center; min-height: 100vh; text-align: center; padding: 20px;
        }
        .dialogue-box {
            background: var(--dialogue-bg); border-radius: 16px; backdrop-filter: blur(15px);
            border: 2px solid var(--dialogue-border-color); padding: 32px; width: 90%; max-width: 680px;
        }
        h1 { font-size: 32px; font-weight: 700; margin-bottom: 12px; }
        p { font-size: 16px; color: var(--secondary-text-color); }
    </style>
</head>
<body>
    <div class="dialogue-box">
        <h1>⚠️ Daily limit for ${siteName} reached</h1>
        <p>Your access has been temporarily limited. Please try again after midnight.</p>
    </div>
</body>
</html>`;
    try {
        const blob = new Blob([html], { type: "text/html" });
        window.location.href = URL.createObjectURL(blob);
    } catch (e) {
        console.error('Error redirecting to limit page:', e);
        alert('⚠️ Failed to load limit page. Reloading...');
        setTimeout(() => location.reload(), 500);
    }
}

/**
 * Redirects the user to a self-contained HTML page displaying their session history.
 */
function redirectToHistoryPage() {
    const history = getHistory().sort((a, b) => b.start - a.start);
    fetch(SMTLE_CONFIG.HISTORY_GIF_URL)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch history GIF');
            return response.blob();
        })
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = function () {
                const gifBase64 = reader.result;
                const historyItems = history.length === 0
                    ? `<div class="no-history"><h2>📜 No Purpose History Yet</h2></div>`
                    : history.map((entry, index) => `
                        <div class="history-card">
                            <div class="card-header">
                                <h2 class="card-title">Session ${index + 1}</h2>
                                <p class="card-date">${new Date(entry.start).toLocaleString()}</p>
                            </div>
                            <div class="card-content">
                                <p><strong>Site:</strong> ${entry.site}</p>
                                <p><strong>Purpose:</strong> ${entry.purpose}</p>
                                <p><strong>Duration:</strong> ${entry.duration / 60000} minutes</p>
                            </div>
                        </div>`).join('');

                const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purpose History</title>
    <style>
        :root {
            --background-secondary: #1a1a22; --background-card: #1c1e28; --text-primary: #e0e0e0;
            --accent-color: #6c5ce7; --border-color: #303240;
            --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        body {
            background: var(--background-secondary); color: var(--text-primary); font-family: var(--font-family);
            min-height: 100vh; padding: 20px;
        }
        .main-content { width: 100%; max-width: 1200px; margin: 0 auto; }
        .page-header { text-align: center; margin-bottom: 35px; }
        .history-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; }
        .history-card {
            background: var(--background-card); border-radius: 12px; padding: 20px 25px;
            border-left: 5px solid var(--accent-color);
        }
        .no-history { text-align: center; padding: 60px 20px; background-color: var(--background-card); border-radius: 12px; grid-column: 1 / -1; }
        .card-content p { margin-bottom: 10px; }
        .card-content strong { color: var(--text-primary); font-weight: 500; }
    </style>
</head>
<body>
    <main class="main-content">
        <div class="page-header"><h1>Purpose History</h1></div>
        <div class="history-grid">${historyItems}</div>
    </main>
</body>
</html>`;
                const blob = new Blob([html], { type: "text/html" });
                window.location.href = URL.createObjectURL(blob);
            };
            reader.readAsDataURL(blob);
        })
        .catch(e => {
            console.error('Error redirecting to history page:', e);
            alert('⚠️ Failed to load history page. Reloading...');
            setTimeout(() => location.reload(), 500);
        });
}
