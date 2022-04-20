import * as vscode from 'vscode';

import { getStorage } from '../extension';

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
    const rawUsers = await getUsersFromServer();

    if (!rawUsers) {
        vscode.window.showErrorMessage('No users are logged into session');
        console.error('No users are logged into session');
        return;
    }

    const users = rawUsers.map((user) => {
        return {
            label: `${user.name} - ${user.location} - ${user.permission}`,
            detail: `Set permission for user ${user.name} who has permission ${user.permission}`,
        };
    });

    vscode.window.showQuickPick(users).then((user) => {
        if (!user) return;

        const possiblePermissions = ['viewer', 'editor', 'admin'].filter(
            (p) => {
                return p !== user.label.split(' - ')[2];
            },
        );

        vscode.window
            .showQuickPick(possiblePermissions, {
                placeHolder: 'Select permission',
            })
            .then((permission) => {
                if (!permission) return;

                const usr = rawUsers.find(
                    (u) => u.name === user.label.split(' -')[0],
                )?.name;

                if (usr === undefined) {
                    vscode.window.showErrorMessage(
                        `Failed to set permission for user ${user.label}`,
                    );
                    console.error(
                        `Failed to set permission for user ${user.label}`,
                    );
                    return;
                }

                // TODO: set permission for user
                let success = true; // eslint-disable-line prefer-const

                if (success) {
                    vscode.window.showInformationMessage(
                        `Set permission to ${permission}`,
                    );
                } else {
                    vscode.window.showErrorMessage(
                        `Failed to set permission to ${permission}`,
                    );
                }
            });
    });
}
