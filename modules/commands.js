// modules/commands.js

// ==UserScript==
// @name         Social Media Time Limit Enforcer - Commands
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Command handler for the Social Media Time Limit Enforcer script.
// @author       You
// ==/UserScript==

function handleCommand(input) {
    const cmd = input.trim().toLowerCase();
    const history = getHistory();

    switch (cmd) {
        case "/d":
            if (history.length === 0) {
                alert("⚠️ No history to download.");
                return setTimeout(() => location.reload(), 1000);
            }
            downloadText(history);
            return setTimeout(() => location.reload(), 1000);
        case "/d csv":
            if (history.length === 0) {
                alert("⚠️ No history to download.");
                return setTimeout(() => location.reload(), 1000);
            }
            downloadCSV(history);
            return setTimeout(() => location.reload(), 1000);
        case "/h clear":
            if (history.length === 0) {
                alert("⚠️ No history to clear.");
                return setTimeout(() => location.reload(), 1000);
            }
            clearHistory();
            return setTimeout(() => location.reload(), 1000);
        case "/h show":
            redirectToHistoryPage();
            return;
        case "/s timeend": {
            const state = getTimerState() || {
                site: location.hostname,
                purpose: "Test Purpose",
                duration: 10 * 60 * 1000,
                timestamp: new Date().toLocaleString()
            };
            redirectToExpiryPage(state);
            return;
        }
        case "/s maxtime":
            redirectToLimitPage();
            return;
        case "/pause":
            pauseTimer();
            return;
        case "/start":
            startTimer();
            return;
        case "/end":
            endTimer();
            return;
    }

    if (cmd.startsWith("/te ")) {
        const minutes = parseFloat(cmd.split(" ")[1]);
        if (isNaN(minutes) || minutes <= 0) {
            alert("⚠️ Invalid extension time. Use: /te [minutes]");
            return;
        }
        extendTimer(minutes);
        return;
    }

    if (cmd.startsWith("/s limitend ")) {
        const minutes = parseFloat(cmd.split(" ")[2]);
        if (isNaN(minutes) || minutes <= 0) {
            alert("⚠️ Invalid duration. Use: /s limitend [minutes]");
            return;
        }
        alert(`⚠️ Simulating daily limit reached. ${location.hostname} will be blocked for ${minutes} minutes. Access will be restricted during this time.`);
        setTempLimit(minutes);
        redirectToLimitPage();
        return;
    }

    alert("⚠️ Invalid command. Available: /d, /d csv, /h clear, /h show, /s timeend, /s maxtime, /s limitend [minutes], /te [minutes], /pause, /start, /end");
}
