
export class DocumentHelper {

    //If 2 tabs are needed, return true
    public parseTabs(document: string): boolean {
        var first = document.indexOf("id=\"content\"");
        var nopebad = document.substr(first);
        var caribli = nopebad.split('\n', 2)[1];
        if (caribli.search('2') == -1) {
            return false;
        } 
        return true;
    }

    public parse1Tab(document: string): string {
        var realDoc = document.substring(document.indexOf("\n") + 1);
        return realDoc;
    }

    public Parse2TabDescription(document: string): string {
        var first = document.indexOf("Description");
        var firstPart = document.substring(0,first);
        var start = firstPart.lastIndexOf("\n");
        var end = document.indexOf("Pseudocode");
        if (end == -1) {
            end = document.indexOf("Pseudo-code");
        }
        var stephen = document.substring(start,end);
        stephen = stephen.substring(0,stephen.lastIndexOf("\n"));
        return stephen;
    }

    public Parse2TabPseudo(document: string): string {
        var first = document.indexOf("Pseudocode");
        if (first == -1) {
            first = document.indexOf("Pseudo-code");
        }
        var firstPart = document.substring(0,first);
        var start = firstPart.lastIndexOf("\n");
        var end = document.indexOf("Code");
        var stephen = document.substring(start,end);
        stephen = stephen.substring(0,stephen.lastIndexOf("\n"));
        return stephen;
    }

    public Parse2TabRealCode(document: string): string {
        var first = document.indexOf("Code");
        var firstPart = document.substring(0,first);
        var start = firstPart.lastIndexOf("\n");
        var stephen = document.substring(start);
        return stephen;
    }

}