import * as vscode from 'vscode';
import { DevMindClient } from '../api/devmindClient';

interface DebugContext {
    code: string;
    error?: string;
    filePath?: string;
    language?: string;
    repository?: string;
}

export class DebugCommandHandler {
    private readonly client: DevMindClient;
    private readonly context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext, client: DevMindClient) {
        this.context = context;
        this.client = client;
    }

    /**
     * Registers the debug command with VS Code
     */
    public register(): vscode.Disposable {
        return vscode.commands.registerCommand('devmind.askForDebug', () => this.execute());
    }

    /**
     * Main execution logic for the debug command
     */
    private async execute(): Promise<void> {
        try {
            // Get the active editor
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('Please open a file to debug');
                return;
            }

            // Get debug context from current file
            const debugContext = await this.getDebugContext(editor);

            // Show progress during API call
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Analyzing code...",
                cancellable: false
            }, async (progress) => {
                try {
                    // Call API for debug analysis
                    const response = await this.client.debug({
                        problem_description: "Please analyze this code and provide debugging assistance",
                        code_snippet: debugContext.code,
                        error_message: debugContext.error,
                        repository: debugContext.repository,
                        file_path: debugContext.filePath,
                        language: debugContext.language
                    });

                    // Show results in a new webview panel
                    await this.showDebugResults(response);
                } catch (error) {
                    vscode.window.showErrorMessage(`Debug analysis failed: ${error.message}`);
                }
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to execute debug command: ${error.message}`);
        }
    }

    /**
     * Gathers debug context from the current editor
     */
    private async getDebugContext(editor: vscode.TextEditor): Promise<DebugContext> {
        const document = editor.document;
        const selection = editor.selection;

        // Get selected code or entire file content
        const code = selection.isEmpty ?
            document.getText() :
            document.getText(selection);

        // Try to get error from debug console
        const error = await this.getLastError();

        // Get file information
        const filePath = document.uri.fsPath;
        const language = document.languageId;

        // Try to get repository information
        const repository = await this.getRepositoryInfo(document.uri);

        return {
            code,
            error,
            filePath,
            language,
            repository
        };
    }

    /**
     * Attempts to get the last error from the debug console
     */
    private async getLastError(): Promise<string | undefined> {
        // This is a basic implementation - could be enhanced to parse debug console
        try {
            const debugConsole = vscode.debug.activeDebugSession?.configuration?.console;
            if (debugConsole) {
                // Implementation specific to your debug console parsing
                return undefined; // For now, returning undefined as placeholder
            }
            return undefined;
        } catch {
            return undefined;
        }
    }

    /**
     * Gets repository information if available
     */
    private async getRepositoryInfo(uri: vscode.Uri): Promise<string | undefined> {
        try {
            const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
            if (gitExtension) {
                const api = gitExtension.getAPI(1);
                const repository = api.repositories.find(repo =>
                    uri.fsPath.startsWith(repo.rootUri.fsPath)
                );
                if (repository) {
                    const remote = await repository.getConfig('remote.origin.url');
                    // Extract owner/repo format from git URL
                    const match = remote?.value?.match(/github\.com[:/]([^/]+\/[^/.]+)/);
                    return match ? match[1] : undefined;
                }
            }
            return undefined;
        } catch {
            return undefined;
        }
    }

    /**
     * Shows debug results in a webview panel
     */
    private async showDebugResults(response: any): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'devmindDebug',
            'DevMind Debug Results',
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
            message => {
                switch (message.command) {
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
     * Generates the HTML content for the webview
     */
    private getWebviewContent(response: any): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Debug Results</title>
                <style>
                    body { padding: 20px; }
                    .solution { margin: 10px 0; padding: 10px; background: #f0f0f0; }
                    .copy-button { margin: 5px; padding: 5px 10px; }
                    pre { white-space: pre-wrap; }
                </style>
            </head>
            <body>
                <h2>Debug Analysis</h2>
                <div class="solution">
                    <pre>${this.escapeHtml(JSON.stringify(response, null, 2))}</pre>
                    <button class="copy-button" onclick="copyToClipboard()">Copy to Clipboard</button>
                </div>
                <script>
                    function copyToClipboard() {
                        const vscode = acquireVsCodeApi();
                        vscode.postMessage({
                            command: 'copyToClipboard',
                            text: ${JSON.stringify(response)}
                        });
                    }
                </script>
            </body>
            </html>
        `;
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
