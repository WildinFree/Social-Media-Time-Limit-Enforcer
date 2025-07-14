// modules/commands.js

// ==UserScript==
// @name         Social Media Time Limit Enforcer - Commands
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Command handler for the Social Media Time Limit Enforcer script.
// @author       WildinFree
// ==/UserScript==

/**
 * Parses and executes user commands.
 * @param {string} input - The command string entered by the user.
 */
function handleCommand(input) {
    const cmd = input.trim().toLowerCase();
    const history = getHistory();

    // Handle commands with arguments first
    if (cmd.startsWith("/te ")) {
        const minutes = parseFloat(cmd.split(" ")[1]);
        if (isNaN(minutes) || minutes <= 0) {
            alert("⚠️ Invalid extension time. Use: /te [minutes]");
        } else {
            extendTimer(minutes);
        }
        return;
    }

    if (cmd.startsWith("/s limitend ")) {
        const minutes = parseFloat(cmd.split(" ")[2]);
        if (isNaN(minutes) || minutes <= 0) {
            alert("⚠️ Invalid duration. Use: /s limitend [minutes]");
        } else {
            alert(`⚠️ Simulating daily limit reached. ${location.hostname} will be blocked for ${minutes} minutes. Access will be restricted during this time.`);
            setTempLimit(minutes);
            redirectToLimitPage();
        }
        return;
    }

    // Handle commands without arguments
    switch (cmd) {
        case "/d":
            if (history.length > 0) downloadText(history);
            else alert("⚠️ No history to download.");
            break;
        case "/d csv":
            if (history.length > 0) downloadCSV(history);
            else alert("⚠️ No history to download.");
            break;
        case "/h clear":
            if (history.length > 0) {
                clearHistory();
                location.reload();
            } else {
                alert("⚠️ No history to clear.");
            }
            break;
        case "/h show":
            redirectToHistoryPage();
            break;
        case "/s timeend": {
            const state = getTimerState() || {
                site: location.hostname,
                purpose: "Test Purpose",
                duration: 10 * 60 * 1000,
                timestamp: new Date().toLocaleString()
            };
            redirectToExpiryPage(state);
            break;
        }
        case "/s maxtime":
            redirectToLimitPage();
            break;
        case "/pause":
            pauseTimer();
            break;
        case "/start":
            startTimer();
            break;
        case "/end":
            endTimer();
            break;
        default:
            alert("⚠️ Invalid command. Available: /d, /d csv, /h clear, /h show, /s timeend, /s maxtime, /s limitend [minutes], /te [minutes], /pause, /start, /end");
            break;
    }
}
