import * as vscode from 'vscode';
import { BasePanel, WebViewMessage } from './BasePanel';

interface DebugResult {
    id: string;
    title: string;
    description: string;
    code?: string;
    solution?: string;
    severity: 'high' | 'medium' | 'low';
    suggestions?: Array<{
        description: string;
        code: string;
    }>;
}

export class DebugPanel extends BasePanel {
    private debugResults: DebugResult[];

    constructor(
        context: vscode.ExtensionContext,
        results: DebugResult[]
    ) {
        super(context, 'devmindDebug', 'DevMind Debug Results');
        this.debugResults = results;
    }

    protected getWebviewContent(): string {
        const styleUri = this.getStylesheetUri();
        const scriptUri = this.getScriptUri('debug.js');
        const nonce = this.getNonce();

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.panel.webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>Debug Results</title>
            </head>
            <body>
                <div class="debug-container">
                    <div class="debug-header">
                        <h1>Debug Analysis Results</h1>
                        <div class="debug-stats">
                            <span class="stat high">High: ${this.countBySeverity('high')}</span>
                            <span class="stat medium">Medium: ${this.countBySeverity('medium')}</span>
                            <span class="stat low">Low: ${this.countBySeverity('low')}</span>
                        </div>
                    </div>
                    <div class="debug-results">
                        ${this.renderDebugResults()}
                    </div>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();

                    document.addEventListener('DOMContentLoaded', function() {
                        initializeDebugPanel(vscode);
                    });
                </script>
            </body>
            </html>
        `;
    }

    private countBySeverity(severity: string): number {
        return this.debugResults.filter(result => result.severity === severity).length;
    }

    private renderDebugResults(): string {
        return this.debugResults.map(result => `
            <div class="debug-item severity-${result.severity}" id="debug-${result.id}">
                <div class="debug-item-header">
                    <h3>${this.escapeHtml(result.title)}</h3>
                    <span class="severity-badge ${result.severity}">${result.severity}</span>
                </div>
                <div class="debug-item-content">
                    <p class="description">${this.escapeHtml(result.description)}</p>
                    ${result.code ? `
                        <div class="code-block">
                            <h4>Problematic Code:</h4>
                            <pre><code>${this.escapeHtml(result.code)}</code></pre>
                        </div>
                    ` : ''}
                    ${result.solution ? `
                        <div class="solution-block">
                            <h4>Solution:</h4>
                            <p>${this.escapeHtml(result.solution)}</p>
                        </div>
                    ` : ''}
                    ${this.renderSuggestions(result)}
                </div>
                <div class="debug-item-actions">
                    <button class="action-button copy" onclick="copyToClipboard('${result.id}')">
                        Copy Solution
                    </button>
                    <button class="action-button apply" onclick="applySolution('${result.id}')">
                        Apply Fix
                    </button>
                </div>
            </div>
        `).join('');
    }

    private renderSuggestions(result: DebugResult): string {
        if (!result.suggestions?.length) {
            return '';
        }

        return `
            <div class="suggestions-block">
                <h4>Suggested Fixes:</h4>
                ${result.suggestions.map((suggestion, index) => `
                    <div class="suggestion">
                        <p>${this.escapeHtml(suggestion.description)}</p>
                        <pre><code>${this.escapeHtml(suggestion.code)}</code></pre>
                        <button class="action-button apply-suggestion"
                                onclick="applySuggestion('${result.id}', ${index})">
                            Apply This Fix
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    protected handleMessage(message: WebViewMessage): void {
        switch (message.command) {
            case 'copyToClipboard':
                this.handleCopy(message.resultId);
                break;
            case 'applySolution':
                this.handleApplySolution(message.resultId);
                break;
            case 'applySuggestion':
                this.handleApplySuggestion(message.resultId, message.suggestionIndex);
                break;
        }
    }

    private handleCopy(resultId: string): void {
        const result = this.debugResults.find(r => r.id === resultId);
        if (result?.solution) {
            vscode.env.clipboard.writeText(result.solution);
            vscode.window.showInformationMessage('Solution copied to clipboard');
        }
    }

    private handleApplySolution(resultId: string): void {
        const result = this.debugResults.find(r => r.id === resultId);
        if (result?.solution) {
            this.postMessage({
                command: 'applyFix',
                fix: result.solution
            });
        }
    }

    private handleApplySuggestion(resultId: string, suggestionIndex: number): void {
        const result = this.debugResults.find(r => r.id === resultId);
        const suggestion = result?.suggestions?.[suggestionIndex];
        if (suggestion) {
            this.postMessage({
                command: 'applyFix',
                fix: suggestion.code
            });
        }
    }

    private escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
