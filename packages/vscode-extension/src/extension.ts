import * as vscode from 'vscode';
import 'node-fetch';

interface ApiResponse {
    choices?: Array<{
        message: {
            content: string;
        };
    }>;
    error?: string;
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('devmind.generateCommit', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const diff = editor.document.getText();
        const workspace = vscode.workspace.workspaceFolders;
        let relatedFiles = "";
        if (workspace) {
            const files = await vscode.workspace.findFiles('**/*.{py,ts,js}', '**/node_modules/**');
            relatedFiles = files.map(f => f.path).join("\n");
        }

        const blackboxUrl = "https://api.blackbox.ai/chat/completions";
        const blackboxApiKey = "sk-8vK21JMn9O2qpxOAKew83Q"; // Replace with your actual API key

        const prompt = `Analyze this code diff and related files:\nDiff:\n${diff}\nRelated Files:\n${relatedFiles}\n\nProvide a structured commit message story in this exact format:\n- Why: [reason for change]\n- Modules: [list of affected modules]\n- Reviewers: [suggested reviewers]\n\nKeep responses concise.`;

        try {
            const response = await fetch(blackboxUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${blackboxApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "blackboxai/nousresearch/hermes-2-pro-llama-3-8b",
                    messages: [{ role: "user", content: prompt }]
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json() as ApiResponse;
            if (data.choices && data.choices[0].message.content) {
                const story = data.choices[0].message.content.trim();
                vscode.window.showInformationMessage(`Commit Story:\n${story}`);
            } else {
                vscode.window.showErrorMessage('No valid response from API');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate commit story: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
