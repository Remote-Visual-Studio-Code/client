import { endSession, getStorage } from '../extension';
import axios from 'axios';

import * as vscode from 'vscode';

export default function execute() {
    if (!getStorage().get('isRemoteSessionActive')) {
        vscode.window.showErrorMessage('No remote session is active');
        console.error('No remote session is active');
        return;
    }

    vscode.window
        .showQuickPick(
            [
                { label: 'Yes', detail: 'End the remote session' },
                { label: 'No', detail: 'Keep the remote session' },
            ],
            {
                canPickMany: false,
                title: 'Are you sure you want to end the remote session?',
            },
        )
        .then(async (res) => {
            const result = res ? res.label : 'No';

            if (result === 'No' || result === undefined) return;

            let sid = getStorage().get('sid');

            if (sid === undefined) sid = 'None';

            if (sid === 'None') {
                vscode.window.showErrorMessage('Failed to end remote session');
                console.error('Failed to end remote session');
                return;
            }

            vscode.window.showInformationMessage(
                String(getStorage().get('password')),
            );
            vscode.window.showInformationMessage(
                String(getStorage().get('sid')),
            );

            await axios({
                method: 'get',
                url: `${process.env.URL}/api/session/delete`,
                headers: {},
                data: {
                    password: getStorage().get('password'),
                    sid: sid,
                },
            });

            endSession();

            vscode.window.showInformationMessage(
                `Session ended with SID: ${sid}`,
            );

            console.log(`Session ended with SID: ${sid}`);

            getStorage().set('isRemoteSessionActive', false);
            getStorage().set('password', '');
            getStorage().set('sid', undefined);
        });
}
