const http = require('http');
const fs = require('fs');

const port = 8080;
const host = '127.0.0.1';

const mimeTypes = JSON.parse(fs.readFileSync('mime.json'));

const app = require('./page/app');

// TODO: automatically delete entrys
const sessionData = {};

function getCookies(req) {
    let cookies = {};
    req.headers?.cookie?.split(';')?.forEach((e) => {
        let [key, ...value] = e.split('=');
        key = key.trim();
        value = decodeURIComponent(value?.join('=').trim());
        if(key) cookies[key] = value;
    });
    return cookies;
}

// TODO: make this (a lot) more secure
function generateSessionToken() {
    let token;
    do {
        token = '';
        for(let i = 0; i < 64; i++) {
            token += ((Math.random() * 16) >> 0).toString(16);
        }
    } while(sessionData.hasOwnProperty(token))
    return token;
}

// TODO: alternative for having a "url" here (save current page in sessionData)
function respondMainPage(res, resCode, url, data) {
    data.url = url;
    res.writeHead(resCode, {'ContentType': 'text/html'});
    let page = app.main.render('', {}, data).trim();
    res.end(page);
}

function respondResource(res, url) {
    const ending = (url.match(/\.[\w\d]+$/) || [])[0];
    if(ending && mimeTypes[ending]) {
        res.writeHead(200, {'ContentType': mimeTypes[ending]});
        res.end(fs.readFileSync('page/' + url));
    } else {
        console.log('unknown file type:')
        console.log('url: ' + url);
        console.log(fs.lstatSync('page/' + url).isFile());
        res.writeHead(415);
        res.end();
    }
    return;
}

function respond(req, res, data) {
    
    // respond with 404 to all requests with special chars in the url (except / and . (but not ..))
    const url = (((req.url || '/').match(/^([\w\d/]\.?)+$/g) || [''])[0].toLowerCase()).trim();
    if(url == '') {
        respondMainPage(res, 404, '/404', data);
        return;
    }
    
    if(url && url != '/' && !url.endsWith('.js') && fs.existsSync('page/' + url) && fs.lstatSync('page/' + url).isFile()) {
        // respond with resources
        // TODO: add a way to use client side external js files
        respondResource(res, url);
        return;
    } else {
        // respond with the main page
        // TODO: add a way of having multiple main pages
        respondMainPage(res, 200, url, data);
        return;
    }
    
}

const server = http.createServer((req, res) => {
    
    let data = {};
    data.req = req;
    
    // get cookies
    const cookies = getCookies(req);
    data.cookies = cookies;
    
    // get session data and create session token if necessary
    if(!cookies.hasOwnProperty('sessionToken') || !sessionData.hasOwnProperty(cookies['sessionToken'] || 'x')) {
        let token = generateSessionToken();
        sessionData[token] = {};
        res.setHeader('Set-Cookie', 'sessionToken=' + token)
    }
    data.sessionData = sessionData[cookies['sessionToken']];
    
    // get data from http POST
    if(req.method == 'POST') {
        let end = false;
        const formData = {};
        req.on('data', (chunk) => {
            (chunk + '').split('&').forEach((e) => {
                const parts = e.split('=');
                if(parts[0] && parts[1]) formData[parts[0]] = parts[1];
            });
        });
        function endTransfer() {
            if(!end) {
                end = true;
                data.formData = formData;
                // respond
                respond(req, res, data);
            }
        }
        req.on('end', endTransfer);
        setTimeout(endTransfer, 5000);
    } else {
        // respond
        respond(req, res, data);
    }
    
});

server.listen(port, host, () => {
    console.log(`Server listening on ${host}:${port}`);
});
