
import * as WebRequest from 'web-request';

export class WatsonHelper {

    public searchDiscovery(searchText: string): Promise<WebRequest.Response<string>> {
        var url = "https://gateway.watsonplatform.net/discovery/api/v1/environments/" +
            "3120b03d-ac9c-46ac-a5e8-eaa282965961/collections/9ccfd375-fb1b-45c8-91d5-c3b2128e8038/" +
            "query?version=2017-11-07&count=5&query=" + searchText;
        var headers = this._buildDiscoveryHeaders(searchText);
        var result = WebRequest.json<any>(url, headers);
        return result;
    }

    private _buildDiscoveryHeaders(query: string): any {
        var credential = require('../env/discovery_credential.json');
        return credential;
    }

    public hitNLC(text: string): Promise<WebRequest.Response<string>> {
        var url = "https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/" +
        "8fc642x299-nlc-1245/classify?text=" + text;
        var headers = this._buildNLCHeaders(text);
        var result = WebRequest.json<any>(url, headers);
        return result;
    }

    private _buildNLCHeaders(query: string): any {
        var credential = require('../env/nlc_credential.json');
        return credential;
    }

    dispose() { /* nothing to dispose */ }
}