import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "remote-visual-studio-code" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "remote-visual-studio-code.helloWorld",
    () => {
      vscode.window.showInformationMessage(
        "Hello World from Remote Visual Studio Code!"
      );
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
