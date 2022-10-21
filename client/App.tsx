import React from 'react';

export default function App(): React.ReactElement {
    // @ts-ignore
    const config: { sid: string } = window.rvsc_config;

    return (
        <div>
            <h1>Remote Visual Studio Code</h1>

            <p>Current sid: {config.sid}</p>
        </div>
    );
}
