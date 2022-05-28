import express from 'express';
import bodyParser from 'body-parser';
import * as fs from 'fs';
import trelloNotifications from './displayTrelloNotifications.js';

function setUpWebhook(client) {
    const app = express();
    
    app.use(bodyParser.urlencoded({extended: true}));
    
    app.use(bodyParser.json());
    
    const port = process.env.port || 3000;
    
    app.listen(port, () => {
        console.log(`Baconbot Trello webhook listening on port ${port}`)
    })

    app.get('/baconbotwebhook', (req, res) => {
        res.send(200)
    });
    
    app.post('/baconbotwebhook', (req, res) => {
        const data = 200;
        const trelloMessage = JSON.stringify(req.body);
        fs.writeFile('./trelloresponse.txt', trelloMessage, err => {
            if (err) {
              console.error(err);
            }
            // file written successfully
        });

        trelloNotifications.displayTrelloNotifications(client, req.body);

        res.json(data);
    });
}

export default { setUpWebhook }
