
import { commands, ExtensionContext } from 'vscode';
import { WeaveSearcher } from './weavesearcher';

// Isaac cannot hit watson services without this (at the moment)...
// this is probably a bad idea though so only enable this if you have to.
// require('https').globalAgent.options.rejectUnauthorized = false;

export function activate(context: ExtensionContext) {
    let weaveSearcher = new WeaveSearcher();
    let sayHelloCommand = commands.registerCommand('extension.sayHello', () => {
        weaveSearcher.searchBar();
    });
    // let searchThisCommand = commands.registerCommand('extension.searchThis', (text) => {
    //     weaveSearcher.search(text);
    // });
    context.subscriptions.push(weaveSearcher);
    context.subscriptions.push(sayHelloCommand);
    // context.subscriptions.push(searchThisCommand);
}