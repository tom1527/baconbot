class Trello {

    constructor() {

    }

    async getClosestList(listName, lists) {
        var listNames = [];
        let bestMatch = null;
        let bestMatchId = null
        let bestDistance = 9999;
        for(let i = 0; i < lists.length; i++) {
            listNames.push(lists[i].name);
            const distance = await this.levenshteinDistance(listName.toLowerCase().trim(), lists[i].name.toLowerCase().trim());
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = lists[i].name;
                bestMatchId = lists[i].id
            }
        }
        if(bestDistance < 3) {
            const listInfo = [bestMatch, bestMatchId];
            return listInfo;
        } else {
            return null;
        }
    }

    async levenshteinDistance(a="", b="") {
        const al=a.length;
        const bl=b.length;
        if(!al) return bl; 	
        if(!bl) return al;
        const aa=[...a],
            ba=[...b];
        let i,j,matrix=[];
        for(i=0; i<=bl; ++i) matrix[i]=[i];
        const m0=matrix[0];
        for(j=0; j<=al; ++j) m0[j]=j;
        const alm1=al-1,blm1=bl-1;
        for(i=0; i<=blm1; ++i){
            for(j=0; j<=alm1; ++j){
                const mi=matrix[i],mi1=matrix[i+1];
                mi1[j+1]=aa[j]==ba[i]?
                    mi[j]:
                    Math.min(
                        mi[j]+1, // substitution
                        mi1[j]+1, // insertion
                        mi[j+1]+1 // deletion
                    );
            }
        }
        return matrix[bl][al];
    }
}

export { Trello }
