import * as vscode from 'vscode';
import { BasePanel, WebViewMessage } from '../webviews/BasePanel';
import { AuthManager, AuthState } from './AuthManager';

export class AuthPanel extends BasePanel {
    private authManager: AuthManager;

    constructor(context: vscode.ExtensionContext) {
        super(context, 'devmindAuth', 'DevMind Authentication');
        this.authManager = AuthManager.getInstance(context);
    }

    protected getWebviewContent(): string {
        const styleUri = this.getStylesheetUri();
        const scriptUri = this.getScriptUri('auth.js');
        const nonce = this.getNonce();
        const state = this.authManager.state;

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.panel.webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>DevMind Authentication</title>
            </head>
            <body>
                <div class="auth-container">
                    ${this.getAuthContent(state)}
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }

    private getAuthContent(state: AuthState): string {
        if (state.isAuthenticated) {
            return `
                <div class="auth-profile">
                    ${state.avatarUrl ? `
                        <img src="${state.avatarUrl}" alt="Profile" class="profile-avatar">
                    ` : ''}
                    <h2>Welcome, ${state.userName}!</h2>
                    <p>Authenticated via ${state.authMethod}</p>
                    ${state.scopes ? `
                        <div class="scope-list">
                            <h3>Authorized Scopes:</h3>
                            <ul>
                                ${state.scopes.map(scope => `
                                    <li>${scope}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    <div class="auth-actions">
                        <button class="action-button" onclick="changeAuth()">
                            Change Authentication Method
                        </button>
                        <button class="action-button warning" onclick="signOut()">
                            Sign Out
                        </button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="auth-options">
                    <h2>Sign in to DevMind</h2>
                    <p>Choose your authentication method:</p>
                    <div class="auth-buttons">
                        <button class="action-button github" onclick="signInWithGitHub()">
                            <i class="codicon codicon-github"></i>
                            Sign in with GitHub
                        </button>
                        <button class="action-button apikey" onclick="signInWithApiKey()">
                            <i class="codicon codicon-key"></i>
                            Use API Key
                        </button>
                    </div>
                </div>
            `;
        }
    }

    protected handleMessage(message: WebViewMessage): void {
        switch (message.command) {
            case 'signInWithGitHub':
                vscode.commands.executeCommand('devmind.startGitHubAuth');
                break;
            case 'signInWithApiKey':
                vscode.commands.executeCommand('devmind.promptApiKey');
                break;
            case 'signOut':
                vscode.commands.executeCommand('devmind.signOut');
                break;
            case 'changeAuth':
                vscode.commands.executeCommand('devmind.changeAuthMethod');
                break;
        }
    }
}
