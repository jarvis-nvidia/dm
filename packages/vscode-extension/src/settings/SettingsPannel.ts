import * as vscode from 'vscode';
import { BasePanel, WebViewMessage } from '../webviews/BasePanel';
import { SettingsManager, DevMindSettings } from './SettingsManager';

export class SettingsPanel extends BasePanel {
    private settings: DevMindSettings;
    private readonly settingsManager: SettingsManager;

    constructor(context: vscode.ExtensionContext) {
        super(context, 'devmindSettings', 'DevMind Settings');
        this.settingsManager = SettingsManager.getInstance();
        this.settings = this.settingsManager.getSettings();
    }

    protected getWebviewContent(): string {
        const styleUri = this.getStylesheetUri();
        const scriptUri = this.getScriptUri('settings.js');
        const nonce = this.getNonce();

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.panel.webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>DevMind Settings</title>
            </head>
            <body>
                <div class="settings-container">
                    <h1>DevMind Settings</h1>

                    <div class="settings-section">
                        <h2>API Configuration</h2>
                        <div class="setting-item">
                            <label for="apiUrl">API URL</label>
                            <input type="text" id="apiUrl" value="${this.settings.apiUrl}">
                        </div>
                        <div class="setting-item">
                            <label for="apiKey">API Key</label>
                            <input type="password" id="apiKey" value="${this.settings.apiKey}">
                        </div>
                    </div>

                    <div class="settings-section">
                        <h2>Debug Settings</h2>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="debugAutoSuggest"
                                    ${this.settings.debug.autoSuggest ? 'checked' : ''}>
                                Auto-suggest fixes
                            </label>
                        </div>
                        <div class="setting-item">
                            <label for="debugSeverity">Minimum Severity</label>
                            <select id="debugSeverity">
                                <option value="all" ${this.settings.debug.severity === 'all' ? 'selected' : ''}>All</option>
                                <option value="error" ${this.settings.debug.severity === 'error' ? 'selected' : ''}>Error</option>
                                <option value="warning" ${this.settings.debug.severity === 'warning' ? 'selected' : ''}>Warning</option>
                                <option value="info" ${this.settings.debug.severity === 'info' ? 'selected' : ''}>Info</option>
                            </select>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h2>Review Settings</h2>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="reviewAutoReview"
                                    ${this.settings.review.autoReview ? 'checked' : ''}>
                                Auto-review on save
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>Review Categories</label>
                            <div class="checkbox-group">
                                ${['security', 'performance', 'style', 'logic', 'documentation']
                                    .map(category => `
                                        <label>
                                            <input type="checkbox"
                                                   name="reviewCategories"
                                                   value="${category}"
                                                   ${this.settings.review.categories.includes(category) ? 'checked' : ''}>
                                            ${category.charAt(0).toUpperCase() + category.slice(1)}
                                        </label>
                                    `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h2>Commit Settings</h2>
                        <div class="setting-item">
                            <label for="commitTemplate">Commit Message Template</label>
                            <textarea id="commitTemplate" rows="4">${this.settings.commit.template}</textarea>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h2>Other Settings</h2>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="telemetryEnabled"
                                    ${this.settings.telemetry.enabled ? 'checked' : ''}>
                                Enable telemetry
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="themeUseCustom"
                                    ${this.settings.theme.useCustom ? 'checked' : ''}>
                                Use custom theme
                            </label>
                        </div>
                    </div>

                    <div class="settings-actions">
                        <button class="action-button" onclick="saveSettings()">Save Settings</button>
                        <button class="action-button secondary" onclick="resetSettings()">Reset to Defaults</button>
                    </div>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }

    protected handleMessage(message: WebViewMessage): void {
        switch (message.command) {
            case 'saveSettings':
                this.saveSettings(message.settings);
                break;
            case 'resetSettings':
                this.resetSettings();
                break;
        }
    }

    private async saveSettings(newSettings: DevMindSettings): Promise<void> {
        try {
            for (const [key, value] of Object.entries(newSettings)) {
                await this.settingsManager.updateSetting(key, value);
            }
            this.settings = this.settingsManager.getSettings();
            vscode.window.showInformationMessage('DevMind settings saved successfully');
            this.update();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to save settings: ${error.message}`);
        }
    }

    private async resetSettings(): Promise<void> {
        try {
            await this.settingsManager.resetToDefaults();
            this.settings = this.settingsManager.getSettings();
            vscode.window.showInformationMessage('DevMind settings reset to defaults');
            this.update();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to reset settings: ${error.message}`);
        }
    }
}
