
import * as WebRequest from 'web-request';

export class WatsonHelper {

    public searchWatson(searchText: string): Promise<WebRequest.Response<string>> {
        
        // TODO: move away from URL/WebRequests -> Watson Node library
        var url = "https://gateway.watsonplatform.net/discovery/api/v1/environments/3120b03d-ac9c-46ac-a5e8-eaa282965961/collections/9ccfd375-fb1b-45c8-91d5-c3b2128e8038/query?version=2017-11-07&count=5&query=" + searchText;
        var headers = this._buildWatsonHeaders(searchText);
        var result = WebRequest.json<any>(url, headers);
        return result;
    }

    private _buildWatsonHeaders(query: string): any {
        var credential = require('../env/discovery_credential.json');
        return credential;
    }

    dispose() { /* nothing to dispose */ }
}