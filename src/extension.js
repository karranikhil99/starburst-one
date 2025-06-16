const vscode = require('vscode');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

function activate(context) {
  // Run Query
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

  // Add Connection
  let addConn = vscode.commands.registerCommand('extension.addConnection', async () => {
    const host = await vscode.window.showInputBox({ prompt: 'Trino/Starburst Host URL' });
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

    vscode.window.showInformationMessage('Trino/Starburst connection saved.');
  });

  // List Connections (mock)
  let listConnections = vscode.commands.registerCommand('extension.listConnections', () => {
    const config = vscode.workspace.getConfiguration('starburst');
    const summary = `
Host: ${config.host}
User: ${config.user}
Catalog: ${config.catalog}
Schema: ${config.schema}
    `;
    vscode.window.showInformationMessage('Current Connection:\n' + summary);
  });

  // Delete Connection
  let deleteConnection = vscode.commands.registerCommand('extension.deleteConnection', async () => {
    const config = vscode.workspace.getConfiguration('starburst');
    await config.update('host', undefined, true);
    await config.update('user', undefined, true);
    await config.update('password', undefined, true);
    await config.update('catalog', undefined, true);
    await config.update('schema', undefined, true);
    vscode.window.showInformationMessage('Trino/Starburst connection deleted.');
  });

  // Export Query Result (demo CSV save)
  let exportQueryResult = vscode.commands.registerCommand('extension.exportQueryResult', async () => {
    const result = await vscode.window.showInputBox({ prompt: 'Enter data to save as CSV' });
    if (!result) return;

    const uri = await vscode.window.showSaveDialog({
      filters: { 'CSV Files': ['csv'] },
      defaultUri: vscode.Uri.file('query_result.csv')
    });

    if (uri) {
      fs.writeFile(uri.fsPath, result, (err) => {
        if (err) return vscode.window.showErrorMessage('Failed to export CSV.');
        vscode.window.showInformationMessage('Query result exported to CSV.');
      });
    }
  });

  context.subscriptions.push(
    runQuery,
    addConn,
    listConnections,
    deleteConnection,
    exportQueryResult
  );
}

exports.activate = activate;
function deactivate() {}
exports.deactivate = deactivate;
