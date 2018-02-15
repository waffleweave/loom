
import { window, commands, Disposable, ExtensionContext, StatusBarAlignment,
     StatusBarItem, TextDocument, QuickPickItem, QuickPickOptions } from 'vscode';
import * as WebRequest from 'web-request';

export function activate(context: ExtensionContext) {
    let weaveSearcher = new WeaveSearcher();
    let disposable = commands.registerCommand('extension.sayHello', () => {
        weaveSearcher.search();
    });
    context.subscriptions.push(weaveSearcher);
    context.subscriptions.push(disposable);
}

<<<<<<< HEAD
export class WeaveSearcher {
=======
interface WatsonJSONResult {
    results: Array<{
        extracted_metadata: {
            filename: string;
        }
        text: string;
    }>;
}
>>>>>>> develop

class WatsonParsedResult {
    name: string;
    text: string;
}

class WeaveSearcher {

<<<<<<< HEAD
        console.log('Running search...');

        var editor = window.activeTextEditor;
        if (!editor) {
            console.log('No open text editor!');
            return; // No open text editor
        }

        var selection = editor.selection;
        var text = editor.document.getText(selection);
        text = text.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        text = text.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        
        console.log(`Searching with text: ${text}`)

        // Perform the search
        var url = 'https://api.gemini.com/v1/pubticker/btcusd';
        var webResult = await this._callWatson(url);
=======
    public async search() {

        var searchText : string = await window.showInputBox();
        // TODO: move away from URL/WebRequests -> Watson Node library
        var url = "https://gateway.watsonplatform.net/discovery/api/v1/environments/3120b03d-ac9c-46ac-a5e8-eaa282965961/collections/9ccfd375-fb1b-45c8-91d5-c3b2128e8038/query?version=2017-11-07&count=5&query=" + searchText;
        var webResult = await this._callWatson(url, searchText);
>>>>>>> develop
        var resultList = this._parseJson(webResult);
        var names: string[] = [];
        for (var item of resultList) {
            names.push(item.name);
        }
        let options = <QuickPickOptions> {
            onDidSelectItem: item => { this._onClickedSearchResult(item); }
        }
        window.showQuickPick(names, options);
    }

    private _parseJson(jsonChunk: Object):WatsonParsedResult[] {
        var list = JSON.stringify(<JSON> jsonChunk);
        var randoJson: WatsonJSONResult = JSON.parse(list);
        var items = [];
        for (var response of randoJson.results) {
            var t : WatsonParsedResult = new WatsonParsedResult();
            t.text = response.text;
            t.name = response.extracted_metadata.filename;
            items.push(t);
        }
        console.log(items);
        return items;
    }

    private _buildWatsonHeaders(query: string):any {
        return {
            auth: {
                username: '841350ca-e949-441d-af78-e5a42b88a78e',
                password: 'ptLDYEX3X3JF',
            }
        };
    }

    private _onClickedSearchResult(item: QuickPickItem | string):any {
        item = item.toString();
        window.showInformationMessage(item);
    }

    private _callWatson(url: string, searchText: string): Promise<WebRequest.Response<string>> {
        var headers = this._buildWatsonHeaders(searchText);
        var result = WebRequest.json<any>(url, headers);
        return new Promise((resolve, reject) => {
            resolve(result)
        });
    }

    dispose() { }
}