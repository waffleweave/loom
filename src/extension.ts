// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
import { window, commands, Disposable, ExtensionContext, StatusBarAlignment,
     StatusBarItem, TextDocument, QuickPickItem, QuickPickOptions } from 'vscode';
import * as WebRequest from 'web-request';

// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
export function activate(context: ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error).
    // This line of code will only be executed once when your extension is activated.
    console.log('Congratulations, your extension "WordCount" is now active!');

    // create a new word counter
    let weaveSearcher = new WeaveSearcher();

    let disposable = commands.registerCommand('extension.sayHello', () => {
        weaveSearcher.search();
    });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(weaveSearcher);
    context.subscriptions.push(disposable);
}

class WeaveSearcher {

    private _statusBarItem: StatusBarItem;

    public async search() {

        var editor = window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        var url = 'https://api.gemini.com/v1/pubticker/btcusd';
        var webResult = await this._callWatson(url);
        var resultList = this._parseJson(webResult);
        console.log(resultList);
        let options = <QuickPickOptions> {
            onDidSelectItem: item => { this._onClickedSearchResult(item); }
        }
        window.showQuickPick(resultList, options);
    }

    private _parseJson(jsonChunk: Object):string[] {
        var raw: JSON = <JSON> jsonChunk;
        var answers : string;
        answers = JSON.stringify(raw);
        console.log(answers);
        var wordList = answers.split("\n");
        return wordList;
    }

    private _onClickedSearchResult(item: QuickPickItem | string):any {
        item = item.toString();
        window.showInformationMessage(item);
    }

    private _callWatson(url: string): Promise<WebRequest.Response<string>> {
        var result = WebRequest.json<any>(url);
        return new Promise((resolve, reject) => {
            resolve(result)
        });
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}