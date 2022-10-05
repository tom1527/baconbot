import https from 'https'
class APICaller {

    constructor() {

    }  

    async makeApiCall(options, data) {
        return new Promise ((resolve, reject) => {
            const req = https.request(options, res => {
                console.log(`statusCode: ${res.statusCode}`);

                if(res.statusCode >= 399) {
                    reject(res.statusCode);
                }
            
                data = '';
            
                res.on('data', (chunk) => {
                    data += chunk;
                });
            
                res.on('close', () => {
                    console.log('Retrieved all data');
                    resolve (data);
                });
            });
            if(data) {
                req.write(data)
            }
            req.on('error', error => {
                reject(error);
                console.error(error);
            });
            req.end();
        });
    }
}

export { APICaller }
