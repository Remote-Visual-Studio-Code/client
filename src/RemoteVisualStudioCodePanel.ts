import * as vscode from 'vscode';

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export class RemoteVisualStudioCodePanel {
    public static currentPanel: RemoteVisualStudioCodePanel | undefined;

    public static readonly viewType = 'remote-visual-studio-code';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        if (RemoteVisualStudioCodePanel.currentPanel) {
            RemoteVisualStudioCodePanel.currentPanel._panel.reveal(column);
            RemoteVisualStudioCodePanel.currentPanel._update();
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            RemoteVisualStudioCodePanel.viewType,
            'Remote Visual Studio Code',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,

                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
            },
        );

        RemoteVisualStudioCodePanel.currentPanel = new RemoteVisualStudioCodePanel(panel, extensionUri);
    }

    public static kill() {
        RemoteVisualStudioCodePanel.currentPanel?.dispose();
        RemoteVisualStudioCodePanel.currentPanel = undefined;
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        RemoteVisualStudioCodePanel.currentPanel = new RemoteVisualStudioCodePanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public dispose() {
        RemoteVisualStudioCodePanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bundle.js'));

        const stylesResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
        const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));

        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link href="${stylesResetUri}" rel="stylesheet">
    <link href="${stylesMainUri}" rel="stylesheet">
    <script nonce="${nonce}"></script>
</head>
<body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
}