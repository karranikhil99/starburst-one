const vscode = require('vscode');
const cp = require('child_process');
function activate(context) {
  let runQuery = vscode.commands.registerCommand('extension.runStarburstQuery', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const query = editor.document.getText(editor.selection) || editor.document.getText();
    const config = vscode.workspace.getConfiguration('starburst');
    const args = [
      config.host, config.user, config.password,
      config.catalog, config.schema, query
    ];
    cp.execFile('python', ['python/run_query.py', ...args], (err, stdout, stderr) => {
      if (err) return vscode.window.showErrorMessage(stderr);
      vscode.window.showInformationMessage('Query Result: ' + stdout);
    });
  });
  let addConn = vscode.commands.registerCommand('extension.addConnection', async () => {
    const host = await vscode.window.showInputBox({ prompt: 'Starburst Host URL' });
    const user = await vscode.window.showInputBox({ prompt: 'Username' });
    const password = await vscode.window.showInputBox({ prompt: 'Password', password: true });
    const catalog = await vscode.window.showInputBox({ prompt: 'Catalog' });
    const schema = await vscode.window.showInputBox({ prompt: 'Schema' });
    const config = vscode.workspace.getConfiguration('starburst');
    await config.update('host', host, true);
    await config.update('user', user, true);
    await config.update('password', password, true);
    await config.update('catalog', catalog, true);
    await config.update('schema', schema, true);
    vscode.window.showInformationMessage('Starburst connection saved.');
  });
  context.subscriptions.push(runQuery, addConn);
}
exports.activate = activate;
function deactivate() {}
exports.deactivate = deactivate;