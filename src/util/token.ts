import * as vscode from 'vscode';

import retrySocketConnection from './retrySocketConnection';
import { getSocket, getStorage } from '../extension';

export async function generateToken(): Promise<void> {
    await retrySocketConnection();

    const socket = getSocket();

    if (!socket.connected) return;

    const sid = getStorage().get('sid');

    if (!sid || sid === null) return;

    socket.emit('token.generate', JSON.stringify({ sid: sid }));

    socket.on('token.generated', (data) => {
        const { success, token, error } = JSON.parse(data);

        if (!success) return vscode.window.showErrorMessage('Failed to generate token: ' + error);

        getStorage().set('token', token);
    });
}
