import { getStorage, endSession, getExtensionMode } from '../extension';

import startServer from '../server/server';

import * as vscode from 'vscode';
import * as axios from 'axios';

function generateRandomPassword(length: number) {
    let randomlyGeneratedPassword = '';

    const lowerCharacters = 'abcdefghijklmnopqrstuvwxyz';
    const upperCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,./<>?';
    const chars = lowerCharacters + upperCharacters + numbers + special;

    for (let i = 0; i < length; i++)
        randomlyGeneratedPassword += chars.charAt(Math.random() * chars.length);

    if (!randomlyGeneratedPassword.match(/[a-z]/))
        randomlyGeneratedPassword =
            lowerCharacters.charAt(Math.random() * lowerCharacters.length) +
            randomlyGeneratedPassword;

    if (!randomlyGeneratedPassword.match(/[A-Z]/))
        randomlyGeneratedPassword =
            upperCharacters.charAt(Math.random() * upperCharacters.length) +
            randomlyGeneratedPassword;

    if (!randomlyGeneratedPassword.match(/[0-9]/))
        randomlyGeneratedPassword =
            numbers.charAt(Math.random() * numbers.length) +
            randomlyGeneratedPassword;

    if (!randomlyGeneratedPassword.match(/[^a-zA-Z0-9]/))
        randomlyGeneratedPassword =
            special.charAt(Math.random() * special.length) +
            randomlyGeneratedPassword;

    return randomlyGeneratedPassword;
}

function validatePassword(value: string) {
    if (value.length < 5) return 'Password must be at least 5 characters long';
    if (value.length > 32) return 'Password must be at most 32 characters long';
    if (!value.match(/\S/))
        return 'Password must have at least one non-whitespace character';
    if (!value.match(/[a-z]/))
        return 'Password must have at least one lowercase character';
    if (!value.match(/[A-Z]/))
        return 'Password must have at least one uppercase character';
    if (!value.match(/[^a-zA-Z0-9]/))
        return 'Password must have a special character';
    if (!value.match(/[0-9]/)) return 'Password must have a number';

    return null;
}

export default async function execute() {
    if (getStorage().get('isRemoteSessionActive')) {
        let shouldReturn = false;
        await vscode.window
            .showInformationMessage(
                'Remote VSCode is already active. Do you want to end the session?',
                'Yes',
                'No',
            )
            .then((answer) => {
                if (answer === 'Yes') {
                    if (endSession())
                        vscode.window.showInformationMessage('Session ended');
                    else
                        vscode.window.showErrorMessage('Failed to end session');
                } else shouldReturn = true;
            });
        if (shouldReturn) return;
    }

    const randomPassword = generateRandomPassword(8);

    await vscode.window
        .showInputBox({
            placeHolder: 'Password for the remote session',
            title: 'Create Remote Session - Enter Password',
            validateInput: validatePassword,
            value: randomPassword,
        })
        .then(async (password) => {
            if (password === undefined) return;

            let port = 0;

            await vscode.window
                .showInputBox({
                    placeHolder: 'Port for remote session',
                    title: 'Create Remote Session - Enter Port',
                    value: '3000',
                })
                .then((p) => {
                    port = Number(p);
                });

            let sid: string | undefined = undefined;

            let url: string | undefined = undefined;

            if (
                getExtensionMode() === vscode.ExtensionMode.Development ||
                getExtensionMode() === vscode.ExtensionMode.Test
            ) {
                url = 'http://localhost:' + port;
            } else {
                // Get user's public IP address

                const ip = await axios.default({
                    method: 'get',
                    url: 'https://api.ipify.org',
                    headers: {
                        'Access-Control-Allow-Origin': '*', // eslint-disable-line @typescript-eslint/naming-convention
                    },
                });

                url = 'http://' + ip.data + ':' + port;
            }

            await axios
                .default({
                    method: 'get',
                    url: `${process.env.URL}/api/session/create`,
                    headers: {},
                    data: {
                        password: `${password}`,
                        url: url,
                    },
                })
                .then((response) => {
                    sid = response.data.sid;
                })
                .catch(() => {
                    vscode.window.showErrorMessage(
                        'Failed to create session: Server handshake failed',
                    );
                });

            const dir = vscode.workspace.workspaceFolders
                ? vscode.workspace.workspaceFolders[0].name
                : undefined;

            if (dir === undefined) {
                vscode.window.showErrorMessage('No workspace open');
                console.error('No workspace open');
                return;
            }

            if (sid === undefined) sid = 'None';

            if (sid === 'None') {
                vscode.window.showErrorMessage(
                    `Failed to create remote session with sid '${sid}'`,
                    'Okay',
                );
                console.error('Failed to create remote session');
                return;
            }

            getStorage().set('isRemoteSessionActive', true);
            getStorage().set('password', password);
            getStorage().set('sid', sid);

            startServer({ port: port });

            vscode.window
                .showInformationMessage(
                    `Session created! SID: ${sid}, Password: ${password}`,
                    'Okay',
                    'Copy SID',
                    'Copy Password',
                    'End Session',
                )
                .then((answer) => {
                    if (sid === undefined) return;

                    if (answer === 'Copy SID') {
                        vscode.env.clipboard.writeText(sid);
                        vscode.window.showInformationMessage(
                            `SID copied to clipboard: ${sid}`,
                        );
                        console.log(`SID copied to clipboard: ${sid}`);
                    }

                    if (answer === 'Copy Password') {
                        vscode.env.clipboard.writeText(password);
                        vscode.window.showInformationMessage(
                            `Password copied to clipboard: ${password}`,
                        );
                        console.log(
                            `Password copied to clipboard: ${password}`,
                        );
                    }

                    if (answer === 'End Session') {
                        if (endSession()) {
                            vscode.window.showInformationMessage(
                                'Session ended',
                            );
                            console.log('Session ended');
                        } else {
                            vscode.window.showErrorMessage(
                                'Failed to end session',
                            );
                            console.error('Failed to end session');
                        }
                    }
                });
            console.log(`Session created! SID: ${sid}, Password: ${password}`);
        });
}
