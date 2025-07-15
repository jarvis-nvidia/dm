let vscodeApi;

window.addEventListener('load', () => {
    vscodeApi = acquireVsCodeApi();
    setupEventListeners();
});

function setupEventListeners() {
    // Add change listeners for all inputs
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('change', () => {
            markDirty();
        });
    });

    // Special handling for checkbox groups
    document.querySelectorAll('.checkbox-group input').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            markDirty();
        });
    });
}

function markDirty() {
    document.querySelector('.settings-actions').classList.add('dirty');
}

function saveSettings() {
    const settings = {
        apiUrl: document.getElementById('apiUrl').value,
        apiKey: document.getElementById('apiKey').value,
        debug: {
            autoSuggest: document.getElementById('debugAutoSuggest').checked,
            severity: document.getElementById('debugSeverity').value
        },
        review: {
            autoReview: document.getElementById('reviewAutoReview').checked,
            categories: Array.from(document.querySelectorAll('input[name="reviewCategories"]:checked'))
                .map(cb => cb.value)
        },
        commit: {
            template: document.getElementById('commitTemplate').value
        },
        telemetry: {
            enabled: document.getElementById('telemetryEnabled').checked
        },
        theme: {
            useCustom: document.getElementById('themeUseCustom').checked
        }
    };

    vscodeApi.postMessage({ command: 'saveSettings', settings });
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to their defaults?')) {
        vscodeApi.postMessage({ command: 'resetSettings' });
    }
}

// Handle theme changes
window.addEventListener('message', event => {
    const message = event.data;
    if (message.command === 'themeChanged') {
        document.body.className = message.theme;
    }
});
