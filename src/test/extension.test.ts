//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../extension';
import { JSONHelper } from '../jsonhelper';
import { WeaveSearcher } from '../weavesearcher';

// Defines a Mocha test suite to group tests of similar kind together
suite("JSONHelper Tests", () => {

    test('JSONHelper Parses Valid Discovery Response', () => {
        let jh = new JSONHelper();
        let testObject = mockDiscResponse;
        let expected = mockJSONResponse;
        let actual = jh.parseDiscoveryJSON(testObject);

        assert.equal(actual['lists_append.docx'], expected['lists_append.docx']);
        assert.equal(Object.keys(actual).length, Object.keys(expected).length);
    });
});

suite("WeaveSearcher Tests", () => {

    test('WeaveSearcher parseJSON parses valid Discover Response', (done) => {
        let ws = new WeaveSearcher();
        let testObject = mockDiscResponse;
        let expected = mockJSONResponse;
        let sent = new Promise<any>((resolve, reject) => resolve(testObject));
        ws.parseDiscoveryJSON(sent)
            .then((actual) => {
                assert.equal(actual['lists_append.docx'], expected['lists_append.docx']);
                assert.equal(Object.keys(actual).length, Object.keys(expected).length);
                done();
            });
    });

});

// you should collapse these with your editor probably
var mockDiscResponse = new Object({
    matching_results: 17,
    results: [
        new Object({
            id: "07839d0e497e5d24d0e37a3885cd532f",
            result_metadata: new Object({
                score: 1
            }),
            extracted_metadata: new Object({
                publicationdate: "2018-02-06",
                sha1: "0d0734cd5ce87a79015e1f3117113f8b292bb818",
                author: "Deshpande, Mohit",
                filename: "lists_append.docx",
                file_type: "word",
                title: "no title"
            }),
            html: "<?xml version='1.0' encoding='UTF-8' standalone='yes'?><html><head><meta content=\"text/html; charset=UTF-8\" http-equiv=\"Content-Type\"/>            <style type=\"text/css\">/**//**/</style>            <meta content=\"Deshpande, Mohit\" name=\"author\"/>            <meta content=\"2018-02-06\" name=\"publicationdate\"/>                        <title>no title</title></head>            <body class=\"b1\">                        <div id=\"content\">            <h1 dir=\"ltr\">list.append(<i>x</i>)</h1>            <p dir=\"ltr\">Add an item to the end of the list. Equivalent to a[len(a):] = [x].</p>            <h1 dir=\"ltr\">list.extend(<i>iterable</i>)</h1>            <p dir=\"ltr\">Extend the list by appending all the items from the iterable. Equivalent to a[len(a):] = iterable.</p>            <h1 dir=\"ltr\">list.insert(<i>i</i>, <i>x</i>)</h1>            <p dir=\"ltr\">Insert an item at a given position. The first argument is the index of the element before which to insert, so a.insert(0, x) inserts at the front of the list, and a.insert(len(a), x) is equivalent to a.append(x).</p>            <p dir=\"ltr\">&gt;&gt;&gt; fruits = ['orange', 'apple', 'pear', 'banana', 'kiwi', 'apple', 'banana']</p>            <p dir=\"ltr\">&gt;&gt;&gt; fruits.count('apple')</p>            <p dir=\"ltr\">2</p>            <p dir=\"ltr\">&gt;&gt;&gt; fruits.count('tangerine')</p>            <p dir=\"ltr\">0</p>            <p dir=\"ltr\">&gt;&gt;&gt; fruits.index('banana')</p>            <p dir=\"ltr\">3</p>            <p dir=\"ltr\">&gt;&gt;&gt; fruits.index('banana', 4)  # Find next banana starting a position 4</p>            <p dir=\"ltr\">6</p>            <p dir=\"ltr\">&gt;&gt;&gt; fruits.reverse()</p>            <p dir=\"ltr\">&gt;>> fruits</p>            <p dir=\"ltr\">['banana', 'apple', 'kiwi', 'banana', 'pear', 'apple', 'orange']</p>            <p dir=\"ltr\">&gt;&gt;&gt; fruits.append('grape')</p>            <p dir=\"ltr\">&gt;>> fruits</p>            <p dir=\"ltr\">['banana', 'apple', 'kiwi', 'banana', 'pear', 'apple', 'orange', 'grape']</p>            <p dir=\"ltr\">&gt;&gt;&gt; fruits.sort()</p>            <p dir=\"ltr\">&gt;>> fruits</p>            <p dir=\"ltr\">['apple', 'apple', 'banana', 'banana', 'grape', 'kiwi', 'orange', 'pear']</p>            <p dir=\"ltr\">&gt;&gt;&gt; fruits.pop()</p>            <p dir=\"ltr\">'pear'</p>            <p dir=\"ltr\"> </p>            </div>                        </body></html>",
            text: "THIS IS THE TEXT THAT WILL BE EXTRACTED                    FULL OF SPACES AND DUMB THINGS                        TABS                {!@#$%^&*()} SYMBOLS,,,,..,..,SAD       ETC",            
            enriched_text: new Object({            
                sentiment: new Object({            
                    document: new Object({
                        score: 0.167152,
                        label: "positive"
                    })
                }),
                entities: [
                    new Object({
                        count: 1,
                        sentiment: new Object({
                            text: "#",
                            relevance: 0.01,
                            type: "Hashtag"
                        })
                    })
                ],
                concepts: [
                    new Object({
                        text: "Fruit",
                        relevance: 0.964134,
                        dbpedia_resource: "http://dbpedia.org/resource/Fruit"
                    }),
                    new Object({
                        text: "Vitamin C",
                        relevance: 0.575633,
                        dbpedia_resource: "http://dbpedia.org/resource/Vitamin_C"
                    }),
                    new Object({
                        text: "Orange",
                        relevance: 0.405124,
                        dbpedia_resource: "http://dbpedia.org/resource/Orange_(fruit)"
                    }),
                    new Object({
                        text: "Citrus",
                        relevance: 0.385814,
                        dbpedia_resource: "http://dbpedia.org/resource/Citrus"
                    }),
                    new Object({
                        text: "Rosaceae",
                        relevance: 0.383273,
                        dbpedia_resource: "http://dbpedia.org/resource/Rosaceae"
                    })
                ],
                categories: [
                    new Object({
                        score: 0.755965,
                        label: "/food and drink/food/fruits and vegetables"
                    }),
                    new Object({
                        score: 0.406376,
                        label: "/food and drink/beverages/alcoholic beverages/wine"
                    }),
                    new Object({
                        score: 0.353773,
                        label: "/technology and computing/hardware/computer"
                    })
                ]
            })
        })
    ]
})
var mockJSONResponse = new Object({
    'lists_append.docx': "THIS IS THE TEXT THAT WILL BE EXTRACTED                    FULL OF SPACES AND DUMB THINGS                        TABS                {!@#$%^&*()} SYMBOLS,,,,..,..,SAD       ETC"
})
