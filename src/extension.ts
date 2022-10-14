import * as vscode from 'vscode';

import * as sioc from 'socket.io-client';

import logger from './util/logger';

const PROD_URL = 'https://localhost:8080'; // change later

export function connect(port: number, prod: boolean): sioc.Socket {
    return sioc.connect(prod ? PROD_URL : `http://localhost:${port}`);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function activate(_context: vscode.ExtensionContext) {
    const env = process.env.NODE_ENV;

    const isProd = env === 'production';

    logger.info(`Starting Remote Visual Studio Code in ${env} enviornment`);

    const socket = connect(8080, isProd);

    socket.on('connected', (payload: string) => {
        const { message } = JSON.parse(payload);

        const REQUIRED_MESSAGE = 'Connected to socket server';

        logger.info(
            `Connected to socket with:\n  message - ${message}\n  required message - ${REQUIRED_MESSAGE}\n  ok - ${
                message === REQUIRED_MESSAGE
            } \n  id - ${socket.id}\n  payload - ${payload}`,
        );
    });

    logger.info('Successfully started Remote Visual Studio Code extension');
}

export function deactivate() {
    return;
}
