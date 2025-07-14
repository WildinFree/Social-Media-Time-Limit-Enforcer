// modules/ui.js
// Handles all DOM manipulation and UI rendering.

var SMTLE = window.SMTLE || {};

SMTLE.ui = {
    warningStart: null,
    isPaused: false,

    formatTime: function(ms) {
        const total = Math.max(0, Math.floor(ms / 1000));
        const min = Math.floor(total / 60);
        const sec = total % 60;
        return `${min}m ${sec}s`;
    },

    injectTimerDisplay: function() {
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
                zIndex: 999999,
                borderRadius: "6px",
                opacity: "0.85",
                pointerEvents: "none"
            });
            document.body.appendChild(div);
        }
        return div;
    },

    updateTimerDisplay: function(state) {
        const div = this.injectTimerDisplay();
        const now = Date.now();
        const elapsed = this.isPaused ? (state.pausedTime - state.start) : (now - state.start);
        const remaining = state.duration - elapsed;
        const dailyState = SMTLE.state.getDailyState();
        const dailyRemaining = Math.max(0, SMTLE.config.DAILY_MAX_MS - dailyState.totalUsed);

        if (remaining > 0) {
            div.textContent = `✅ Active for: ${this.formatTime(elapsed)} | Remaining: ${this.formatTime(remaining)} | Daily left: ${this.formatTime(dailyRemaining)}${this.isPaused ? ' | Paused' : ''}`;
        } else {
            const sinceExpired = now - (state.start + state.duration);
            const countdown = Math.max(0, SMTLE.config.CLOSE_DELAY - sinceExpired);
            div.textContent = `⛔ Time expired. Closing in: ${this.formatTime(countdown)} | Daily left: ${this.formatTime(dailyRemaining)}`;
        }
    },

    redirectToExpiryPage: function(state) {
        fetch(SMTLE.config.GIF_URL)
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
            --background-primary: #1a1c23;
            --background-secondary: #2a2d37;
            --background-card: #252831;
            --text-primary: #e0e0e5;
            --text-secondary: #a0a0af;
            --text-highlight: #e74c3c;
            --text-highlight-rgb: 231, 76, 60;
            --border-color: #353842;
            --shadow-color: rgba(0, 0, 0, 0.25);
            --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            --border-radius-md: 12px;
            --border-radius-lg: 16px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background: linear-gradient(270deg, var(--background-primary), var(--background-secondary), var(--background-primary));
            background-size: 400% 400%;
            color: var(--text-primary);
            font-family: var(--font-family);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
            padding: 20px;
            line-height: 1.6;
            animation: subtleGradientShift 25s ease infinite;
        }

        @keyframes subtleGradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .session-expired-container {
            position: relative;
            background-color: var(--background-card);
            padding: 30px 40px;
            border-radius: var(--border-radius-lg);
            box-shadow: 0 8px 30px var(--shadow-color);
            width: 90%;
            max-width: 550px;
            border: 1px solid var(--border-color);
            animation: fadeInScaleUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
            overflow: hidden;
        }

        @keyframes fadeInScaleUp {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .session-expired-container::after {
            content: "";
            position: absolute;
            top: 0;
            left: -150%;
            width: 70%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.08),
                transparent
            );
            transform: skewX(-25deg);
            opacity: 0;
            animation: cardShine 1.5s ease-out 0.6s forwards;
        }

        @keyframes cardShine {
            0% { left: -150%; opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { left: 150%; opacity: 0; }
        }

        .icon-indicator {
            font-size: 48px;
            margin-bottom: 20px;
            color: inherit;
            line-height: 1;
            animation: smoothEqualTilt 4s cubic-bezier(0.645, 0.045, 0.355, 1) infinite alternate;
            transform-origin: center center;
        }

        @keyframes smoothEqualTilt {
            0%, 100% { transform: rotate(-8deg); }
            50% { transform: rotate(8deg); }
        }

        .session-expired-container h1 {
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 28px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .session-details {
            margin-top: 25px;
            margin-bottom: 25px;
            text-align: left;
        }

        .session-details p {
            font-size: 15px;
            color: var(--text-secondary);
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            opacity: 0;
            transform: translateY(10px);
            animation: fadeInDetail 0.5s ease-out forwards;
        }

        @keyframes fadeInDetail {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .session-details .detail-label {
             color: var(--text-primary);
             font-weight: 500;
        }
        .session-details .detail-value {
            color: var(--text-secondary);
            word-break: break-all;
            text-align: right;
        }

        .farewell-message {
            font-size: 16px;
            color: var(--text-secondary);
            margin-top: 20px;
            margin-bottom: 30px;
            font-style: italic;
        }

        .status-image {
            margin-top: 20px;
            max-width: 180px;
            width: 100%;
            height: auto;
            border-radius: var(--border-radius-md);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            background-color: var(--background-primary);
            opacity: 0;
            transform: scale(0.8) rotate(-5deg);
            animation: revealImage 0.7s ease-out forwards;
            animation-delay: 1.2s;
        }

        @keyframes revealImage {
            to {
                opacity: 1;
                transform: scale(1) rotate(0deg);
            }
        }

        @media (max-width: 600px) {
            .session-expired-container {
                padding: 25px 30px;
                max-width: 95%;
            }

            .session-expired-container h1 {
                font-size: 24px;
            }

            .icon-indicator {
                font-size: 40px;
                margin-bottom: 15px;
            }

            .session-details p {
                font-size: 14px;
                flex-direction: column;
                align-items: flex-start;
                margin-bottom: 12px;
            }
            .session-details .detail-value {
                text-align: left;
                margin-top: 2px;
            }

            .farewell-message {
                font-size: 15px;
            }

            .status-image {
                max-width: 150px;
            }
        }

        @media (prefers-reduced-motion: reduce) {
          body {
            animation: none !important;
            background: linear-gradient(to right, var(--background-primary), var(--background-secondary));
          }
          .icon-indicator,
          .session-expired-container,
          .session-expired-container::after,
          .session-details p,
          .status-image {
            animation: none !important;
            transition: none !important;
          }
          .icon-indicator {
              animation: none !important;
          }
        }
    </style>
</head>
<body>
    <div class="session-expired-container" role="alert" aria-live="assertive">
        <div class="icon-indicator" role="img" aria-label="Session Expired">⏱️</div>
        <h1>Your Session Has Expired</h1>
        <div class="session-details">
            <p id="detail-site" style="animation-delay: 0.7s">
                <span class="detail-label">Site:</span>
                <span class="detail-value">${state.site}</span>
            </p>
            <p id="detail-purpose" style="animation-delay: 0.8s">
                <span class="detail-label">Purpose:</span>
                <span class="detail-value">${state.purpose}</span>
            </p>
            <p id="detail-duration" style="animation-delay: 0.9s">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${state.duration / 60000} minutes</span>
            </p>
            <p id="detail-timestamp" style="animation-delay: 1.0s">
                <span class="detail-label">Started At:</span>
                <span class="detail-value">${state.timestamp}</span>
            </p>
            <p id="detail-redirect" style="animation-delay: 1.1s">
                <span class="detail-label">Redirected From:</span>
                <span class="detail-value">${state.site}</span>
            </p>
        </div>
        <p class="farewell-message">Thanks for staying intentional. Please log in again if you wish to continue.</p>
        <img src="${gifBase64}" alt="Hourglass or clock indicating time up" class="status-image" id="session-gif">
    </div>
</body>
</html>
                    `;
                    const blob = new Blob([html], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    window.location.href = url;
                };
                reader.readAsDataURL(blob);
            })
            .catch(e => {
                console.error('Error redirecting to expiry page:', e);
                alert('⚠️ Failed to load expiry page. Reloading...');
                setTimeout(() => location.reload(), 500);
            });
    },

    redirectToLimitPage: function() {
        const siteName = location.hostname;
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Limit Exceeded</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-text-color: #f8f9fa;
            --secondary-text-color: #adb5bd;
            --background-start: #181818;
            --background-end: #212529;
            --dialogue-bg: rgba(33, 37, 41, 0.85);
            --dialogue-border-color: #e63946;
            --dialogue-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            --error-color-main: #e63946;
            --error-color-gradient-start: #d32d3d;
            --error-color-gradient-end: #b82430;
            --highlight-text-color: #ffc107;
            --font-primary: 'Space Grotesk', sans-serif;
            --font-mono: 'Roboto Mono', monospace;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background: linear-gradient(135deg, var(--background-start), var(--background-end));
            color: var(--primary-text-color);
            font-family: var(--font-primary);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
            overflow: hidden;
            padding: 20px;
        }

        body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 50% 50%, rgba(230, 57, 70, 0.1), transparent 70%);
            pointer-events: none;
            z-index: -1;
        }

        .dialogue-box {
            background: var(--dialogue-bg);
            border-radius: 16px;
            box-shadow: var(--dialogue-shadow);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 2px solid var(--dialogue-border-color);
            animation: slideIn 0.6s cubic-bezier(0.215, 0.61, 0.355, 1) forwards, pulseBorder 2s ease-in-out infinite alternate;
            padding: 32px;
            width: 90%;
            max-width: 680px;
            position: relative;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes pulseBorder {
            0% { border-color: var(--dialogue-border-color); box-shadow: 0 0 15px rgba(230, 57, 70, 0.3), var(--dialogue-shadow); }
            100% { border-color: rgba(230, 57, 70, 0.9); box-shadow: 0 0 25px rgba(230, 57, 70, 0.5), var(--dialogue-shadow); }
        }

        .icon-emoji-warning {
            font-size: 48px;
            line-height: 1;
            margin-bottom: 24px;
            display: inline-block;
            color: var(--error-color-main);
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .headline-main {
            font-size: 32px;
            font-weight: 700;
            line-height: 1.3;
            margin-bottom: 12px;
            color: var(--primary-text-color);
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }

        .headline-main #site-name {
            color: var(--highlight-text-color);
            font-weight: 800;
        }

        .headline-sub {
            font-size: 16px;
            font-weight: 400;
            line-height: 1.6;
            color: var(--secondary-text-color);
            margin-bottom: 32px;
            text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
        }

        .alert-image-container {
            display: none;
        }

        @media (max-width: 768px) {
            .dialogue-box {
                padding: 24px;
                margin: 16px;
                width: calc(100% - 32px);
            }

            .icon-emoji-warning {
                font-size: 40px;
                margin-bottom: 20px;
            }

            .headline-main {
                font-size: 26px;
                letter-spacing: 0.5px;
            }

            .headline-sub {
                font-size: 14px;
            }
        }

        @media (max-width: 480px) {
            .headline-main {
                font-size: 22px;
            }
            .headline-sub {
                font-size: 13px;
            }
        }
    </style>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const siteNameElement = document.getElementById('site-name');
            if (siteNameElement) {
                siteNameElement.textContent = '${siteName}';
            }
        });
    </script>
</head>
<body>
    <div class="dialogue-box" role="alertdialog" aria-labelledby="alert-heading-main" aria-describedby="alert-heading-sub">
        <div class="icon-emoji-warning" role="img" aria-label="Warning">⚠️</div>
        <h1 class="headline-main" id="alert-heading-main">Daily limit for <span id="site-name"></span> reached</h1>
        <p class="headline-sub" id="alert-heading-sub">Your access has been temporarily limited. Please try again after midnight.</p>
    </div>
</body>
</html>
        `;
        try {
            const blob = new Blob([html], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            window.location.href = url;
        } catch (e) {
            console.error('Error redirecting to limit page:', e);
            alert('⚠️ Failed to load limit page. Reloading...');
            setTimeout(() => location.reload(), 500);
        }
    },

    redirectToHistoryPage: function() {
        const history = SMTLE.state.getHistory().sort((a, b) => b.start - a.start);
        fetch(SMTLE.config.HISTORY_GIF_URL)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch history GIF');
                return response.blob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = function () {
                    const gifBase64 = reader.result;
                    const historyItems = history.length === 0
                        ? `
                            <div class="no-history">
                                <span class="no-history-icon">📜</span>
                                <h2>No Purpose History Yet</h2>
                                <p class="no-history-message">Start tracking your sessions to see your history here.</p>
                            </div>
                        `
                        : history.map((entry, index) => `
                            <div class="history-card" role="listitem" aria-labelledby="entry-${index}">
                                <div class="card-header">
                                    <h2 class="card-title">Session ${index + 1}</h2>
                                    <p class="card-date">${new Date(entry.start).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <hr class="card-divider">
                                <div class="card-content">
                                    <p><strong><span class="icon">🌐</span>Site:</strong> ${entry.site}</p>
                                    <p><strong><span class="icon">✍️</span>Purpose:</strong> ${entry.purpose}</p>
                                    <p><strong><span class="icon">⏳</span>Duration:</strong> ${entry.duration / 60000} minutes</p>
                                    <p><strong><span class="icon">📅</span>Started at:</strong> ${entry.timestamp}</p>
                                </div>
                            </div>
                        `).join('');

                    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purpose History</title>
    <style>
        :root {
            --background-primary: #121218;
            --background-secondary: #1a1a22;
            --background-card: #1c1e28;
            --background-popup: #232530;
            --text-primary: #e0e0e0;
            --text-secondary: #a0a0b0;
            --text-tertiary: #707080;
            --accent-color: #6c5ce7;
            --accent-hover-color: #5847d3;
            --border-color: #303240;
            --border-highlight: var(--accent-color);
            --shadow-color-soft: rgba(0, 0, 0, 0.2);
            --shadow-color-medium: rgba(0, 0, 0, 0.35);
            --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            --border-radius-md: 12px;
            --border-radius-lg: 16px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background: var(--background-secondary);
            color: var(--text-primary);
            font-family: var(--font-family);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            line-height: 1.6;
            overflow-x: hidden;
            padding: 20px;
        }

        .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(5px);
            z-index: 999;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            animation: fadeInOverlay 0.4s ease-out forwards;
        }

        .popup {
            background: var(--background-popup);
            border-radius: var(--border-radius-lg);
            padding: 30px 35px;
            width: 90%;
            max-width: 550px;
            text-align: center;
            box-shadow: 0 10px 40px var(--shadow-color-medium);
            z-index: 1000;
            opacity: 0;
            transform: scale(0.9);
            animation: fadeInPopup 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s forwards;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .popup.hidden {
            display: none;
        }
        .popup-overlay.hidden {
            display: none;
        }

        @keyframes fadeInOverlay {
            to { opacity: 1; }
        }

        @keyframes fadeInPopup {
            to { opacity: 1; transform: scale(1); }
        }

        .popup h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 20px;
            color: var(--text-primary);
            line-height: 1.3;
        }

        .popup img {
            max-width: 250px;
            width: 100%;
            height: auto;
            border-radius: var(--border-radius-md);
            margin-bottom: 28px;
            box-shadow: 0 4px 12px var(--shadow-color-soft);
            background-color: var(--background-secondary);
        }

        .popup-button {
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 12px 25px;
            width: auto;
            min-width: 150px;
            height: auto;
            border-radius: var(--border-radius-md);
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .popup-button:hover {
            background: var(--accent-hover-color);
            transform: translateY(-2px);
        }

        .popup-button:focus-visible {
            outline: 2px solid var(--accent-color);
            outline-offset: 3px;
        }

        .main-content {
            display: none;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            opacity: 0;
            animation: fadeInContent 0.5s ease-out forwards;
        }

        @keyframes fadeInContent {
            to { opacity: 1; }
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 35px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
        }

        .page-header h1 {
            font-size: 30px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .total-entries {
            font-size: 14px;
            color: var(--text-secondary);
            font-weight: 400;
            background-color: var(--background-card);
            padding: 6px 12px;
            border-radius: 6px;
        }

        .history-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
        }

        .history-card {
            background: var(--background-card);
            border-radius: var(--border-radius-md);
            padding: 20px 25px;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            border-left: 5px solid var(--border-highlight);
            box-shadow: 0 3px 10px var(--shadow-color-soft);
            display: flex;
            flex-direction: column;
        }

        .history-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 20px var(--shadow-color-medium);
        }

        .card-header {
            margin-bottom: 15px;
        }

        .card-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 5px;
            line-height: 1.3;
        }

        .card-date {
            font-size: 0.85em;
            color: var(--text-tertiary);
            margin-bottom: 15px;
        }

        .card-content p {
            font-size: 15px;
            margin-bottom: 10px;
            color: var(--text-secondary);
            font-weight: 400;
            display: flex;
            align-items: flex-start;
            gap: 8px;
        }
        .card-content p:last-child {
            margin-bottom: 0;
        }

        .card-content p strong {
            color: var(--text-primary);
            font-weight: 500;
            min-width: 80px;
            display: inline-block;
        }

        .card-content .icon {
            color: var(--accent-color);
            margin-right: 5px;
            font-size: 1em;
        }

        .card-divider {
            border: none;
            height: 1px;
            background-color: var(--border-color);
            opacity: 0.5;
            margin: 15px 0;
        }

        .no-history {
            text-align: center;
            font-size: 18px;
            color: var(--text-secondary);
            padding: 60px 20px;
            font-weight: 400;
            width: 100%;
            grid-column: 1 / -1;
            background-color: var(--background-card);
            border-radius: var(--border-radius-md);
        }

        .no-history-icon {
            font-size: 48px;
            display: block;
            margin-bottom: 20px;
            color: var(--text-tertiary);
        }
        .no-history-message {
            font-size: 16px;
            line-height: 1.5;
        }

        @media (max-width: 768px) {
            body { padding: 15px; }
            .popup { padding: 25px; max-width: 95%; }
            .popup h1 { font-size: 24px; }
            .popup img { max-width: 180px; margin-bottom: 20px; }
            .popup-button { font-size: 15px; padding: 10px 20px; min-width: 120px;}

            .main-content { padding: 30px 10px; }
            .page-header { margin-bottom: 25px; padding-bottom: 15px; }
            .page-header h1 { font-size: 26px; }
            .total-entries { font-size: 13px; }

            .history-grid { gap: 20px; }
            .history-card { padding: 20px; }
            .card-title { font-size: 18px; }
            .card-content p { font-size: 14px; }
        }

        @media (max-width: 480px) {
            .popup h1 { font-size: 22px; }
            .page-header h1 { font-size: 22px; }
            .total-entries { margin-top: 8px; width: 100%; text-align: left; }
            .history-grid { grid-template-columns: 1fr; }
            .no-history { padding: 40px 15px; font-size: 16px;}
            .no-history-icon { font-size: 40px; }
        }
    </style>
</head>
<body>
    <div class="popup-overlay" id="popup-overlay">
        <div class="popup" id="welcome-popup" role="dialog" aria-labelledby="popup-title" aria-modal="true">
            <h1 id="popup-title">Welcome to Your Purpose History</h1>
            <img src="${gifBase64}" alt="Illustration of a historical scroll or journal">
            <button id="continue-btn" class="popup-button" aria-label="Continue to history">
                View History →
            </button>
        </div>
    </div>
    <main class="main-content" id="main-content-area">
        <div class="page-header">
            <h1>Purpose History</h1>
            <span class="total-entries" id="total-entries-display">Total Entries: ${history.length}</span>
        </div>
        <div class="history-grid" id="history-items-container" role="list">
            ${historyItems}
        </div>
    </main>
    <script>
        const continueBtn = document.getElementById('continue-btn');
        const popupOverlay = document.getElementById('popup-overlay');
        const welcomePopup = document.getElementById('welcome-popup');
        const mainContent = document.getElementById('main-content-area');

        function showMainContent() {
            popupOverlay.classList.add('hidden');
            welcomePopup.classList.add('hidden');
            mainContent.style.display = 'block';
            setTimeout(() => {
                mainContent.style.opacity = '1';
            }, 50);
        }

        continueBtn.addEventListener('click', showMainContent);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !welcomePopup.classList.contains('hidden')) {
                showMainContent();
            }
        });
    </script>
</body>
</html>
                    `;
                    const blob = new Blob([html], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    window.location.href = url;
                };
                reader.readAsDataURL(blob);
            })
            .catch(e => {
                console.error('Error redirecting to history page:', e);
                alert('⚠️ Failed to load history page. Reloading...');
                setTimeout(() => location.reload(), 500);
            });
    }
};
