import * as express from 'express';
import { posix } from 'path';
import * as vscode from 'vscode';

const router = express.Router();

router.get('/', async (req, res) => {
    const fileRequested = String(req.query.file);

    if (!fileRequested) return res.status(400).send('No file requested');

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return res.sendStatus(500);

    const folderUri = workspaceFolders[0].uri;
    const fileUri = folderUri.with({
        path: posix.join(folderUri.path, fileRequested),
    });

    const data = await vscode.workspace.fs.readFile(fileUri);
    let text = Buffer.from(data).toString('utf8');

    for (let i = 0; i < text.length; i++)
        if (text[i] === '\r')
            text = text.substring(0, i) + text.substring(i + 1);

    res.json({
        content: text,
    });
});

export default router;
