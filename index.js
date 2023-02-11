const http = require('http');
const fs = require('fs');

const port = 8080;
const host = '127.0.0.1';

const mimeTypes = JSON.parse(fs.readFileSync('mime.json'));

const app = require('./page/app');

// TODO: automatically delete entries
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
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(resCode);
    let page = app.main.render('', {}, data).trim();
    res.end(page);
}

function respondResource(res, url) {
    const ending = (url.match(/\.[\w\d]+$/) || [])[0];
    if(ending && mimeTypes[ending]) {
        res.setHeader('Content-Type', mimeTypes[ending]);
        res.writeHead(200);
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

// TODO: implement responses with only one element of a page
function respond(req, res, data) {
    
    // respond with 404 to all requests with special chars in the url (except / and . (but not ..))
    const url = (((req.url || '/').match(/^([\w\d/]\.?)+$/g) || [''])[0].toLowerCase()).trim();
    if(url == '') {
        respondMainPage(res, 404, '/404', data);
        return;
    }
    
    if(url && url != '/' /*&& !url.endsWith('.js')*/ && fs.existsSync('page/' + url) && fs.lstatSync('page/' + url).isFile()) {
        // respond with resources
        // TODO: add a way to not send server side js files
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
    // TODO: only create session when on main page
    let sessionToken = cookies['sessionToken'];
    if(!sessionToken || !sessionData.hasOwnProperty(sessionToken)) {
        sessionToken = generateSessionToken();
        sessionData[sessionToken] = {someKey: 'someData'};
        res.setHeader('Set-Cookie', `sessionToken=${sessionToken}; SameSite=Strict`)
    }
    data.sessionData = sessionData[sessionToken];
    
    // get data from http POST
    if(req.method == 'POST') {
        let end = false;
        let postDataString = '';
        req.on('data', (chunk) => {
            postDataString += chunk.toString();
        });
        function endTransfer() {
            if(!end) {
                end = true;
                let postDataObject = {};
                
                // parse post data
                decodeURIComponent(postDataString).split('&').forEach((e) => {
                    const parts = e.split('=');
                    if(parts[0] && parts[1]) postDataObject[parts[0]] = parts[1];
                });
                data.postData = postDataObject;
                // update sessionData
                // TODO: make this readable
                Object.keys(postDataObject).forEach((key) => {
                    if(key.startsWith('updateData[') && key.endsWith(']') && key != 'updateData[]') {
                        let path = key.substring('updateData['.length, key.length - ']'.length).split('][');
                        let current = sessionData[sessionToken];
                        for(let i = 0; i < path.length - 1; i++) {
                            // break when the property that should be set does not already exist
                            if(!current?.hasOwnProperty(path[i])) break;
                            
                            // go to the next key in the object path
                            current = current[path[i]];
                        };
                        if(current?.hasOwnProperty(path[path.length - 1])) current[path[path.length - 1]] = postDataObject[key];
                    }
                });
                
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
