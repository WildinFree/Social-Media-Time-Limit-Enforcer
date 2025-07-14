// modules/history.js

// ==UserScript==
// @name         Social Media Time Limit Enforcer - History
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  History management for the Social Media Time Limit Enforcer script.
// @author       WildinFree
// ==/UserScript==

/**
 * Adds a new session entry to the history.
 * @param {object} entry - The session data to log.
 */
function logSession(entry) {
    const history = getHistory();
    history.push(entry);
    if (history.length >= SMTLE_CONFIG.MAX_HISTORY) {
        alert("⚠️ Purpose history has reached 5000 entries. Consider clearing.");
    }
    saveHistory(history);
}

/**
 * Clears all entries from the history.
 */
function clearHistory() {
    try {
        localStorage.removeItem(SMTLE_CONFIG.HISTORY_KEY);
        alert("✅ History cleared.");
    } catch (e) {
        console.error('Error clearing history:', e);
        alert('⚠️ Failed to clear history. Please try again.');
    }
}

/**
 * A helper function to trigger a file download in the browser.
 * @param {string} filename - The desired name of the file.
 * @param {string} content - The content of the file.
 * @param {string} type - The MIME type of the file (e.g., 'text/plain').
 */
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

/**
 * Compiles the history into a plain text format and downloads it.
 * @param {Array<object>} history - The history array.
 */
function downloadText(history) {
    let content = `Purpose History Log\n===================\n\n`;
    history.forEach(h => {
        content += `Site: ${h.site}\nTime: ${h.timestamp}\nDuration: ${h.duration / 60000} min\nPurpose: ${h.purpose}\n--------------------------\n`;
    });
    triggerDownload("purposehistory.txt", content, "text/plain");
}

/**
 * Compiles the history into a CSV format and downloads it.
 * @param {Array<object>} history - The history array.
 */
function downloadCSV(history) {
    let content = "Site,Timestamp,Duration (min),Purpose\n";
    history.forEach(h => {
        const purpose = `"${(h.purpose || '').replace(/"/g, '""')}"`;
        content += `"${h.site}","${h.timestamp}",${h.duration / 60000},${purpose}\n`;
    });
    triggerDownload("purposehistory.csv", content, "text/csv");
}
