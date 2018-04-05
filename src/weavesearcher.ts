
import { window, commands, Uri, TextDocumentContentProvider, Selection, Position, QuickPickOptions } from 'vscode';
import { WatsonHelper } from './watsonhelper';
import { JSONHelper } from './jsonhelper';
import { DocumentHelper } from './documenthelper';

export class WeaveSearcher {

    public async searchBar() {

        var repeat = true;
        while (repeat) {
            // prompt user for input
            var searchPromise = window.showInputBox()
                .then((res) => {return res;}, (err) => {window.showErrorMessage(`Failed to get input box: ${err}`);});

            // get response from watson
            var watsonResponse = this.searchDiscovery(searchPromise)
                .catch((err) => {window.showErrorMessage(`Failed to searchDiscovery: ${err}`);});

            // parse json response (or get default)
            var jsonResult = this.parseDiscoveryJSON(watsonResponse, true)
                .catch((err) => {window.showErrorMessage(`Failed to parseJSON: ${err}`);});

            // show quick pick options
            let q = <QuickPickOptions> {placeHolder : "Weave Search Results"};
            var selected = this.promptQuickPick(jsonResult, q, true)
                .catch((err) => {window.showErrorMessage(`Failed to promptQuickPick: ${err}`);});

            var cs = await selected;
            if (cs != 'Search Again') {
                repeat = false;
            }
        }

        // show html pages
        this.showHTML(selected, jsonResult);
    }

    //I've taken this over for the NLC->Discovery path
    public async feelingLucky() {

        // get current selection, and change it to select whole lines
        var editor = window.activeTextEditor;
        var selection = editor.selection;
        var newSelection = new Selection(new Position(selection.start.line, 0), new Position(selection.end.line+1, 0));
        editor.selection = newSelection;

        // get current text of selected lines
        var selectedText = editor.document.getText(editor.selection);
        var selectedPromise = new Promise<string>((resolve, reject) => resolve(selectedText));
        
        //Feed it to NLC
        var NLCResponse = this.classifyWithNLC(selectedPromise)
            .catch((err) => {window.showErrorMessage(`Failed to classify with NLC: ${err}`);});

        var jsonNLCResult = this.parseNLCJSONforSelection(NLCResponse)
            .catch((err) => {window.showErrorMessage(`Failed to parseJSON: ${err}`);});

        // show quick pick options
        let q = <QuickPickOptions> {placeHolder : "Weave Search Results"};
        var selected = this.promptQuickPick(jsonNLCResult, q, false)
            .catch((err) => {window.showErrorMessage(`Failed to promptQuickPick: ${err}`);});

        // Now to discovery based on MLE 
        var discoveryResponse = this.searchDiscovery(selected)
            .catch((err) => {window.showErrorMessage(`Failed to searchDiscovery: ${err}`);});

        // parse json response (or get default)
        var jsonDiscoveryResult = this.parseDiscoveryJSON(discoveryResponse, true)
            .catch((err) => {window.showErrorMessage(`Failed to parseJSON: ${err}`);});

        // show output channel
        this.showHTML(null, jsonDiscoveryResult);
    }

    private async searchDiscovery(searchThenable: Thenable<string>) : Promise<any> {

        // initialize variables while waiting for results
        let watsonHelper = new WatsonHelper();

        // wait for results
        let searchText = await searchThenable;
        if (searchText == null) {
            return null;
        }
        if (searchText.length < 2) {
            window.showErrorMessage(`Failed to query watson services: query too short`);
            return null;
        } else if (searchText.length > 200) {
            window.showErrorMessage(`Failed to query watson services: query too long`);
            return null;
        }
        // search watson
        var watsonResponse = watsonHelper.searchDiscovery(searchText)
            .then((result) => { return result; })
            .catch((err) => {
                window.showErrorMessage(`Failed to query watson services: ${err}`);
                return null;
            });

        return watsonResponse;
    }

    private async classifyWithNLC(searchThenable: Thenable<string>) : Promise<any> {
        // initialize variables while waiting for results
        let watsonHelper = new WatsonHelper();

        // wait for results
        let searchText = await searchThenable;
        if (searchText.length < 2) {
            window.showErrorMessage(`Failed to query watson services: query too short`);
            return null;
        } else if (searchText.length > 1000) {
            window.showErrorMessage(`Failed to query watson services: query too long`);
            return null;
        }
        var NLCAnswer = watsonHelper.hitNLC(searchText)            
            .then((result) => { return result; })
            .catch((err) => {
                window.showErrorMessage(`Failed to query watson services: ${err}`);
                return null;
            });
        
        return NLCAnswer;
    }

    public async parseDiscoveryJSON(watsonResponsePromise: Thenable<any>, html: boolean = false) : Promise<any> {

        // initialize stuff while waiting for the searchText and response
        let jsonHelper = new JSONHelper();

        // wait for response
        let watsonResponse = await watsonResponsePromise;

        if (watsonResponse == null) {
            return null;
        }
        if (watsonResponse.error) {
            return new Promise<any>((resolve, reject) => reject(`Watson Discovery Error: ${watsonResponse.description}`));
        }

        var jsonResult: any;
        if (html) {
            jsonResult = jsonHelper.parseDiscoveryJSONToHTML(watsonResponse);
        } else {
            jsonResult = jsonHelper.parseDiscoveryJSON(watsonResponse);
        }

        // return promise of json result
        return jsonResult;
    }

