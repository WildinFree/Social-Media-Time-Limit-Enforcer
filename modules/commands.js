// modules/commands.js
// Handles the command-line interface.

var SMTLE = window.SMTLE || {};

SMTLE.commands = {
    handleCommand: function(input) {
        const cmd = input.trim().toLowerCase();
        const history = SMTLE.state.getHistory();

        switch (cmd) {
            case "/d":
                if (history.length === 0) {
                    alert("⚠️ No history to download.");
                    return setTimeout(() => location.reload(), 1000);
                }
                SMTLE.history.downloadText(history);
                return setTimeout(() => location.reload(), 1000);
            case "/d csv":
                if (history.length === 0) {
                    alert("⚠️ No history to download.");
                    return setTimeout(() => location.reload(), 1000);
                }
                SMTLE.history.downloadCSV(history);
                return setTimeout(() => location.reload(), 1000);
            case "/h clear":
                if (history.length === 0) {
                    alert("⚠️ No history to clear.");
                    return setTimeout(() => location.reload(), 1000);
                }
                SMTLE.history.clearHistory();
                return setTimeout(() => location.reload(), 1000);
            case "/h show":
                SMTLE.ui.redirectToHistoryPage();
                return;
            case "/s timeend": {
                const state = SMTLE.state.getTimerState() || {
                    site: location.hostname,
                    purpose: "Test Purpose",
                    duration: 10 * 60 * 1000,
                    timestamp: new Date().toLocaleString()
                };
                SMTLE.ui.redirectToExpiryPage(state);
                return;
            }
            case "/s maxtime":
                SMTLE.ui.redirectToLimitPage();
                return;
            case "/pause":
                SMTLE.timer.pauseTimer();
                return;
            case "/start":
                SMTLE.timer.startTimer();
                return;
            case "/end":
                SMTLE.timer.endTimer();
                return;
        }

        if (cmd.startsWith("/te ")) {
            const minutes = parseFloat(cmd.split(" ")[1]);
            if (isNaN(minutes) || minutes <= 0) {
                alert("⚠️ Invalid extension time. Use: /te [minutes]");
                return;
            }
            SMTLE.timer.extendTimer(minutes);
            return;
        }

        if (cmd.startsWith("/s limitend ")) {
            const minutes = parseFloat(cmd.split(" ")[2]);
            if (isNaN(minutes) || minutes <= 0) {
                alert("⚠️ Invalid duration. Use: /s limitend [minutes]");
                return;
            }
            alert(`⚠️ Simulating daily limit reached. ${location.hostname} will be blocked for ${minutes} minutes. Access will be restricted during this time.`);
            SMTLE.timer.setTempLimit(minutes);
            SMTLE.ui.redirectToLimitPage();
            return;
        }

        alert("⚠️ Invalid command. Available: /d, /d csv, /h clear, /h show, /s timeend, /s maxtime, /s limitend [minutes], /te [minutes], /pause, /start, /end");
    }
};
