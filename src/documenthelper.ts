
export class DocumentHelper {

    //If 2 tabs are needed, return true
    public parseTabs(document: string): boolean {
        var caribli = document.split('\n', 1)[0];
        if (caribli.search('2') == -1) {
            return false;
        } 
        return true;
    }
    
    public parseDocument(document: string) {

    }

}