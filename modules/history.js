// modules/history.js

// ==UserScript==
// @name         Social Media Time Limit Enforcer - History
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  History management for the Social Media Time Limit Enforcer script.
// @author       You
// ==/UserScript==

function logSession(entry) {
    const history = getHistory();
    history.push(entry);
    if (history.length >= SMTLE_CONFIG.MAX_HISTORY) {
        alert("⚠️ Purpose history has reached 5000 entries. Consider clearing.");
    }
    saveHistory(history);
}

function clearHistory() {
    try {
        localStorage.removeItem(SMTLE_CONFIG.HISTORY_KEY);
        alert("✅ History cleared.");
    } catch (e) {
        console.error('Error clearing history:', e);
        alert('⚠️ Failed to clear history. Please try again.');
    }
}

function triggerDownload(filename, content, type) {
    try {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Error triggering download:', e);
        alert('⚠️ Failed to download file. Please try again.');
    }
}

function downloadText(history) {
    let content = `Purpose History Log\n===================\n\n`;
    history.forEach(h => {
        content += `Site: ${h.site}\nTime: ${h.timestamp}\nDuration: ${h.duration / 60000} min\nPurpose: ${h.purpose}\n--------------------------\n`;
    });
    triggerDownload("purposehistory.txt", content, "text/plain");
}

function downloadCSV(history) {
    let content = "Site,Timestamp,Duration (min),Purpose\n";
    history.forEach(h => {
        content += `"${h.site}","${h.timestamp}",${h.duration / 60000},"${h.purpose.replace(/"/g, '""')}"\n`;
    });
    triggerDownload("purposehistory.csv", content, "text/csv");
}
