import * as vscode from 'vscode';

export interface DevMindSettings {
    apiUrl: string;
    apiKey: string;
    debug: {
        autoSuggest: boolean;
        severity: 'all' | 'error' | 'warning' | 'info';
    };
    review: {
        autoReview: boolean;
        categories: string[];
    };
    commit: {
        template: string;
    };
    telemetry: {
        enabled: boolean;
    };
    theme: {
        useCustom: boolean;
    };
}

export class SettingsManager {
    private static instance: SettingsManager;
    private constructor() {}

    public static getInstance(): SettingsManager {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager();
        }
        return SettingsManager.instance;
    }

    /**
     * Get the complete settings object
     */
    public getSettings(): DevMindSettings {
        const config = vscode.workspace.getConfiguration('devmind');
        return {
            apiUrl: config.get<string>('apiUrl', 'http://localhost:8000'),
            apiKey: config.get<string>('apiKey', ''),
            debug: {
                autoSuggest: config.get<boolean>('debug.autoSuggest', true),
                severity: config.get<'all' | 'error' | 'warning' | 'info'>('debug.severity', 'all')
            },
            review: {
                autoReview: config.get<boolean>('review.autoReview', false),
                categories: config.get<string[]>('review.categories', ['security', 'performance', 'style'])
            },
            commit: {
                template: config.get<string>('commit.template', 'feat(scope): description\n\nBody\n\nFooter')
            },
            telemetry: {
                enabled: config.get<boolean>('telemetry.enabled', true)
            },
            theme: {
                useCustom: config.get<boolean>('theme.useCustom', false)
            }
        };
    }

    /**
     * Update a specific setting
     */
    public async updateSetting<T>(section: string, value: T): Promise<void> {
        const config = vscode.workspace.getConfiguration('devmind');
        await config.update(section, value, vscode.ConfigurationTarget.Global);
    }

    /**
     * Reset settings to defaults
     */
    public async resetToDefaults(): Promise<void> {
        const config = vscode.workspace.getConfiguration('devmind');
        for (const key of Object.keys(config)) {
            await config.update(key, undefined, vscode.ConfigurationTarget.Global);
        }
    }

    /**
     * Register settings change listener
     */
    public onSettingsChanged(callback: (settings: DevMindSettings) => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('devmind')) {
                callback(this.getSettings());
            }
        });
    }
}
