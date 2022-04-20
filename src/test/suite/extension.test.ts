import * as assert from 'assert';

import * as vscode from 'vscode';

import run, { stop } from '../../server/server';

suite('Private server', () => {
    test('Start server', () => {
        assert.strictEqual(run({ port: 6666 }), true);
    });

    test('Stop server', () => {
        assert.strictEqual(stop(), true);
    });
});
