import * as express from 'express';
import { json, urlencoded } from 'body-parser';
import * as vscode from 'vscode';
import { Server } from 'http';

import userConnect from './auth/userConnect';
import execute from './terminal/execute';
import files from './file/files';

import * as cors from 'cors';

const app = express();
let server: Server;

export default function run(settings: { port: number }): boolean {
    app.use(cors({ origin: '*' }));

    app.use(json());
    app.use(urlencoded({ extended: true }));

    app.get('/', (req, res) => {
        res.send(
            'Remote VSCode server.\nYou dont need to do anything here, it is self-sustainable.\nYou can end the session and server by running the "RVSC - End Session" command in Visual Studio Code.',
        );
    });

    app.use('/auth/connect', userConnect);
    app.use('/terminal', execute);
    app.use('/files/system', files);

    server = app.listen(settings.port, () => {
        vscode.window.showInformationMessage(
            `Remote VSCode is listening on port ${settings.port}`,
        );
    });

    return true;
}

export function stop(): boolean {
    server.close();
    return true;
}

export function getApp() {
    return app;
}

export function getServer() {
    return server;
}
