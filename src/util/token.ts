import * as vscode from 'vscode';

import retrySocketConnection from './retrySocketConnection';
import { getSocket, getStorage } from '../extension';

export async function generateToken(waitForSidCreation = false): Promise<void> {
    await retrySocketConnection();

    const socket = getSocket();

    if (!socket.connected) return;

    let sid = getStorage().get('sid');

    if (!waitForSidCreation) {
        if (!sid || sid === null) return;
    } else {
        while (!getStorage().get('sid') || getStorage().get('sid') === null) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        sid = getStorage().get('sid');
    }

    socket.emit('token.generate', JSON.stringify({ sid: sid }));
}
