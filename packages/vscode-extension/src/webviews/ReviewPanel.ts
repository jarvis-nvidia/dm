import * as vscode from 'vscode';
import { BasePanel, WebViewMessage } from './BasePanel';

interface ReviewComment {
    id: string;
    file: string;
    line: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
    fix?: {
        description: string;
        code: string;
    };
}

interface ReviewResult {
    summary: {
        totalIssues: number;
        errorCount: number;
        warningCount: number;
        infoCount: number;
    };
    comments: ReviewComment[];
    suggestions: {
        general: string[];
        performance: string[];
        security: string[];
    };
}

export class ReviewPanel extends BasePanel {
    private reviewResult: ReviewResult;
    private activeFile?: string;

    constructor(
        context: vscode.ExtensionContext,
        result: ReviewResult
    ) {
        super(context, 'devmindReview', 'DevMind Code Review');
        this.reviewResult = result;
    }

    protected getWebviewContent(): string {
        const styleUri = this.getStylesheetUri();
        const scriptUri = this.getScriptUri('review.js');
        const nonce = this.getNonce();

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.panel.webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>Code Review Results</title>
            </head>
            <body>
                <div class="review-container">
                    ${this.renderSummary()}
                    <div class="review-content">
                        <div class="review-sidebar">
                            ${this.renderFileList()}
                        </div>
                        <div class="review-main">
                            <div class="review-comments">
                                ${this.renderComments()}
                            </div>
                            <div class="review-suggestions">
                                ${this.renderSuggestions()}
                            </div>
                        </div>
                    </div>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();

                    document.addEventListener('DOMContentLoaded', function() {
                        initializeReviewPanel(vscode);
                    });
                </script>
            </body>
            </html>
        `;
    }

    private renderSummary(): string {
        const { summary } = this.reviewResult;
        return `
            <div class="review-summary">
                <h1>Code Review Analysis</h1>
                <div class="summary-stats">
                    <div class="stat-item total">
                        <span class="stat-number">${summary.totalIssues}</span>
                        <span class="stat-label">Total Issues</span>
                    </div>
                    <div class="stat-item error">
                        <span class="stat-number">${summary.errorCount}</span>
                        <span class="stat-label">Errors</span>
                    </div>
                    <div class="stat-item warning">
                        <span class="stat-number">${summary.warningCount}</span>
                        <span class="stat-label">Warnings</span>
                    </div>
                    <div class="stat-item info">
                        <span class="stat-number">${summary.infoCount}</span>
                        <span class="stat-label">Info</span>
                    </div>
                </div>
            </div>
        `;
    }

    private renderFileList(): string {
        const files = [...new Set(this.reviewResult.comments.map(c => c.file))];
        return `
            <div class="file-list">
                <h3>Files</h3>
                ${files.map(file => `
                    <div class="file-item ${this.activeFile === file ? 'active' : ''}"
                         onclick="selectFile('${this.escapeHtml(file)}')">
                        <span class="file-name">${this.escapeHtml(file.split('/').pop() || '')}</span>
                        <span class="issue-count">
                            ${this.reviewResult.comments.filter(c => c.file === file).length}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    private renderComments(): string {
        const comments = this.activeFile
            ? this.reviewResult.comments.filter(c => c.file === this.activeFile)
            : this.reviewResult.comments;

        return `
            <div class="comments-section">
                <h3>Review Comments</h3>
                ${comments.map(comment => `
                    <div class="comment-item severity-${comment.severity}" id="comment-${comment.id}">
                        <div class="comment-header">
                            <span class="comment-location">
                                ${this.escapeHtml(comment.file)}:${comment.line}
                            </span>
                            <span class="severity-badge ${comment.severity}">
                                ${comment.severity}
                            </span>
                        </div>
                        <div class="comment-content">
                            <p>${this.escapeHtml(comment.message)}</p>
                            ${comment.fix ? `
                                <div class="fix-suggestion">
                                    <h4>Suggested Fix:</h4>
                                    <pre><code>${this.escapeHtml(comment.fix.code)}</code></pre>
                                    <p>${this.escapeHtml(comment.fix.description)}</p>
                                    <button class="action-button apply-fix"
                                            onclick="applyFix('${comment.id}')">
                                        Apply Fix
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                        <div class="comment-actions">
                            <button class="action-button goto"
                                    onclick="gotoLocation('${comment.file}', ${comment.line})">
                                Go to Location
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    private renderSuggestions(): string {
        const { suggestions } = this.reviewResult;
        return `
            <div class="suggestions-section">
                <h3>Improvement Suggestions</h3>
                ${this.renderSuggestionCategory('General', suggestions.general)}
                ${this.renderSuggestionCategory('Performance', suggestions.performance)}
                ${this.renderSuggestionCategory('Security', suggestions.security)}
            </div>
        `;
    }

    private renderSuggestionCategory(title: string, items: string[]): string {
        if (!items.length) return '';

        return `
            <div class="suggestion-category">
                <h4>${title}</h4>
                <ul>
                    ${items.map(item => `
                        <li>${this.escapeHtml(item)}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    protected handleMessage(message: WebViewMessage): void {
        switch (message.command) {
            case 'selectFile':
                this.activeFile = message.file;
                this.update();
                break;
            case 'gotoLocation':
                this.handleGotoLocation(message.file, message.line);
                break;
            case 'applyFix':
                this.handleApplyFix(message.commentId);
                break;
        }
    }

    private async handleGotoLocation(file: string, line: number): Promise<void> {
        try {
            const document = await vscode.workspace.openTextDocument(file);
            const editor = await vscode.window.showTextDocument(document);
            const position = new vscode.Position(line - 1, 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(
                new vscode.Range(position, position),
                vscode.TextEditorRevealType.InCenter
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open location: ${error.message}`);
        }
    }

    private handleApplyFix(commentId: string): void {
        const comment = this.reviewResult.comments.find(c => c.id === commentId);
        if (comment?.fix) {
            this.postMessage({
                command: 'applyFix',
                file: comment.file,
                line: comment.line,
                fix: comment.fix.code
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
