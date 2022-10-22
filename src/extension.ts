// process.env.DEBUG = '*'; // uncomment to enable socket.io debugging

import * as sioc from 'socket.io-client';
import * as vscode from 'vscode';

import { RemoteVisualStudioCodePanel } from './RemoteVisualStudioCodePanel';
import LocalStorageService from './util/LocalStorageService';
import logger from './util/logger';
import Command from './Command';

import CreateSessionCommand from './commands/session/CreateSession';

const PROD_URL = 'https://localhost:8080'; // change later

let storage: LocalStorageService;
let socket: sioc.Socket;

async function registerCommand(command: Command): Promise<boolean> {
    const qualifiedCommandName = command.getQualifiedName();

    if ((await vscode.commands.getCommands()).includes(qualifiedCommandName)) {
        logger.error(`command ${qualifiedCommandName} already exists`);

        return false;
    }

    logger.info(`registering command: ${qualifiedCommandName}`);

    vscode.commands.registerCommand(qualifiedCommandName, command.execute);

    return true;
}

export function connect(port: number, prod: boolean): sioc.Socket {
    return sioc.connect(prod ? PROD_URL : `http://localhost:${port}`);
}

export function resetStorage() {
    getStorage().set('sid', null);
    getStorage().set('password', null);
    getStorage().set('users', []);

    getStorage().set('token', null);
}

export async function activate(context: vscode.ExtensionContext) {
    const env = process.env.NODE_ENV;

    const isProd = env === 'production';

    logger.info(`starting Remote Visual Studio Code in ${env} enviornment`);

    storage = new LocalStorageService(context.globalState);
    resetStorage();

    socket = connect(8080, isProd);

    socket.on('connected', (payload: string) => {
        const { message } = JSON.parse(payload);

        const REQUIRED_MESSAGE = 'Connected to socket server';

        logger.info(
            `connected to socket with:\n  message - ${message}\n  required message - ${REQUIRED_MESSAGE}\n  ok - ${
                message === REQUIRED_MESSAGE
            } \n  id - ${socket.id}\n  payload - ${payload}`,
        );
    });

    socket.on('token.generated', (data) => {
        const { success, token, error } = JSON.parse(data);

        if (!success) return vscode.window.showErrorMessage('Failed to generate token: ' + error);

        getStorage().set('token', token);
    });

    await registerCommand(new CreateSessionCommand());

    context.subscriptions.push(
        vscode.commands.registerCommand('remote-visual-studio-code.show', () => {
            RemoteVisualStudioCodePanel.createOrShow(context.extensionUri);
        }),
    );

    logger.info('successfully started Remote Visual Studio Code extension');
}

export function getStorage(): LocalStorageService {
    return storage;
}

export function setSocket(sock: sioc.Socket): void {
    socket = sock;
}

export function getSocket(): sioc.Socket {
    return socket;
}

export function deactivate() {
    return;
}
