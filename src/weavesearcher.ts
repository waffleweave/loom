
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
                // window.showErrorMessage(`Failed to query watson services: ${err}`);
                return null;
            });

        // setup local stuff while query is running
        var ochannel = window.createOutputChannel('watson_channel');

        // parse response into key-value pair dict
        var jsonResult;
        if (searchText.includes("help")) {
            jsonResult = getDefaultResponse(searchText);
        }
        else {
            jsonResult = jsonHelper.parseJSON(watsonResponse);
        }
        
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