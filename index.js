const http = require('http');
const fs = require('fs');

const renderer = require('./renderer');

const port = 8080;
const host = '127.0.0.1';

const elements = {
    'app': require('./app')
};

let page = elements['app']['main']().trim();

page = renderer.render(page, elements);

const server = http.createServer((req, res) => {
    res.writeHead(200, {'ContentType': 'text/html'});
    res.end(page);
});

server.listen(port, host, () => {
    console.log(`Server listening on ${host}:${port}`);
});
