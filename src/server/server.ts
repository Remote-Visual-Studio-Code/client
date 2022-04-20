import * as express from 'express';
import { Server } from 'http';
import * as vscode from 'vscode';

import userConnect from './auth/userConnect';
import files from './file/files';

const app = express();
let server: Server;

export default function run(settings: { port: number }) {
    app.get('/', (req, res) => {
        res.send(
            'Remote VSCode server.\nYou dont need to do anything here, it is self-sustainable.\nYou can end the session and server by running the "RVSC - End Session" command in Visual Studio Code.',
        );
    });

    app.use('/auth/connect', userConnect);
    app.use('/files/system', files);

    server = app.listen(settings.port, () => {
        vscode.window.showInformationMessage(
            `Remote VSCode is listening on port ${settings.port}`,
        );
    });
}

export function stop() {
    server.close();
}

export function getApp() {
    return app;
}

export function getServer() {
    return server;
}
