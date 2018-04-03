import { json } from "web-request";

interface DiscoveryJSONResult {
    results: Array<{
        extracted_metadata: { filename: string; }
        text: string;
        html: string;
    }>;
}

interface NLCJSONResult {
    top_class: string;
    classes: Array<{
        class_name: string;
        confidence: number;
    }>;
}

interface DiscoveryParsedResult<TValue> {
    [id: string]: TValue;
}

interface NLC_Credential {
    auth: {
        username: string,
        password: string
    },
    classifier_id: string,
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

    public parseDiscoveryJSONToHTML(jsonChunk: Object): DiscoveryParsedResult<string> {
        var list = JSON.stringify(<JSON> jsonChunk);
        var randoJson: DiscoveryJSONResult = JSON.parse(list);
        var watsonParsed : DiscoveryParsedResult<string> = {};
        for (var response of randoJson.results) {
            watsonParsed[response.extracted_metadata.filename] = response.html;
        }
        return watsonParsed;
    }

    public parseNLCJSON(jsonChunk: Object): string {
        var blob = JSON.stringify(<JSON> jsonChunk);
        var blobJSON: NLCJSONResult = JSON.parse(blob);
        return blobJSON.top_class;
    }

    public parseNLCForSelection(jsonChunk: Object): DiscoveryParsedResult<number> {
        var blob = JSON.stringify(<JSON> jsonChunk);
        var blobJSON: NLCJSONResult = JSON.parse(blob);
        var result = {};
        blobJSON.classes.forEach(res => {
            result[res.class_name] = res.confidence;
        });
        return result;
    }

    public getNLCCredential(jsonChunk: Object): NLC_Credential {
        var blobby = JSON.stringify(<JSON> jsonChunk);
        var blobbyJSON: NLC_Credential = JSON.parse(blobby);
        return blobbyJSON;
    }

    dispose() { /* nothing to dispose */ }
}