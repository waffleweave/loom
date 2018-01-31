// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
import { window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument } from 'vscode';

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
        window.showQuickPick(this._callWatson(text));
    }

    private _callWatson(text: string): string[] {
        // Parse out unwanted whitespace so the split is accurate
        text = text.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        text = text.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        let wordCount = 0;
        if (text != "") {
            var wordList = text.split(" ");
            return wordList;
        } else {
            return [""];
        }
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}