    private async parseNLCJSON(watsonResponsePromise: Thenable<any>) : Promise<any> {

        // initialize stuff while waiting for the searchText and response
        let jsonHelper = new JSONHelper();

        // wait for response
        let watsonResponse = await watsonResponsePromise;
        if (watsonResponse == null) {
            return null;
        }
        if (watsonResponse.error) {
            return new Promise<any>((resolve, reject) => reject(`Watson NLC Error: ${watsonResponse.description}`));
        }
        let jsonResult = jsonHelper.parseNLCJSON(watsonResponse);

        // return promise of json result
        return jsonResult;
    }

    private async parseNLCJSONforSelection(watsonResponsePromise: Thenable<any>) : Promise<any> {

        // initialize stuff while waiting for the searchText and response
        let jsonHelper = new JSONHelper();

        // wait for response
        let watsonResponse = await watsonResponsePromise;
        if (watsonResponse == null) {
            return null;
        }
        if (watsonResponse.error) {
            return new Promise<any>((resolve, reject) => reject(`Watson NLC Error: ${watsonResponse.description}`));
        }
        let jsonResult = jsonHelper.parseNLCForSelection(watsonResponse);

        // return promise of json result
        return jsonResult;
    }

    private async promptQuickPick(jsonPromise: Thenable<any>, q: QuickPickOptions, researchable: boolean) : Promise<any> {
        
        // wait for required variable
        let jsonResult = await jsonPromise;

        if (jsonResult == null) {
            return null;
        }

        // extract keys (filenames)
        var keys = [];
        if (researchable) {
            keys.push('Search Again');
        }
        for (var r in jsonResult) {
            keys.push(r);
        }

        // return promise of selection
        return window.showQuickPick(keys,q);
    }

    private async showHTML(selectedPromise: Thenable<any>, jsonResultPromise: Thenable<any>) : Promise<boolean> {

        let dh = new DocumentHelper();

        var url_1 = require('path').resolve(__dirname, 'temp_show_onetab.html');
        var url_desc = require('path').resolve(__dirname, 'temp_show_description.html');
        var url_pseu = require('path').resolve(__dirname, 'temp_show_pseudocode.html');
        var url_code = require('path').resolve(__dirname, 'temp_show_code.html');
        var fs = require('fs');

        let jsonResult = await jsonResultPromise;
        var selected: string;

        if (selectedPromise != null)
        {
            selected = await selectedPromise;
        } 
        else {
            // should this be based on top score or is first result (in dictionary) okay
            for (var r in jsonResult){
                selected = r;
                break;
            }   
        }

        var html_full = jsonResult[selected]; 
        let twotab = dh.parseTabs(html_full);

        if (twotab)
        {
            let desc_html = dh.Parse2TabDescription(html_full);
            let pseu_html = dh.Parse2TabPseudo(html_full);
            let code_html = dh.Parse2TabRealCode(html_full);

            fs.writeFile(url_desc, desc_html, (err) => {
                if (err) window.showErrorMessage(`FileWriteDesc Error: ${err}`);
            });
            fs.writeFile(url_pseu, pseu_html, (err) => {
                if (err) window.showErrorMessage(`FileWritePseu Error: ${err}`);
            });
            fs.writeFile(url_code, code_html, (err) => {
                if (err) window.showErrorMessage(`FileWriteCode Error: ${err}`);
            });

            let uri_desc = Uri.file(url_desc);
            let uri_pseu = Uri.file(url_pseu);
            let uri_code = Uri.file(url_code);

            await commands.executeCommand('vscode.previewHtml', uri_code, 2, 'Sample Code')
                                    .then((ret) => {return ret;},
                                        (err) => {window.showErrorMessage(`Failed to preview description: ${err}`)});
            await commands.executeCommand('vscode.previewHtml', uri_pseu, 2, 'Pseudo Code')
                                    .then((ret) => {return ret;},
                                        (err) => {window.showErrorMessage(`Failed to preview description: ${err}`)});
            await commands.executeCommand('vscode.previewHtml', uri_desc, 2, 'Description')
                                    .then((ret) => {return ret;},
                                        (err) => {window.showErrorMessage(`Failed to preview description: ${err}`)});;
        } else {
            
            let html = dh.parse1Tab(html_full);

            fs.writeFile(url_1, html, (err) => {
                if (err) window.showErrorMessage(`FileWrite1Tab Error: ${err}`);
            });

            let uri = Uri.file(url_1);

            await commands.executeCommand('vscode.previewHtml', uri, 2, 'Selected Result')
                                    .then((ret) => {return ret;},
                                        (err) => {window.showErrorMessage(`Failed to preview description: ${err}`)});
        }

        return true;
    }

    dispose() { }
}