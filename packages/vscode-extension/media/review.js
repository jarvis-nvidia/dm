function initializeReviewPanel(vscode) {
    window.selectFile = function(file) {
        vscode.postMessage({ command: 'selectFile', file });
    };

    window.gotoLocation = function(file, line) {
        vscode.postMessage({ command: 'gotoLocation', file, line });
    };

    window.applyFix = function(commentId) {
        vscode.postMessage({ command: 'applyFix', commentId });
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
