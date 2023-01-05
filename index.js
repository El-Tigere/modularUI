const http = require('http');
const fs = require('fs');

const port = 8080;
const host = '127.0.0.1';

const app = require('./app');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'ContentType': 'text/html'});
    let page = app.main.render().trim();
    res.end(page);
});

server.listen(port, host, () => {
    console.log(`Server listening on ${host}:${port}`);
});
