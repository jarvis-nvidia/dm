import * as vscode from 'vscode';

export interface WebViewMessage {
    command: string;
    [key: string]: any;
}

export abstract class BasePanel {
    protected readonly panel: vscode.WebviewPanel;
    protected readonly context: vscode.ExtensionContext;
    protected disposables: vscode.Disposable[] = [];

    constructor(
        context: vscode.ExtensionContext,
        viewType: string,
        title: string,
        viewColumn: vscode.ViewColumn = vscode.ViewColumn.Two
    ) {
        this.context = context;
        this.panel = this.createWebviewPanel(viewType, title, viewColumn);
        this.initialize();
    }

    protected createWebviewPanel(
        viewType: string,
        title: string,
        viewColumn: vscode.ViewColumn
    ): vscode.WebviewPanel {
        return vscode.window.createWebviewPanel(
            viewType,
            title,
            viewColumn,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'media')
                ]
            }
        );
    }

    protected initialize(): void {
        // Set up message handling
        this.panel.webview.onDidReceiveMessage(
            this.handleMessage.bind(this),
            undefined,
            this.disposables
        );

        // Clean up resources when panel is closed
        this.panel.onDidDispose(
            () => this.dispose(),
            null,
            this.disposables
        );

        // Update content when panel becomes visible
        this.panel.onDidChangeViewState(
            () => {
                if (this.panel.visible) {
                    this.update();
                }
            },
            null,
            this.disposables
        );

        // Set initial content
        this.update();
    }

    protected getStylesheetUri(): vscode.Uri {
        const styleUri = vscode.Uri.joinPath(
            this.context.extensionUri,
            'media',
            'styles.css'
        );
        return this.panel.webview.asWebviewUri(styleUri);
    }

    protected getScriptUri(scriptName: string): vscode.Uri {
        const scriptUri = vscode.Uri.joinPath(
            this.context.extensionUri,
            'media',
            scriptName
        );
        return this.panel.webview.asWebviewUri(scriptUri);
    }

    protected getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    protected abstract getWebviewContent(): string;

    protected abstract handleMessage(message: WebViewMessage): void;

    protected postMessage(message: any): Thenable<boolean> {
        return this.panel.webview.postMessage(message);
    }

    protected update(): void {
        this.panel.webview.html = this.getWebviewContent();
    }

    protected dispose(): void {
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
        this.panel.dispose();
    }
}
