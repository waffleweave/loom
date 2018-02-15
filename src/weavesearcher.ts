
import { window } from 'vscode';
import { WatsonHelper } from './watsonhelper';
import { JSONHelper } from './jsonhelper';

export class WeaveSearcher {

    public async search() {

        var watsonHelper = new WatsonHelper();
        var jsonHelper = new JSONHelper();

        // prompt user for input
        var searchText : string = await window.showInputBox();

        // call watson with search query (async)
        var watsonResponse = await watsonHelper.searchWatson(searchText)
            .then((result) => { return result; })
            .catch((err) => {
                window.showErrorMessage(`Failed to query watson services: ${err}`);
                return "";
            });

        // setup local stuff while query is running
        var ochannel = window.createOutputChannel('watson_channel');

        // parse response into key-value pair dict
        var jsonResult = jsonHelper.parseJSON(watsonResponse);
        
        // extract keys (filenames)
        var keys = [];
        for (var r in jsonResult) {
            keys.push(r);
        }

        // wait for user to select desired file
        var selected = await window.showQuickPick(keys);
        
        // show corresponding result from selection
        ochannel.appendLine(`Results from chosen: ${selected}`);
        ochannel.append(jsonResult[selected]);
        ochannel.show();
    }

    dispose() { }
}