import * as express from 'express';
import * as vscode from 'vscode';

const router = express.Router();

router.get('/', async (req, res) => {
    const name = req.query.name;
    const location = req.query.location;
    const permissionRequested = req.query.permissionRequested;

    setTimeout(() => {
        if (res.statusCode !== 201) {
            vscode.window.showInformationMessage(
                `${name}'s request has timed out (60 seconds).`,
                'Okay',
            );
            res.status(500).json({ accepted: false, message: 'Timed out' });
            req.socket.destroy();
        }
    }, 1000 * 5);

    let longName = '';
    let description = '';
    if (permissionRequested === 'viewer') {
        longName = 'Viewer';
        description = 'view files';
    } else if (permissionRequested === 'editor') {
        longName = 'Editor';
        description = 'edit files';
    } else if (permissionRequested === 'admin') {
        longName = 'Admin';
        description = 'edit files and access the terminal';
    } else {
        description = 'Unknown permission';
        res.send('Unknown permission');
        return;
    }

    const filePaths = await vscode.workspace.findFiles(
        '**/*',
        '**/node_modules/**, **/venv/**',
    );

    const files: { path: string; name: string }[] = [];

    filePaths.map(async (file) => {
        const workspaceName = vscode.workspace.name;

        if (!workspaceName) throw new Error('No workspace open');

        let path = file.fsPath.split(workspaceName)[1];

        for (let i = 0; i < path.length; i++) {
            if (path[i] === '\\') {
                path = path.substring(0, i) + '/' + path.substring(i + 1);
            }
        }

        const name = path.split('/').pop();

        if (!name) throw new Error('Invalid file name');

        files.push({
            path: path,
            name: name,
        });
    });

    const values = {
        accepted: false,
        name: name,
        location: location,
        permission: permissionRequested,
        files: files,
    };

    await vscode.window
        .showInformationMessage(
            `${name} wants to join remote session from ${location} with permission ${permissionRequested}.\n${longName}s can ${description}`,
            'Accept',
            'Reject',
        )
        .then((answer) => {
            values.accepted = answer === 'Accept' ? true : false;
        });

    res.status(201).json(values);
    vscode.window.showInformationMessage(
        `${name} has been ${values.accepted ? 'accepted' : 'rejected'}`,
    );
});

export default router;
