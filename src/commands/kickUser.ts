import * as vscode from 'vscode';

import { getStorage } from '../extension';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function kickUser(user: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        // TODO: Send request to server to kick user

        let success = true; // eslint-disable-line prefer-const

        if (success) resolve(true);

        reject(false);
    });
}

async function getUsersFromServer() {
    const sid = getStorage().get('sid');

    if (!sid) return;

    // TODO: get users from server

    const users = [
        {
            name: 'John Doe',
            location: 'Los Angeles, California',
            permission: 'editor',
        },
        {
            name: 'Jane Doe',
            location: 'London, England',
            permission: 'viewer',
        },
    ];

    return users;
}

export default async function execute() {
    if (!getStorage().get('isRemoteSessionActive')) {
        vscode.window.showErrorMessage('Remote session is not active');
        console.error('Remote session is not active');
        return;
    }

    const rawUsers = await getUsersFromServer();

    if (!rawUsers) {
        vscode.window.showErrorMessage('No users are logged into session');
        console.error('No users are logged into session');
        return;
    }

    const users = rawUsers.map((user) => {
        return {
            label: `${user.name} - ${user.location} - ${user.permission}`,
            detail: `Kick user ${user.name}, who has the permission ${user.permission}`,
        };
    });

    vscode.window.showQuickPick(users).then((user) => {
        if (!user) return;

        const usr = rawUsers.find(
            (u) => u.name === user.label.split(' -')[0],
        )?.name;

        if (usr === undefined) {
            vscode.window.showErrorMessage(`Failed to kick user ${user.label}`);
            console.error(`Failed to kick user ${user.label}`);
            return;
        }

        kickUser(usr).then((success) => {
            if (success) {
                vscode.window.showInformationMessage(
                    `Successfully kicked '${usr}'`,
                );
                console.log(`Successfully kicked '${usr}'`);
            } else {
                vscode.window.showErrorMessage(`Failed to kick '${usr}'`);
                console.error(`Failed to kick '${usr}'`);
            }
        });
    });
}
