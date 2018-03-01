import { json } from "web-request";

interface DiscoveryJSONResult {
    results: Array<{
        extracted_metadata: { filename: string; }
        text: string;
    }>;
}

interface NLCJSONResult {
    top_class: string;
}

interface DiscoveryParsedResult<TValue> {
    [id: string]: TValue;
}

export class JSONHelper {

    public parseDiscoveryJSON(jsonChunk: Object): DiscoveryParsedResult<string> {
        var list = JSON.stringify(<JSON> jsonChunk);
        var randoJson: DiscoveryJSONResult = JSON.parse(list);
        var watsonParsed : DiscoveryParsedResult<string> = {};
        for (var response of randoJson.results) {
            watsonParsed[response.extracted_metadata.filename] = response.text;
        }
        return watsonParsed;
    }

    public parseNLCJSON(jsonChunk: Object): string {
        var blob = JSON.stringify(<JSON> jsonChunk);
        var blobJSON: NLCJSONResult = JSON.parse(blob);
        return blobJSON.top_class;
    }

    dispose() { /* nothing to dispose */ }
}