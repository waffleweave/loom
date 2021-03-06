
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
                .then((res) => { 
                        console.log('_____________________________\ninput box results:');
                        console.log(res);
                        return res; 
                    },
                    (err) => {
                        window.showErrorMessage(`Failed to get input box: ${err}`);    
                });

            // get response from watson
            var watsonResponse = this.searchDiscovery(searchPromise)
                .then((res) => {
                    console.log('_____________________________\nDiscovery Search Results:');
                    console.log(res);
                    return res;
                })
                .catch((err) => { 
                    window.showErrorMessage(`Failed to searchDiscovery: ${err}`);
                });

            // parse json response (or get default)
            var jsonResult = this.parseDiscoveryJSON(watsonResponse, true)
                .then((res) => {
                    console.log('_____________________________\nDiscovery Parse Results:');
                    console.log(res);
                    return res;
                })
                .catch((err) => { 
                    window.showErrorMessage(`Failed to parseJSON: ${err}`);
                });

            // show quick pick options
            let q = <QuickPickOptions> {
                placeHolder : "Weave Search Results"
            };
            var selected = this.promptQuickPick(jsonResult, q, true)
                .then((res) => {
                    console.log('_____________________________\nQuick Pick Selection:');
                    console.log(res);
                    return res;
                })
                .catch((err) => { 
                    window.showErrorMessage(`Failed to promptQuickPick: ${err}`);
                });

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
            .then((res) => {
                console.log('_____________________________\nNLC response:');
                console.log(res);
                return res;
            })
            .catch((err) => { 
                window.showErrorMessage(`Failed to classify with NLC: ${err}`);
            });

        var jsonNLCResult = this.parseNLCJSONforSelection(NLCResponse)
            .then((res) => {
                console.log('_____________________________\nNLC Parse Results:');
                console.log(res);
                return res;
            })
            .catch((err) => { 
                window.showErrorMessage(`Failed to parseJSON: ${err}`);
            });

        // show quick pick options
        let q = <QuickPickOptions> {
            placeHolder : "Weave Search Results"
        };
        var selected = this.promptQuickPick(jsonNLCResult, q, false)
            .then((res) => {
                console.log('_____________________________\nQuick Pick Selection:');
                console.log(res);
                return res;
            })
            .catch((err) => { 
                window.showErrorMessage(`Failed to promptQuickPick: ${err}`);
            });

        // Now to discovery based on MLE 
        var discoveryResponse = this.searchDiscovery(selected)
            .then((res) => {
                console.log('_____________________________\nDiscovery Search Results:');
                console.log(res);
                return res;
            })
            .catch((err) => { 
                window.showErrorMessage(`Failed to searchDiscovery: ${err}`);
            });

        // parse json response (or get default)
        var jsonDiscoveryResult = this.parseDiscoveryJSON(discoveryResponse, true)
            .then((res) => {
                console.log('_____________________________\nDiscovery JSON Parse Result:');
                console.log(res);
                return res;
            })
            .catch((err) => { 
                window.showErrorMessage(`Failed to parseJSON: ${err}`);
             });

        // show output channel
        // this.showFirstOutputChannel('Weave Search Results', jsonDiscoveryResult);
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

    private async showAllResults(jsonResultPromise: Thenable<any>): Promise<boolean> {
        var jsonResult = await jsonResultPromise;
        var result:boolean = true; 
        var count = 0;
        for (var jr in jsonResult)
        {
            var url = require('path').resolve(__dirname, `temp_show_${count}.html`);
            require('fs').writeFile(url, jsonResult[jr], (err) => {if (err) window.showErrorMessage(`FileWrite Error: ${err}`)});
            result = result && <boolean>await commands.executeCommand('vscode.previewHtml', Uri.file(url), 2, `Result ${count}`)
                                        .then((ret) => {return ret;}, (err) => {window.showErrorMessage(`Failed to preview: ${err}`)});
            count += 1;
        }
        return result;
    }

    private async showOutputChannel(outputName: string, selectedPromise: Thenable<any>, jsonResultPromise: Thenable<any>) : Promise<boolean> {
        
        // setup local stuff while waiting for variables
        var ochannel = window.createOutputChannel(outputName);

        // wait for our required variables
        let jsonResult = await jsonResultPromise;
        let selected = await selectedPromise;

        // show corresponding result from selection
        ochannel.appendLine(`Results from chosen: ${selected}`);
        ochannel.append(jsonResult[selected]);
        ochannel.show();

        return true;
    }

    private async showFirstOutputChannel(outputName: string, jsonResultPromise: Thenable<any>) : Promise<boolean> {
        
        // setup local stuff while waiting for variables
        var ochannel = window.createOutputChannel(outputName);

        // wait for our required variables
        let jsonResult = await jsonResultPromise;

        // this is ridiculous can someone fix this
        let firstKey;
        for (var r in jsonResult){
            firstKey = r;
            break;
        }

        // show corresponding result from selection
        ochannel.appendLine(`Lucky Weave Results:`);
        ochannel.append(jsonResult[firstKey]);
        ochannel.show();

        return true;
    }

    dispose() { }
}

