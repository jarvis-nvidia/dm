function initializeDebugPanel(vscode) {
    window.copyToClipboard = function(resultId) {
        vscode.postMessage({ command: 'copyToClipboard', resultId });
    };

    window.applySolution = function(resultId) {
        vscode.postMessage({ command: 'applySolution', resultId });
    };

    window.applySuggestion = function(resultId, suggestionIndex) {
        vscode.postMessage({
            command: 'applySuggestion',
            resultId,
            suggestionIndex
        });
    };

    // Handle theme changes
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'themeChanged':
                updateTheme(message.theme);
                break;
        }
    });
}

function updateTheme(theme) {
    document.body.className = theme;
}
