import * as vscode from 'vscode';

import logger from './util/logger';

export function activate(context: vscode.ExtensionContext) {
    logger.info('Successfully started Remote Visual Studio Code extension');

    const disposable = vscode.commands.registerCommand('remote-visual-studio-code.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from Remote Visual Studio Code!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    return;
}
