// modules/history.js
// Manages session history logging and downloads.

var SMTLE = window.SMTLE || {};

SMTLE.history = {
    logSession: function(entry) {
        const history = SMTLE.state.getHistory();
        history.push(entry);
        if (history.length >= SMTLE.config.MAX_HISTORY) {
            alert("⚠️ Purpose history has reached 5000 entries. Consider clearing.");
        }
        SMTLE.state.saveHistory(history);
    },

    clearHistory: function() {
        try {
            localStorage.removeItem(SMTLE.config.HISTORY_KEY);
            alert("✅ History cleared.");
        } catch (e) {
            console.error('Error clearing history:', e);
            alert('⚠️ Failed to clear history. Please try again.');
        }
    },

    triggerDownload: function(filename, content, type) {
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
    },

    downloadText: function(history) {
        let content = `Purpose History Log\n===================\n\n`;
        history.forEach(h => {
            content += `Site: ${h.site}\nTime: ${h.timestamp}\nDuration: ${h.duration / 60000} min\nPurpose: ${h.purpose}\n--------------------------\n`;
        });
        this.triggerDownload("purposehistory.txt", content, "text/plain");
    },

    downloadCSV: function(history) {
        let content = "Site,Timestamp,Duration (min),Purpose\n";
        history.forEach(h => {
            content += `"${h.site}","${h.timestamp}",${h.duration / 60000},"${h.purpose.replace(/"/g, '""')}"\n`;
        });
        this.triggerDownload("purposehistory.csv", content, "text/csv");
    }
};
