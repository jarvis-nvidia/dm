import * as vscode from 'vscode';
import { DevMindClient } from '../api/devmindClient';

interface ReviewContext {
    diff: string;
    filePaths: string[];
    repository?: string;
    prTitle?: string;
    prDescription?: string;
    language?: string;
}

export class ReviewCommandHandler {
    private readonly client: DevMindClient;
    private readonly context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext, client: DevMindClient) {
        this.context = context;
        this.client = client;
    }

    /**
     * Registers the review command with VS Code
     */
    public register(): vscode.Disposable {
        return vscode.commands.registerCommand('devmind.requestReview', () => this.execute());
    }

    /**
     * Main execution logic for the review command
     */
    private async execute(): Promise<void> {
        try {
            // Check if Git is available
            const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
            if (!gitExtension) {
                vscode.window.showErrorMessage('Git extension is required for code review');
                return;
            }

            // Get review context
            const reviewContext = await this.getReviewContext(gitExtension);
            if (!reviewContext) {
                vscode.window.showErrorMessage('No changes found to review');
                return;
            }

            // Show progress during API call
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Analyzing code changes...",
                cancellable: false
            }, async (progress) => {
                try {
                    // Call API for review analysis
                    const response = await this.client.review({
                        code_diff: reviewContext.diff,
                        file_paths: reviewContext.filePaths,
                        repository: reviewContext.repository,
                        pr_title: reviewContext.prTitle,
                        pr_description: reviewContext.prDescription,
                        language: reviewContext.language
                    });

                    // Show results in a new webview panel
                    await this.showReviewResults(response);
                } catch (error) {
                    vscode.window.showErrorMessage(`Code review failed: ${error.message}`);
                }
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to execute review command: ${error.message}`);
        }
    }

    /**
     * Gathers review context from Git
     */
    private async getReviewContext(gitExtension: any): Promise<ReviewContext | undefined> {
        try {
            const api = gitExtension.getAPI(1);
            const repo = api.repositories[0];

            if (!repo) {
                vscode.window.showErrorMessage('No Git repository found');
                return undefined;
            }

            // Get changes
            const changes = await this.getGitChanges(repo);
            if (!changes) {
                return undefined;
            }

            // Get repository information
            const repoInfo = await this.getRepositoryInfo(repo);

            // Get PR information if available
            const prInfo = await this.getPullRequestInfo(repo);

            return {
                ...changes,
                ...repoInfo,
                ...prInfo
            };
        } catch (error) {
            console.error('Error getting review context:', error);
            return undefined;
        }
    }

    /**
     * Gets Git changes (diff and file paths)
     */
    private async getGitChanges(repo: any): Promise<{ diff: string; filePaths: string[] } | undefined> {
        try {
            // Get staged changes first
            let diff = await repo.diff(true);
            let changes = repo.state.workingTreeChanges.filter(change => change.staged);

            // If no staged changes, ask user if they want to review unstaged changes
            if (!diff) {
                const unstaged = await repo.diff(false);
                if (unstaged) {
                    const choice = await vscode.window.showQuickPick(['Yes', 'No'], {
                        placeHolder: 'No staged changes found. Would you like to review unstaged changes?'
                    });

                    if (choice === 'Yes') {
                        diff = unstaged;
                        changes = repo.state.workingTreeChanges;
                    } else {
                        return undefined;
                    }
                } else {
                    return undefined;
                }
            }

            return {
                diff,
                filePaths: changes.map(change => change.uri.fsPath)
            };
        } catch (error) {
            console.error('Error getting Git changes:', error);
            return undefined;
        }
    }

    /**
     * Gets repository information
     */
    private async getRepositoryInfo(repo: any): Promise<{ repository?: string; language?: string }> {
        try {
            const remote = await repo.getConfig('remote.origin.url');
            const match = remote?.value?.match(/github\.com[:/]([^/]+\/[^/.]+)/);

            // Get primary language from workspace
            const language = vscode.workspace.textDocuments[0]?.languageId;

            return {
                repository: match ? match[1] : undefined,
                language
            };
        } catch {
            return {};
        }
    }

    /**
     * Gets Pull Request information if available
     */
    private async getPullRequestInfo(repo: any): Promise<{ prTitle?: string; prDescription?: string }> {
        try {
            // This is a placeholder for GitHub PR API integration
            // In a future implementation, this could fetch actual PR data
            const message = await repo.getCommitTemplate();
            return {
                prTitle: message ? message.split('\n')[0] : undefined,
                prDescription: message || undefined
            };
        } catch {
            return {};
        }
    }

    /**
     * Shows review results in a webview panel
     */
    private async showReviewResults(response: any): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'devmindReview',
            'DevMind Code Review',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // Create HTML content for the webview
        panel.webview.html = this.getWebviewContent(response);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'applyFix':
                        await this.applyFix(message.fix);
                        return;
                    case 'copyToClipboard':
                        vscode.env.clipboard.writeText(message.text);
                        vscode.window.showInformationMessage('Copied to clipboard');
                        return;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    /**
     * Applies a suggested fix to the code
     */
    private async applyFix(fix: { file: string; changes: { old: string; new: string }[] }): Promise<void> {
        try {
            const document = await vscode.workspace.openTextDocument(fix.file);
            const edit = new vscode.WorkspaceEdit();

            for (const change of fix.changes) {
                const range = document.getText().indexOf(change.old);
                if (range !== -1) {
                    const startPos = document.positionAt(range);
                    const endPos = document.positionAt(range + change.old.length);
                    edit.replace(document.uri, new vscode.Range(startPos, endPos), change.new);
                }
            }

            await vscode.workspace.applyEdit(edit);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to apply fix: ${error.message}`);
        }
    }

    /**
     * Generates the HTML content for the webview
     */
    private getWebviewContent(response: any): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Code Review Results</title>
                <style>
                    body {
                        padding: 20px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    }
                    .review-item {
                        margin: 20px 0;
                        padding: 15px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }
                    .severity-high { border-left: 4px solid #dc3545; }
                    .severity-medium { border-left: 4px solid #ffc107; }
                    .severity-low { border-left: 4px solid #28a745; }
                    .fix-button {
                        margin: 5px;
                        padding: 5px 10px;
                        background: #007acc;
                        color: white;
                        border: none;
                        border-radius: 3px;
                        cursor: pointer;
                    }
                    .fix-button:hover { background: #005999; }
                    pre {
                        background: #f8f8f8;
                        padding: 10px;
                        border-radius: 3px;
                        overflow-x: auto;
                    }
                </style>
            </head>
            <body>
                <h2>Code Review Analysis</h2>
                ${this.formatReviewResponse(response)}
                <script>
                    const vscode = acquireVsCodeApi();

                    function applyFix(fix) {
                        vscode.postMessage({
                            command: 'applyFix',
                            fix: JSON.parse(decodeURIComponent(fix))
                        });
                    }

                    function copyToClipboard(text) {
                        vscode.postMessage({
                            command: 'copyToClipboard',
                            text: text
                        });
                    }
                </script>
            </body>
            </html>
        `;
    }

    /**
     * Formats the review response into HTML
     */
    private formatReviewResponse(response: any): string {
        if (!response || !response.reviews) {
            return '<p>No review comments found.</p>';
        }

        return response.reviews.map((review: any) => `
            <div class="review-item severity-${review.severity || 'medium'}">
                <h3>${this.escapeHtml(review.title || 'Review Comment')}</h3>
                <p>${this.escapeHtml(review.description || '')}</p>
                ${review.code ? `<pre>${this.escapeHtml(review.code)}</pre>` : ''}
                ${review.suggestion ? `
                    <div>
                        <h4>Suggested Fix:</h4>
                        <pre>${this.escapeHtml(review.suggestion)}</pre>
                        ${review.fix ? `
                            <button class="fix-button"
                                onclick="applyFix('${encodeURIComponent(JSON.stringify(review.fix))}')">
                                Apply Fix
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    /**
     * Escapes HTML special characters
     */
    private escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
