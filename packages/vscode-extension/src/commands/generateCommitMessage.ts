import * as vscode from 'vscode';
import { DevMindClient } from '../api/devmindClient';
import * as cp from 'child_process';
import * as util from 'util';
import * as path from 'path';

/**
 * Get staged changes using git diff
 */
async function getStagedChanges(workspaceFolder: string): Promise<string> {
  const exec = util.promisify(cp.exec);

  try {
    // Get staged changes using git diff --staged
    const { stdout } = await exec('git diff --staged', {
      cwd: workspaceFolder,
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large diffs
    });
    return stdout;
  } catch (error) {
    console.error('Failed to get staged changes:', error);
    throw new Error('Failed to get staged changes. Make sure you have changes staged for commit.');
  }
}

/**
 * Get paths of staged files
 */
async function getStagedFilePaths(workspaceFolder: string): Promise<string[]> {
  const exec = util.promisify(cp.exec);

  try {
    // Get staged file paths
    const { stdout } = await exec('git diff --staged --name-only', {
      cwd: workspaceFolder
    });
    return stdout.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Failed to get staged file paths:', error);
    return [];
  }
}

/**
 * Get repository name from git remote url
 */
async function getRepositoryName(workspaceFolder: string): Promise<string | undefined> {
  const exec = util.promisify(cp.exec);

  try {
    // Get remote URL
    const { stdout } = await exec('git config --get remote.origin.url', {
      cwd: workspaceFolder
    });

    const remoteUrl = stdout.trim();

    // Parse repository name from various formats of git URLs
    // Examples:
    // https://github.com/username/repo.git
    // git@github.com:username/repo.git

    if (remoteUrl.includes('github.com')) {
      const match = remoteUrl.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)(?:\.git)?$/);
      if (match && match[1] && match[2]) {
        return `${match[1]}/${match[2]}`;
      }
    }

    return undefined;
  } catch (error) {
    console.error('Failed to get repository name:', error);
    return undefined;
  }
}

/**
 * Generate commit message using DevMind
 */
export async function generateCommitMessage(
  client: DevMindClient
): Promise<void> {
  try {
    // Check if a folder is open
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder open.');
      return;
    }

    // Use first workspace folder
    const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;

    // Show progress notification
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'DevMind: Generating commit message...',
        cancellable: false
      },
      async () => {
        // Check if git is available
        try {
          // Get staged changes diff
          const codeDiff = await getStagedChanges(workspaceFolder);

          if (!codeDiff || codeDiff.trim() === '') {
            vscode.window.showInformationMessage('No staged changes found. Stage changes before generating a commit message.');
            return;
          }

          // Get staged file paths
          const filePaths = await getStagedFilePaths(workspaceFolder);

          // Get repository name
          const repository = await getRepositoryName(workspaceFolder);

          // Generate commit message
          const response = await client.generateCommitMessage({
            code_diff: codeDiff,
            file_paths: filePaths,
            repository,
            message_type: 'commit'
          });

          if (!response.success || !response.data) {
            vscode.window.showErrorMessage(`Failed to generate commit message: ${response.message}`);
            return;
          }

          const commitMessage = response.data.message;

          // Copy to clipboard
          await vscode.env.clipboard.writeText(commitMessage);

          // Show the generated commit message
          const selectedOption = await vscode.window.showInformationMessage(
            'Commit message generated and copied to clipboard!',
            'View Message',
            'Create Commit'
          );

          if (selectedOption === 'View Message') {
            // Create a temporary file and show it
            const doc = await vscode.workspace.openTextDocument({
              content: commitMessage,
              language: 'markdown'
            });
            await vscode.window.showTextDocument(doc);
          } else if (selectedOption === 'Create Commit') {
            // Spawn git commit with the message
            const terminal = vscode.window.createTerminal('DevMind: Git Commit');
            terminal.sendText(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
            terminal.show();
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Error generating commit message: ${error}`);
        }
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating commit message: ${error}`);
  }
}
