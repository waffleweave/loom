
import * as WebRequest from 'web-request';
import { JSONHelper } from './jsonhelper';

export class WatsonHelper {

    public searchDiscovery(searchText: string): Promise<WebRequest.Response<string>> {
        var url = "https://gateway.watsonplatform.net/discovery/api/v1/environments/" +
            "3120b03d-ac9c-46ac-a5e8-eaa282965961/collections/a200677f-df1c-42b2-a313-cc9284c7a5b5/" +
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
        let jh = new JSONHelper();
        var url = "https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/";
        var headers = this._buildNLCHeaders();
        let classifier = (jh.getNLCCredential(headers).classifier_id);
        url = url + classifier + `/classify?text='${text}'`;
        var result = WebRequest.json<any>(url, headers);
        return result;
    }

    private _buildNLCHeaders(): any {
        var credential = require('../env/nlc_credential.json');
        return credential;
    }

    dispose() { /* nothing to dispose */ }
}