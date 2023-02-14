const http = require('http');
const fs = require('fs');

const port = 8080;
const host = '127.0.0.1';

const app = require('./page/app');

const mimeTypes = JSON.parse(fs.readFileSync('mime.json'));
// in pageMap (and mainPages): "/abc/123/" for entire directory; "/abc/123" for only this file
const pageMap = JSON.parse(fs.readFileSync('pageMap.json'));
const mainPages = {
    "default": app.main,
    "/": app.main // FIXME: this does not work if it is not "/"
};

// TODO: automatically delete entries
const sessionData = {};

/* example for the structure of the data object passed to the getElement function of elements:
? for optional properties

{
    "req": {...},
    "cookies": {
        "sessionToken": "44bc25832a6ab5361a4308661a9197cd069a9176f14af0f3a585d099aa23e8f8"
    },
    "sessionData": {
        "pageState": {"someKey": "someData"},
        "login": {"username": "Peter"}
    },
    "postData?": {
        "username": "abc",
        "password": "123",
        "updateData[colorTheme]": "hotdogStand"
    },
    "url": ["play", "level-select", "3-B"],
    "resCode": 200
}

*/

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

function splitUrl(url) {
    let parts = url.split('/');
    parts.splice(0, 1);
    return parts;
}

function respondMainPage(element, res, resCode, url, data) {
    data.url = splitUrl(url);
    data.resCode = resCode; // sets res code to expected res code
    res.setHeader('Content-Type', 'text/html');
    let page = element.render('', {}, data).trim();
    res.writeHead(data.resCode); // sends res code that might have changed
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
    let url = (((req.url || '/').match(/^([\w\d/]\.?)+$/g) || [''])[0].toLowerCase()).trim();
    
    if(!url) {
        // respond with 404 to all requests with special chars in the url (except / and . (but not ..))
        respondMainPage(mainPages.default, res, 404, '/404', data);
        return;
    }
    
    // redirect the url if possible (not to other domains but inside of the current domain)
    for(let key of Object.keys(pageMap.redirect)) {
        if((key.endsWith('/') && url.startsWith(key)) || url == key) {
            url = pageMap.redirect[key] + url.substring(key.length);
            break;
        }
    }
    
    // check if the requested url is a resource
    // TODO: add a way to not send server side js files
    if(fs.existsSync('page/' + url) && fs.lstatSync('page/' + url).isFile()) {
        respondResource(res, url);
        return;
    }
    
    // check if the requested url is a main page
    for(let key of Object.keys(mainPages)) {
        if((key.endsWith('/') && url.startsWith(key)) || url == key) {
            respondMainPage(mainPages[key], res, 200, url, data);
            return;
        }
    }
    
    // if this is reached, no useful response was found
    respondMainPage(mainPages.default, res, 404, '/404', data);
}

// TODO: add databases for actual user authentication
function login(username, password, session) {
    if(!username || !password) return false; // login if any username or password is used
    session.login = {username: username};
    return true;
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
        sessionData[sessionToken] = {pageState: {someKey: 'someData'}};
        res.setHeader('Set-Cookie', `sessionToken=${sessionToken}; SameSite=Strict`)
    }
    data.sessionData = sessionData[sessionToken];
    
    // get data from http POST
    // TODO: make this readable
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
                
                // update pageState in sessionData
                // TODO: add a more general way of allowing clients to send data to the server
                Object.keys(postDataObject).forEach((key) => {
                    if(key.startsWith('updateData[') && key.endsWith(']') && key != 'updateData[]') {
                        let path = key.substring('updateData['.length, key.length - ']'.length).split('][');
                        let current = sessionData[sessionToken].pageState;
                        for(let i = 0; i < path.length - 1; i++) {
                            // break when the property that should be set does not already exist
                            if(!current?.hasOwnProperty(path[i])) break;
                            
                            // go to the next key in the object path
                            current = current[path[i]];
                        };
                        if(current?.hasOwnProperty(path[path.length - 1])) current[path[path.length - 1]] = postDataObject[key];
                    }
                });
                
                // login
                if(postDataObject.username && postDataObject.password) {
                    login(postDataObject.username, postDataObject.password, sessionData[sessionToken]);
                }
                
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
