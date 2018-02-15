import { json } from "web-request";

interface WatsonJSONResult {
    results: Array<{
        extracted_metadata: { filename: string; }
        text: string;
    }>;
}

interface WatsonParsedResult<TValue> {
    [id: string]: TValue;
}

export class JSONHelper {

    public parseJSON(jsonChunk: Object): WatsonParsedResult<string> {
        var list = JSON.stringify(<JSON> jsonChunk);
        var randoJson: WatsonJSONResult = JSON.parse(list);
        var watsonParsed : WatsonParsedResult<string> = {};
        for (var response of randoJson.results) {
            watsonParsed[response.extracted_metadata.filename] = response.text;
        }
        return watsonParsed;
    }

    dispose() { /* nothing to dispose */ }
}