function getDefaultResponse(query: string) {

    var result = {};
    if (query.includes("list")) {
        result["lists_append.docx"] = "Lists Append:\n\nlist.append(x)\n\nAdd an item to the end of the list. Equivalent to a[len(a):] = [x].\n\nlist.extend(iterable)\n\nExtend the list by appending all the items from the iterable. Equivalent to a[len(a):] = iterable.\n\nlist.insert(i, x)\n\nInsert an item at a given position. The first argument is the index of the element before which to insert, so a.insert(0, x) inserts at the front of the list, and a.insert(len(a), x) is equivalent to a.append(x).\n\n>>> fruits = ['orange', 'apple', 'pear', 'banana', 'kiwi', 'apple', 'banana']\n>>> fruits.count('apple')\n\n2\n\n>>> fruits.count('tangerine')\n\n0\n\n>>> fruits.index('banana')\n\n3\n\n>>> fruits.index('banana', 4) # Find next banana starting a position 4\n\n6\n\n>>> fruits.reverse()\n>>> fruits\n\n['banana', 'apple', 'kiwi', 'banana', 'pear', 'apple', 'orange']\n\n>>> fruits.append('grape')\n>>> fruits\n\n['banana', 'apple', 'kiwi', 'banana', 'pear', 'apple', 'orange', 'grape']\n\n>>> fruits.sort()\n>>> fruits\n\n['apple', 'apple', 'banana', 'banana', 'grape', 'kiwi', 'orange', 'pear']\n\n>>> fruits.pop()\n\n'pear'\n";
        result["lists_utility.docx"] = "Lists Utility:\n\nlist.index(x[, start[, end]])\n\nReturn zero-based index in the list of the first item whose value is x. Raises a ValueError if there is no such item.\n\nThe optional arguments start and end are interpreted as in the slice notation and are used to limit the search to a particular subsequence of the list. The returned index is computed relative to the beginning of the full sequence rather than the start argument.\n\nlist.count(x)\n\nReturn the number of times x appears in the list.\n\nlist.sort(key=None, reverse=False)\n\nSort the items of the list in place (the arguments can be used for sort customization, see sorted() for their explanation).\n\nlist.reverse()\n\nReverse the elements of the list in place.\n\nlist.copy()\n\nReturn a shallow copy of the list. Equivalent to a[:].\n\n>>> fruits = ['orange', 'apple', 'pear', 'banana', 'kiwi', 'apple', 'banana']\n>>> fruits.count('apple')\n\n2\n\n>>> fruits.count('tangerine')\n\n0\n\n>>> fruits.index('banana')\n\n3\n\n>>> fruits.index('banana', 4) # Find next banana starting a position 4\n\n6\n\n>>> fruits.reverse()\n>>> fruits\n\n['banana', 'apple', 'kiwi', 'banana', 'pear', 'apple', 'orange']\n\n>>> fruits.append('grape')\n>>> fruits\n\n['banana', 'apple', 'kiwi', 'banana', 'pear', 'apple', 'orange', 'grape']\n\n>>> fruits.sort()\n>>> fruits\n\n['apple', 'apple', 'banana', 'banana', 'grape', 'kiwi', 'orange', 'pear']\n\n>>> fruits.pop()\n\n'pear'";
        result["lists_remove.docx"] = "Lists Remove:\n\nlist.remove(x)\n\nRemove the first item from the list whose value is x. It is an error if there is no such item.\n\nlist.pop([i])\n\nRemove the item at the given position in the list, and return it. If no index is specified, a.pop() removes and returns the last item in the list. (The square brackets around the i in the method signature denote that the parameter is optional, not that you should type square brackets at that position. You will see this notation frequently in the Python Library Reference.)\n\nlist.clear()\n\nRemove all items from the list. Equivalent to del a[:].\n\n>>> stack = [3, 4, 5]\n>>> stack.append(6)\n>>> stack.append(7)\n>>> stack\n\n[3, 4, 5, 6, 7]\n\n>>> stack.pop()\n\n7\n\n>>> stack\n\n[3, 4, 5, 6]\n\n>>> stack.pop()\n\n6\n\n>>> stack.pop()\n\n5\n\n>>> stack\n\n[3, 4]";
        result["set_construction.docx"] = "Set Construction:\n\ns.add(elem)\n\nAdd element elem to the set\n\ns.remove(elem)\n\nRemove element elem from the set. Raises KeyError if elem is not contained in the set.\n\ns.discard(elem)\n\nRemove element elem from the set if it is present.\n\ns.pop()\n\nRemove and return an arbitrary element form the set. Raises KeyError if the set is empty.\n\ns.clear()\n\nRemove all elements from the set.";
        result["quicksort_samplecode.docx"] = "Quicksort Sample code\n\ndef quicksort(myList, start, end):\n\n\tif start < end:\n\n\t\t# partition the list\n\t\tpivot = partition(myList, start, end)\n\n\t\t# sort both halves\n\t\tquicksort(myList, start, pivot-1)\n\t\tquicksort(myList, pivot+1, end)\n\n\treturn myList\n\n\n\n def partition(myList, start, end):\n\n\tpivot = myList[start]\n\tleft = start+1\n\tright = end\n\tdone = False\n\twhile not done:\n\t\twhile left <= right and myList[left] <= pivot:\n\t\t\tleft = left + 1\n\t\t\twhile myList[right] >= pivot and right >=left:\n\t\t\t\tright = right -1\n\t\t\t\tif right < left:\n\t\t\t\t\tdone= True\n\t\t\t\telse:\n\t\t\t\t\t# swap places\n\t\t\t\t\ttemp=myList[left]\n\t\t\t\t\tmyList[left]=myList[right]\n\t\t\t\t\tmyList[right]=temp\n\n\t\t\t# swap start with myList[right]\n\t\t\ttemp=myList[start]\n\t\t\tmyList[start]=myList[right]\n\t\t\tmyList[right]=temp\n\n\treturn right";
    }
    else if (query.includes("sort")) {
        result["quicksort_samplecode.docx"] = "Quicksort Sample code\n\ndef quicksort(myList, start, end):\n\n\tif start < end:\n\n\t\t# partition the list\n\t\tpivot = partition(myList, start, end)\n\n\t\t# sort both halves\n\t\tquicksort(myList, start, pivot-1)\n\t\tquicksort(myList, pivot+1, end)\n\n\treturn myList\n\n\n\n def partition(myList, start, end):\n\n\tpivot = myList[start]\n\tleft = start+1\n\tright = end\n\tdone = False\n\twhile not done:\n\t\twhile left <= right and myList[left] <= pivot:\n\t\t\tleft = left + 1\n\t\t\twhile myList[right] >= pivot and right >=left:\n\t\t\t\tright = right -1\n\t\t\t\tif right < left:\n\t\t\t\t\tdone= True\n\t\t\t\telse:\n\t\t\t\t\t# swap places\n\t\t\t\t\ttemp=myList[left]\n\t\t\t\t\tmyList[left]=myList[right]\n\t\t\t\t\tmyList[right]=temp\n\n\t\t\t# swap start with myList[right]\n\t\t\ttemp=myList[start]\n\t\t\tmyList[start]=myList[right]\n\t\t\tmyList[right]=temp\n\n\treturn right";
        result["set_construction.docx"] = "Set Construction:\n\ns.add(elem)\n\nAdd element elem to the set\n\ns.remove(elem)\n\nRemove element elem from the set. Raises KeyError if elem is not contained in the set.\n\ns.discard(elem)\n\nRemove element elem from the set if it is present.\n\ns.pop()\n\nRemove and return an arbitrary element form the set. Raises KeyError if the set is empty.\n\ns.clear()\n\nRemove all elements from the set.";
        result["lists_append.docx"] = "Lists Append:\n\nlist.append(x)\n\nAdd an item to the end of the list. Equivalent to a[len(a):] = [x].\n\nlist.extend(iterable)\n\nExtend the list by appending all the items from the iterable. Equivalent to a[len(a):] = iterable.\n\nlist.insert(i, x)\n\nInsert an item at a given position. The first argument is the index of the element before which to insert, so a.insert(0, x) inserts at the front of the list, and a.insert(len(a), x) is equivalent to a.append(x).\n\n>>> fruits = ['orange', 'apple', 'pear', 'banana', 'kiwi', 'apple', 'banana']\n>>> fruits.count('apple')\n\n2\n\n>>> fruits.count('tangerine')\n\n0\n\n>>> fruits.index('banana')\n\n3\n\n>>> fruits.index('banana', 4) # Find next banana starting a position 4\n\n6\n\n>>> fruits.reverse()\n>>> fruits\n\n['banana', 'apple', 'kiwi', 'banana', 'pear', 'apple', 'orange']\n\n>>> fruits.append('grape')\n>>> fruits\n\n['banana', 'apple', 'kiwi', 'banana', 'pear', 'apple', 'orange', 'grape']\n\n>>> fruits.sort()\n>>> fruits\n\n['apple', 'apple', 'banana', 'banana', 'grape', 'kiwi', 'orange', 'pear']\n\n>>> fruits.pop()\n\n'pear'\n";
        result["lists_utility.docx"] = "Lists Utility:\n\nlist.index(x[, start[, end]])\n\nReturn zero-based index in the list of the first item whose value is x. Raises a ValueError if there is no such item.\n\nThe optional arguments start and end are interpreted as in the slice notation and are used to limit the search to a particular subsequence of the list. The returned index is computed relative to the beginning of the full sequence rather than the start argument.\n\nlist.count(x)\n\nReturn the number of times x appears in the list.\n\nlist.sort(key=None, reverse=False)\n\nSort the items of the list in place (the arguments can be used for sort customization, see sorted() for their explanation).\n\nlist.reverse()\n\nReverse the elements of the list in place.\n\nlist.copy()\n\nReturn a shallow copy of the list. Equivalent to a[:].\n\n>>> fruits = ['orange', 'apple', 'pear', 'banana', 'kiwi', 'apple', 'banana']\n>>> fruits.count('apple')\n\n2\n\n>>> fruits.count('tangerine')\n\n0\n\n>>> fruits.index('banana')\n\n3\n\n>>> fruits.index('banana', 4) # Find next banana starting a position 4\n\n6\n\n>>> fruits.reverse()\n>>> fruits\n\n['banana', 'apple', 'kiwi', 'banana', 'pear', 'apple', 'orange']\n\n>>> fruits.append('grape')\n>>> fruits\n\n['banana', 'apple', 'kiwi', 'banana', 'pear', 'apple', 'orange', 'grape']\n\n>>> fruits.sort()\n>>> fruits\n\n['apple', 'apple', 'banana', 'banana', 'grape', 'kiwi', 'orange', 'pear']\n\n>>> fruits.pop()\n\n'pear'";
        result["lists_remove.docx"] = "Lists Remove:\n\nlist.remove(x)\n\nRemove the first item from the list whose value is x. It is an error if there is no such item.\n\nlist.pop([i])\n\nRemove the item at the given position in the list, and return it. If no index is specified, a.pop() removes and returns the last item in the list. (The square brackets around the i in the method signature denote that the parameter is optional, not that you should type square brackets at that position. You will see this notation frequently in the Python Library Reference.)\n\nlist.clear()\n\nRemove all items from the list. Equivalent to del a[:].\n\n>>> stack = [3, 4, 5]\n>>> stack.append(6)\n>>> stack.append(7)\n>>> stack\n\n[3, 4, 5, 6, 7]\n\n>>> stack.pop()\n\n7\n\n>>> stack\n\n[3, 4, 5, 6]\n\n>>> stack.pop()\n\n6\n\n>>> stack.pop()\n\n5\n\n>>> stack\n\n[3, 4]";
    }

    return result
}