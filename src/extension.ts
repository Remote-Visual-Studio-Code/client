import * as vscode from 'vscode';

import { getServer, stop } from './server/server';

import LocalStorageService from './util/LocalStorageService';

import setPermissionCommand from './commands/setPermission';
import createSessionCommand from './commands/createSession';
import endSessionCommand from './commands/endSession';
import kickUserCommand from './commands/kickUser';
import dotenv from 'dotenv';
import axios from 'axios';

let mode: vscode.ExtensionMode;
let storage: LocalStorageService;

process.env.PRODUCTION_URL = 'https://remote-vscode.herokuapp.com';

function registerCommand(
    context: vscode.ExtensionContext,
    name: string,
    command: () => void,
) {
    context.subscriptions.push(
        vscode.commands.registerCommand(name, () => command()),
    );
}

function registerCommands(context: vscode.ExtensionContext) {
    registerCommand(
        context,
        'remote-vscode.setPermission',
        setPermissionCommand,
    );
    registerCommand(
        context,
        'remote-vscode.createSession',
        createSessionCommand,
    );
    registerCommand(context, 'remote-vscode.endSession', endSessionCommand);
    registerCommand(context, 'remote-vscode.kickUser', kickUserCommand);
}

function detectWorkspaceChange() {
    // Detect workspace change
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
        endSession();
    });
}

export function resetStorage() {
    getStorage().set('isRemoteSessionActive', false);
    getStorage().set('sid', undefined);
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Remote Visual Studio Code activated');

    mode = context.extensionMode;

    if (
        context.extensionMode === vscode.ExtensionMode.Development ||
        context.extensionMode === vscode.ExtensionMode.Test
    ) {
        process.env.URL = 'http://localhost:8000';
    } else {
        process.env.URL = process.env.PRODUCTION_URL;
    }

    storage = new LocalStorageService(context.globalState);
    resetStorage();

    registerCommands(context);

    detectWorkspaceChange();
}

export function deactivate() {
    resetStorage();
    endSession();

    vscode.window.showInformationMessage('Remote VSCode deactivated');
}

export function getStorage(): LocalStorageService {
    return storage;
}

export function endSession(): boolean {
    if (!getStorage().get('isRemoteSessionActive')) return false;
    if (getStorage().get('sid') === undefined) return false;

    getServer().close();
    stop();

    let success = true;

    axios
        .get(`${process.env.URL}/api/session/delete`, {
            params: {
                sid: getStorage().get('sid'),
                password: getStorage().get('password'),
            },
        })
        .catch(() => {
            success = false;
        });

    return success;
}

export function getExtensionMode() {
    return mode;
}
