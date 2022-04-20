import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

import createSession from '../../commands/createSession';
import endSession from '../../commands/endSession';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Commands valid', () => {
        assert.notStrictEqual(createSession, undefined);
        assert.notStrictEqual(endSession, undefined);

        assert.notStrictEqual(createSession, null);
        assert.notStrictEqual(endSession, null);

        assert.notStrictEqual(createSession, () => {});
        assert.notStrictEqual(endSession, () => {});
    });
});
