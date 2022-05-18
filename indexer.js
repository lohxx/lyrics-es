const { Client: Client7 } = require('es7')
const fs = require('fs');


const client = new Client7({
  node: 'https://localhost:9200',
  auth: {
    username: 'elastic',
    password: 'QRH2DmTMyPC81+V9i*K4'
  },
  tls: {
    ca: fs.readFileSync('/Users/lohanna/http_ca.crt'),
    rejectUnauthorized: false
  }
});

async function indexData() {
    const v = await client.search({
        index: 'lyrics'
      })    

    return v;
}


module.exports = {
    indexData
};