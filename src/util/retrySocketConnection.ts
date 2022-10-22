import { getSocket } from '../extension';

import * as vscode from 'vscode';

export default async function retrySocketConnection(): Promise<void> {
    let timeTaken = 0;

    while (!getSocket().connected) {
        if (timeTaken > 3000) {
            vscode.window.showErrorMessage('Could not connect to server', 'Retry').then((value) => {
                if (value === 'Retry') {
                    retrySocketConnection();
                }
            });

            return;
        }

        timeTaken += 100;

        await new Promise((resolve) => setTimeout(resolve, 100));
    }
}
