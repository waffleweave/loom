
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

interface WatsonJSONResult {
    results: Array<{
        text: string;
    }>;
}

class WatsonParsedResult {
    name: string;
    text: string;
}

class WeaveSearcher {

    public async search() {

        var searchText : string = await window.showInputBox();
        // TODO: move away from URL/WebRequests -> Watson Node library
        var url = "https://gateway.watsonplatform.net/discovery/api/v1/environments/3120b03d-ac9c-46ac-a5e8-eaa282965961/collections/9ccfd375-fb1b-45c8-91d5-c3b2128e8038/query?version=2017-11-07&count=5&query=" + searchText;
        var webResult = await this._callWatson(url, searchText);
        console.log(webResult);
        var resultList = this._parseJson(webResult);
        console.log(resultList);
        let options = <QuickPickOptions> {
            onDidSelectItem: item => { this._onClickedSearchResult(item); }
        }
        window.showQuickPick(resultList, options);
    }

    private _parseJson(jsonChunk: Object):any {
        var list = JSON.stringify(<JSON> jsonChunk);
        var randoJson: WatsonJSONResult = JSON.parse(list);
        var items = [];
        for (var response of randoJson.results) {
            var t: WatsonParsedResult = {
                name = "";
                text = response.text;
            }
        }
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