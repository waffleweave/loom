// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
import { window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument } from 'vscode';
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

    public search() {

        var editor = window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        var selection = editor.selection;
        var text = editor.document.getText(selection);

        // Perform the search
        var answers : string;
        var webResultPromise: Promise<WebRequest.Response<string>> = this._callWatson('http://www.google.com/');
        webResultPromise.then((res) => {
            answers = res.content;
        });

        //Format the search
        answers = answers.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        answers = answers.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        let wordCount = 0;
        var wordList = text.split(" ");

        //Handle the results
        if (wordList.length > 25) {
            wordList = wordList.slice(0,25);
        }
        window.showQuickPick(wordList);
    }

    private _callWatson(url: string): Promise<WebRequest.Response<string>> {
        var result = WebRequest.get(url);
        return new Promise((resolve, reject) => {
            resolve(result)
        });
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}