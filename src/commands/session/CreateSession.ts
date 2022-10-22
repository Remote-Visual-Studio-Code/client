import * as vscode from 'vscode';

import { getSocket, getStorage } from '../../extension';
import { RemoteVisualStudioCodePanel } from '../../RemoteVisualStudioCodePanel';
import Command from '../../Command';

export default class CreateSessionCommand extends Command {
    public async execute(...args: any[]) {
        let timeTaken = 0;

        while (!getSocket().connected) {
            if (timeTaken > 3000) {
                vscode.window.showErrorMessage('Could not connect to server');

                return;
            }

            timeTaken += 100;

            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const socket = getSocket();

        if (!socket.connected) {
            if (!socket.connected) return vscode.window.showErrorMessage('Could not connect to server');
        }

        const password = await vscode.window.showInputBox({
            prompt: 'Enter a password for your session',
            password: true,
            validateInput: (value) => {
                if (value.length < 8) return 'Password must be at least 8 characters long';
                if (value.length > 32) return 'Password must be at most 32 characters long';

                return null;
            },
        });

        if (!password) return;

        const expiryDate: { label: string; description: string; date: Date } | undefined =
            await vscode.window.showQuickPick(
                [
                    { label: '1 hour', description: 'Expires in 1 hour', date: new Date(Date.now() + 1000 * 60 * 60) },
                    {
                        label: '3 hours',
                        description: 'Expires in 3 hours',
                        date: new Date(Date.now() + 1000 * 60 * 60 * 3),
                    },
                    {
                        label: '1 day',
                        description: 'Expires in 1 day',
                        date: new Date(Date.now() + 1000 * 60 * 60 * 24),
                    },
                ],
                {
                    placeHolder: 'Select an expiry date',
                    canPickMany: false,
                },
            );

        if (!expiryDate) return;

        const date = expiryDate.date;

        const payload = {
            password: password,
            expires: date.toISOString(),
        };

        socket.emit('session.create-session', JSON.stringify(payload));

        socket.on('session.session-created', (data) => {
            const { error, sid } = JSON.parse(data);

            if (error) {
                vscode.window.showErrorMessage('Failed to create session: ' + error);
                return;
            }

            getStorage().set('sid', sid);

            RemoteVisualStudioCodePanel.currentPanel?._update();

            vscode.window.showInformationMessage(`Session created with id ${sid}`);
        });
    }

    public getQualifiedName() {
        return 'remote-visual-studio-code.createSession';
    }
}
