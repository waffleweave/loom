// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
import {window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';

// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
export function activate(context: ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error).
    // This line of code will only be executed once when your extension is activated.
    console.log("WaffleWeave loaded");

    // create a new word counter
    let wordCounter = new CodeSuggester();
    let controller = new CodeSuggesterController(wordCounter);

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(controller);
    context.subscriptions.push(wordCounter);
}

class CodeSuggester {

    private _statusBarItem: StatusBarItem;

    public updateSuggestion() {

        // Create as needed
        if (!this._statusBarItem) {
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        }

        // Get the current text editor
        let editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }

        let doc = editor.document;

        // Only update status if an Markdown file
        if (doc.languageId === "python") {
            let keywords = this._getKeywords(doc);

            // Update the status bar
            // Need to write something to actually return a text message down in the status bar
            this._statusBarItem.text = keywords;
            this._statusBarItem.show();
        } else {
            this._statusBarItem.hide();
        }
    }

    public _getKeywords(doc: TextDocument): string {
        //Replace _word with desired status message
        var _word: string = "";
        let docContent = doc.getText();

        // Parse out unwanted whitespace so the split is accurate
        docContent = docContent.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        docContent = docContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        let wordCount = 0;

        //So here docContent.split(" ") is the actual words contained in the document
        if (docContent != "") {
            wordCount = docContent.split(" ").length
            
            if(wordCount > 16) {
                _word = "Reference: ~/Docs/linked_lists.txt"
            }
        }

        return _word;
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}

class CodeSuggesterController {

    private _codeSuggester: CodeSuggester;
    private _disposable: Disposable;

    constructor(wordCounter: CodeSuggester) {
        this._codeSuggester = wordCounter;

        // subscribe to selection change and editor activation events
        let subscriptions: Disposable[] = [];
        window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        // update the counter for the current file
        this._codeSuggester.updateSuggestion();

        // create a combined disposable from both event subscriptions
        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onEvent() {
        this._codeSuggester.updateSuggestion();
    }
}