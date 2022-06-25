import { Interaction } from "discord.js";
import { APICaller } from "./APICaller.js";
import 'dotenv/config';

class Trello {

    constructor() {

    }

    async getLists() {
        const boardId = process.env.board_id;
        const options = {
            method: "GET",
            port: 443,
            hostname: "api.trello.com",
            path: `/1/boards/${boardId}/lists?key=${process.env.trello_key}&token=${process.env.trello_token}`,
        }
        const apiCaller = new APICaller();
        const rawResponse = await apiCaller.makeApiCall(options);
        let lists;
        try {
            lists = JSON.parse(rawResponse);
            return lists;
        } catch (error) {
            console.log(error);
        }
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
    
    async getCards(options) {
        const apiCaller = new APICaller();
        const rawResponse = await apiCaller.makeApiCall(options);
        var response = "";
        try {
            response = JSON.parse(rawResponse);
        } catch (error) {
            console.log(error);
            return;
        }

        const cards = {};
        for(let i = 0; i < response.length; i++) {
            Object.assign(cards, {
                [i]: {
                    cardName: response[i].name,
                    desc: response[i].desc,
                    id: response[i].id,
                }
            });
        }
        return cards;
    }

    async getClosestCard(cardName) {
        let bestMatch = null;
        let bestMatchId = null
        let bestDistance = 9999;
        const lists = await this.getLists();
        /* lists.forEach(async list => {
            const options = {
                method: "GET",
                port: 443,
                hostname: "api.trello.com",
                path: `/1/lists/${list.id}/cards?key=${process.env.trello_key}&token=${process.env.trello_token}`,
            }
            const cards = await this.getCards(options);
            console.log(cards);
            cards.forEach(card => {
                const distance = this.levenshteinDistance(cardName, card);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = lists[i].name;
                    bestMatchId = lists[i].id
                }
            });
        }); */
        for (var list in lists) {
            const options = {
                method: "GET",
                port: 443,
                hostname: "api.trello.com",
                path: `/1/lists/${lists[list].id}/cards?key=${process.env.trello_key}&token=${process.env.trello_token}`,
            }
            const cards = await this.getCards(options);
            console.log(cards);
            for(var card in cards) {
                const distance = this.levenshteinDistance(cardName, cards[card].cardName);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = cards[card].cardName;
                    bestMatchId = cards[card].id
                }
            };
        }
        console.log("****");
        console.log(bestDistance);
        if(bestDistance < 3) {
            const cardInfo = [bestMatch, bestMatchId];
            return cardInfo;
        } else {
            return null;
        }
    }

    async updateCard(cardInfo) {
        const options = {
            method: "PUT",
            port: 443,
            hostname: "api.trello.com",
            path: `/1/cards/${cardInfo.cardId}?key=${process.env.trello_key}&token=${process.env.trello_token}`,
            headers: {
                "Content-Type": "application/json",
                // key: process.env.trello_key,
                // token: process.env.trello_token
            }
        }

        const apiCaller = new APICaller();
        try {
            await apiCaller.makeApiCall(options, JSON.stringify(cardInfo));
            return 200;
        } catch (error) {
            console.log(error);
            return 500;
        }
        
    }

    levenshteinDistance(a="", b="") {
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
