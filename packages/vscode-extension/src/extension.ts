import * as vscode from 'vscode';
import { DevMindClient, createDevMindClient } from './api/devmindClient';
import { generateCommitMessage } from './commands/generateCommitMessage';
import { DebugCommandHandler } from './commands/askForDebug';
import { ReviewCommandHandler } from './commands/requestReview';
import { SettingsPanel } from './settings/SettingsPanel';
// DevMind extension activation
export async function activate(context: vscode.ExtensionContext) {
  console.log('DevMind extension is now active');

  try {
    // Get configuration
    const config = vscode.workspace.getConfiguration('devmind');
    const apiUrl = config.get<string>('apiUrl') || 'http://localhost:8000';
    const apiKey = config.get<string>('apiKey') || '';

    // Create API client
    const client = createDevMindClient(apiUrl, apiKey);

    // Register commands
    const commitMessageCommand = vscode.commands.registerCommand(
      'devmind.generateCommit',
      async () => await generateCommitMessage(client)
    );

    // Register debug command
    const debugHandler = new DebugCommandHandler(context, client);
    const debugCommand = debugHandler.register();

    // Register review command
    const reviewHandler = new ReviewCommandHandler(context, client);
    const reviewCommand = reviewHandler.register();
    context.subscriptions.push(reviewCommand);

    // Add commands to subscriptions
    context.subscriptions.push(commitMessageCommand, debugCommand);

    // Check if API is reachable
    const isHealthy = await client.checkHealth();
    if (!isHealthy) {
      vscode.window.showWarningMessage(
        'DevMind API is not reachable. Please check your API configuration.',
        'Open Settings'
      ).then(selection => {
        if (selection === 'Open Settings') {
          vscode.commands.executeCommand(
            'workbench.action.openSettings',
            'devmind'
          );
        }
      });
    } else {
      // API is healthy, show a status bar item with dropdown menu
      const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
      );
      statusBarItem.text = '$(brain) DevMind';
      statusBarItem.tooltip = 'DevMind AI Assistant';
      statusBarItem.command = 'devmind.showMenu';
      statusBarItem.show();

      // Register menu command
      const menuCommand = vscode.commands.registerCommand('devmind.showMenu', () => {
        vscode.window.showQuickPick([
          {
            label: '$(git-commit) Generate Commit Message',
            description: 'Generate an AI-powered commit message',
            command: 'devmind.generateCommit'
          },
          {
            label: '$(debug) Ask for Debug Help',
            description: 'Get AI assistance with debugging',
            command: 'devmind.askForDebug'
          }
        ]).then(selection => {
          if (selection) {
            vscode.commands.executeCommand(selection.command);
          }
        });
      });

      context.subscriptions.push(statusBarItem, menuCommand);
    }
  } catch (error) {
    console.error('Error activating DevMind extension:', error);
  }
}

// DevMind extension deactivation
export function deactivate() {
  console.log('DevMind extension is now deactivated');
}
