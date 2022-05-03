/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as express from 'express';
import * as vscode from 'vscode';

import { exec } from 'child_process';
import { promisify } from 'util';
import { endSession } from '../../extension';

const router = express.Router();

let terminal = '';

function init() {
    const settings = JSON.parse(
        JSON.stringify(vscode.workspace.getConfiguration()),
    );

    const operatingSystem = process.platform;

    switch (operatingSystem) {
        case 'win32' || 'win64':
            terminal = settings.terminal.integrated.defaultProfile.windows;
            break;
        case 'linux':
            terminal = settings.terminal.integrated.defaultProfile.linux;
            break;
        case 'darwin':
            terminal = settings.terminal.integrated.defaultProfile.osx;
            break;
        default:
            terminal = '';
            vscode.window.showErrorMessage(
                'Remote VSCode is not supported on this operating system.',
            );
            endSession();
            break;
    }

    const terminalToActualValue = (terminal: string): string => {
        switch (terminal) {
            case 'Git Bash':
                return 'bash';
            case 'Ubuntu (WSL)':
                return 'ubuntu';
            case 'PowerShell':
                return 'powershell';
            case 'Command Prompt':
                return 'cmd';
            case 'zsh':
                return 'zsh';
            case 'fish':
                return 'fish';
            default:
                vscode.window.showErrorMessage(
                    `Remote VSCode is not supported on terminal: ${terminal}`,
                );
                endSession();
                return terminal;
        }
    };

    terminal = terminalToActualValue(terminal);
}

async function execute(
    command: string,
    cwd: string,
): Promise<{ output: string; error: string }> {
    const out = await promisify(exec)(command, { cwd: cwd, shell: terminal });

    const output = out.stdout.trim();
    const error = out.stderr.trim();

    return { output: output, error: error };
}

router.post('/', async (req: express.Request, res: express.Response) => {
    if (!req.body) {
        res.status(400).json({
            success: false,
            message: 'Missing command',
            out: null,
        });

        return;
    }

    const command = req.body.command;

    if (!command) {
        res.status(400).json({
            success: false,
            message: 'Missing command',
            out: null,
        });

        return;
    }

    const workspace = vscode.workspace;

    if (!workspace || !workspace.workspaceFolders) {
        res.status(500).json({
            success: false,
            message: 'Unable to get workspace',
            out: null,
        });

        return;
    }

    const workspaceFolder = workspace.workspaceFolders[0];

    if (!workspaceFolder) {
        res.status(500).json({
            success: false,
            message: 'Unable to get workspace folder',
            out: null,
        });

        return;
    }

    const cwd = workspaceFolder.uri.fsPath;

    let output;
    let error;

    try {
        const res = await execute(command, cwd);
        output = res.output;
        error = res.error;
    } catch (err: any) {
        output = err.stdout;
        error = err.stderr;
    }

    const out = error === '' ? output : error;

    res.json({
        success: true,
        message: 'Command executed',
        out: out,
    });
});

init();

export default router;
