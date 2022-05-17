import { SlashCommandBuilder } from '@discordjs/builders';
import https from 'https'

const execute = async function execute(interaction) {
    const headers = {
        Username: "VetoVonVinkler",
    }
    
    let params = "channelId=UCgHwT_vuwoUBz4pFSUX1FFg&part=snippet,id&order=date&maxResults=50";
    const options = {
        body: {
            part: "content"
        },
        method: 'GET',
        hostname: 'www.googleapis.com',
        path: `/youtube/v3/channels?${params}&${process.env.vetoKey}`
    }
    const response = await callApi(options);
    const videoNames = [];
    for(let i = 0; i < response.items.length; i++) {
        videoNames.push(response.items[i].snippet.title);
    }
    console.log(response.items[1]);
	interaction.reply({
		content: videoNames.join(", \n"),
		ephemeral: true,
	});
}

async function callApi(options) {
    return new Promise ((resolve, reject) => {
        const req = https.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`)
        
            let data = '';
        
            res.on('data', (chunk) => {
                data += chunk;
            });
        
            res.on('close', () => {
                console.log('Retrieved all data');
                resolve (JSON.parse(data));
            });
        });

        req.on('error', error => {
            reject(error);
            console.error(error);
        }),

        req.end();
    });
}

async function create() {
    const data = new SlashCommandBuilder()
        .setName('getvideos')
        .setDescription('Gets the videos from the VetoVonVinkler Channel.')
	const command = {
        data: data,
        execute: execute
    } 
	
	return command;
}

export { create };