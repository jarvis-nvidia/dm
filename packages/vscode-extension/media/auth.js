const vscode = acquireVsCodeApi();

function signInWithGitHub() {
    vscode.postMessage({ command: 'signInWithGitHub' });
}

function signInWithApiKey() {
    vscode.postMessage({ command: 'signInWithApiKey' });
}

function signOut() {
    vscode.postMessage({ command: 'signOut' });
}

function changeAuth() {
    vscode.postMessage({ command: 'changeAuth' });
}

// Handle theme changes
window.addEventListener('message', event => {
    const message = event.data;
    if (message.command === 'themeChanged') {
        document.body.className = message.theme;
    }
});
