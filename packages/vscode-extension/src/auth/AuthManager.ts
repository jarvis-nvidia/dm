import * as vscode from 'vscode';
import { DevMindClient } from '../api/devmindClient';
import { SettingsManager } from '../settings/SettingsManager';

export interface AuthState {
    isAuthenticated: boolean;
    userName?: string;
    avatarUrl?: string;
    authMethod: 'github' | 'apiKey' | 'none';
    scopes?: string[];
}

export class AuthManager {
    private static instance: AuthManager;
    private context: vscode.ExtensionContext;
    private settingsManager: SettingsManager;
    private statusBarItem: vscode.StatusBarItem;
    private _state: AuthState;
    private client?: DevMindClient;

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.settingsManager = SettingsManager.getInstance();
        this._state = {
            isAuthenticated: false,
            authMethod: 'none'
        };
        this.statusBarItem = this.createStatusBarItem();
    }

    public static getInstance(context?: vscode.ExtensionContext): AuthManager {
        if (!AuthManager.instance && context) {
            AuthManager.instance = new AuthManager(context);
        }
        return AuthManager.instance;
    }

    private createStatusBarItem(): vscode.StatusBarItem {
        const item = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        item.command = 'devmind.manageAuth';
        this.updateStatusBarItem(item);
        return item;
    }

    private updateStatusBarItem(item: vscode.StatusBarItem = this.statusBarItem): void {
        if (this._state.isAuthenticated) {
            item.text = `$(check) DevMind: ${this._state.userName}`;
            item.tooltip = `Authenticated as ${this._state.userName} via ${this._state.authMethod}`;
        } else {
            item.text = '$(key) DevMind: Sign In';
            item.tooltip = 'Click to authenticate with DevMind';
        }
        item.show();
    }

    public async initialize(client: DevMindClient): Promise<void> {
        this.client = client;
        await this.checkAuthState();
        this.registerCommands();
    }

    private registerCommands(): void {
        this.context.subscriptions.push(
            vscode.commands.registerCommand('devmind.manageAuth', () => {
                this.showAuthMenu();
            }),
            vscode.commands.registerCommand('devmind.signIn', () => {
                this.startSignIn();
            }),
            vscode.commands.registerCommand('devmind.signOut', () => {
                this.signOut();
            })
        );
    }

    private async checkAuthState(): Promise<void> {
        try {
            const settings = this.settingsManager.getSettings();
            if (settings.apiKey) {
                const userInfo = await this.client?.getUserInfo();
                if (userInfo) {
                    this._state = {
                        isAuthenticated: true,
                        userName: userInfo.login,
                        avatarUrl: userInfo.avatar_url,
                        authMethod: 'apiKey',
                        scopes: userInfo.scopes
                    };
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
        this.updateStatusBarItem();
    }

    private async showAuthMenu(): Promise<void> {
        const items: vscode.QuickPickItem[] = this._state.isAuthenticated
            ? [
                {
                    label: '$(sign-out) Sign Out',
                    description: `Currently signed in as ${this._state.userName}`,
                    detail: `Authentication method: ${this._state.authMethod}`
                },
                {
                    label: '$(key) Change Authentication Method',
                    description: 'Switch between GitHub OAuth and API Key'
                }
            ]
            : [
                {
                    label: '$(github) Sign in with GitHub',
                    description: 'Authenticate using GitHub OAuth'
                },
                {
                    label: '$(key) Use API Key',
                    description: 'Authenticate using a DevMind API Key'
                }
            ];

        const selection = await vscode.window.showQuickPick(items, {
            placeHolder: this._state.isAuthenticated
                ? 'Manage DevMind Authentication'
                : 'Sign in to DevMind'
        });

        if (selection) {
            if (selection.label.includes('Sign Out')) {
                await this.signOut();
            } else if (selection.label.includes('Sign in with GitHub')) {
                await this.startGitHubAuth();
            } else if (selection.label.includes('Use API Key')) {
                await this.promptApiKey();
            } else if (selection.label.includes('Change Authentication')) {
                await this.showAuthMethodChange();
            }
        }
    }

    private async startSignIn(): Promise<void> {
        await this.showAuthMenu();
    }

    private async startGitHubAuth(): Promise<void> {
        try {
            // Create OAuth URL
            const state = Math.random().toString(36).substring(7);
            const clientId = await this.client?.getGitHubClientId();
            const scopes = ['repo', 'user'];
            const redirectUri = await this.client?.getRedirectUri();

            const authUrl = new URL('https://github.com/login/oauth/authorize');
            authUrl.searchParams.append('client_id', clientId!);
            authUrl.searchParams.append('scope', scopes.join(' '));
            authUrl.searchParams.append('state', state);
            authUrl.searchParams.append('redirect_uri', redirectUri!);

            // Store state for verification
            await this.context.secrets.store('oauth-state', state);

            // Show progress and open browser
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Authenticating with GitHub...",
                cancellable: false
            }, async () => {
                // Open browser for auth
                await vscode.env.openExternal(vscode.Uri.parse(authUrl.toString()));

                // Start local server to receive callback
                const code = await this.waitForAuthCallback();
                if (code) {
                    await this.completeGitHubAuth(code, state);
                }
            });
        } catch (error) {
            vscode.window.showErrorMessage(`GitHub authentication failed: ${error.message}`);
        }
    }

    private async waitForAuthCallback(): Promise<string> {
        // This would be implemented to start a local server and wait for the OAuth callback
        // For brevity, this implementation is simplified
        return new Promise((resolve) => {
            // Implementation would listen on localhost for the OAuth callback
            // and resolve with the authorization code
        });
    }

    private async completeGitHubAuth(code: string, state: string): Promise<void> {
        const storedState = await this.context.secrets.get('oauth-state');
        if (state !== storedState) {
            throw new Error('Invalid state parameter');
        }

        try {
            const response = await this.client?.exchangeCodeForToken(code);
            if (response?.access_token) {
                await this.settingsManager.updateSetting('apiKey', response.access_token);
                const userInfo = await this.client?.getUserInfo();
                if (userInfo) {
                    this._state = {
                        isAuthenticated: true,
                        userName: userInfo.login,
                        avatarUrl: userInfo.avatar_url,
                        authMethod: 'github',
                        scopes: userInfo.scopes
                    };
                    this.updateStatusBarItem();
                    vscode.window.showInformationMessage(`Successfully signed in as ${userInfo.login}`);
                }
            }
        } catch (error) {
            throw new Error(`Failed to complete authentication: ${error.message}`);
        }
    }

    private async promptApiKey(): Promise<void> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your DevMind API Key',
            password: true,
            ignoreFocusOut: true,
            validateInput: (value) => {
                return value && value.length > 0 ? null : 'API Key is required';
            }
        });

        if (apiKey) {
            try {
                await this.settingsManager.updateSetting('apiKey', apiKey);
                await this.checkAuthState();
                vscode.window.showInformationMessage('API Key saved successfully');
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to save API Key: ${error.message}`);
            }
        }
    }

    private async showAuthMethodChange(): Promise<void> {
        const selection = await vscode.window.showQuickPick([
            {
                label: '$(github) Switch to GitHub OAuth',
                description: 'Use GitHub account for authentication'
            },
            {
                label: '$(key) Switch to API Key',
                description: 'Use DevMind API Key for authentication'
            }
        ], {
            placeHolder: 'Select new authentication method'
        });

        if (selection) {
            await this.signOut(false);
            if (selection.label.includes('GitHub')) {
                await this.startGitHubAuth();
            } else {
                await this.promptApiKey();
            }
        }
    }

    private async signOut(showConfirmation: boolean = true): Promise<void> {
        if (showConfirmation) {
            const confirm = await vscode.window.showWarningMessage(
                'Are you sure you want to sign out?',
                'Yes',
                'No'
            );
            if (confirm !== 'Yes') {
                return;
            }
        }

        try {
            await this.settingsManager.updateSetting('apiKey', '');
            await this.context.secrets.delete('oauth-state');
            this._state = {
                isAuthenticated: false,
                authMethod: 'none'
            };
            this.updateStatusBarItem();
            vscode.window.showInformationMessage('Successfully signed out');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to sign out: ${error.message}`);
        }
    }

    public get state(): AuthState {
        return this._state;
    }
}
