import React from 'react';

declare function acquireVsCodeApi(): any;

export function sendCommand({ command, args }: { command: string; args: string }): void {
    const vscode = acquireVsCodeApi();
    vscode.postMessage({ command, args });
}

export default function App(): React.ReactElement {
    // @ts-ignore
    const config: { sid: string; password: string; users: { user: string; permission: string }[] } = window.rvsc_config;

    const inSession = config.sid !== 'null';

    if (inSession) {
        return <div>Not implemented</div>;
    } else {
        return (
            <div>
                <h1>Create a session</h1>

                <br />
                <br />

                <input type="text" placeholder="Password" />

                <br />

                <button
                    onClick={() => {
                        // for testing
                        sendCommand({ command: 'alert', args: JSON.stringify({ text: 'Creating session' }) });
                    }}
                >
                    Create
                </button>
            </div>
        );
    }
}
