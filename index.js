const http = require('http');
const fs = require('fs');

const port = 8080;
const host = '127.0.0.1';

const mimeTypes = JSON.parse(fs.readFileSync('mime.json'));

const app = require('./page/app');

function respondWidthContent(req, res, requestData) {
    
    // respond with 404 to all requests with special chars in the url (except / and . (but not ..))
    const url = (((req.url || '/').match(/^([\w\d/]\.?)+$/g) || [''])[0].toLowerCase()).trim();
    if(url == '') {
        res.writeHead(404);
        res.end();
        return;
    }
    
    // respond with the main page when the url '/' is requested
    if(url == '/') {
        res.writeHead(200, {'ContentType': 'text/html'});
        let page = app.main.render('', {}, requestData).trim();
        res.end(page);
        return;
    }
    
    // respond with resources
    // TODO: add a way to use client side external js files
    if(!url.endsWith('.js') && fs.existsSync('page/' + url)) {
        const ending = (url.match(/\.[\w\d]+$/) || [])[0];
        if(ending && mimeTypes[ending]) {
            res.writeHead(200, {'ContentType': mimeTypes[ending]});
            res.end(fs.readFileSync('page/' + url));
        } else {
            res.writeHead(415);
            res.end();
        }
        return;
    }
    
    res.writeHead(404);
    res.end;
    
}

const server = http.createServer((req, res) => {
    
    if(req.method == 'POST') {
        let end = false;
        const data = {};
        req.on('data', (chunk) => {
            (chunk + '').split('&').forEach((e) => {
                const parts = e.split('=');
                if(parts[0] && parts[1]) data[parts[0]] = parts[1];
            });
        });
        function respond() {
            if(!end) {
                console.log(data);
                end = true;
                respondWidthContent(req, res, data);
            }
        }
        req.on('end', respond);
        setTimeout(respond, 5000);
    } else {
        respondWidthContent(req, res, {});
    }
    
});

server.listen(port, host, () => {
    console.log(`Server listening on ${host}:${port}`);
});
