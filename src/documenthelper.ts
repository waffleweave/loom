
export class DocumentHelper {

    //If 2 tabs are needed, return true
    public parseTabs(document: string): boolean {
        var caribli = document.split('\n', 1)[0];
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
        var start = document.indexOf("Description");
        var end = document.indexOf("Pseudocode");
        var stephen = document.substring(start,end);
        stephen = stephen.substring(0,stephen.lastIndexOf("\n"));
        return stephen;
    }

    public Parse2TabPseudo(document: string): string {
        var start = document.indexOf("Pseudocode");
        var end = document.indexOf("Code");
        var stephen = document.substring(start,end);
        stephen = stephen.substring(0,stephen.lastIndexOf("\n"));
        return stephen;
    }

    public Parse2TabRealCode(document: string): string {
        var start = document.indexOf("Code");
        var stephen = document.substring(start);
        return stephen;
    }

}