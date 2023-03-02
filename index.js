const http = require('http');
const fs = require('fs');

const port = 8080;
const host = '127.0.0.1';

// TODO change to multiple entry points (some sort of main element of each subpage)
const app = require('./page/app');

const mimeTypes = JSON.parse(fs.readFileSync('mime.json'));
const pageMap = JSON.parse(fs.readFileSync('pageMap.json'));
const mainPages = {
    "default": app.main,
    "": app.main
};

// TODO: automatically delete entries
const sessionData = {};

// init Elements
let collector = {rElements: {}};
mainPages.default.init(collector);
const rElements = collector.rElements;

// TODO: make the names and structure of this less complicated
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
    let page = element.render('', {}, data);
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

function respond(req, res, data) {
    let url = (((req.url || '/').match(/^([\w\d/]\.?)+$/g) || [''])[0].toLowerCase()).trim();
    
    if(!url) {
        // respond with 404 to all requests with special chars in the url (except / and . (but not ..))
        respondMainPage(mainPages.default, res, 404, '/404', data);
        return;
    }
    
    // update pageState in sessionData
    if(data.postData?.updateData) {
        Object.assign(data.sessionData.pageState, data.postData.updateData);
    }
    
    // login
    if(data.postData?.username && data.postData?.password) {
        login(data.postData.username, data.postData.password, data.sessionData);
    }
    
    // redirect the url if possible (not to other domains but inside of the current domain)
    for(let key of Object.keys(pageMap.redirect)) {
        if(url == key || (url.startsWith(key + '/'))) {
            url = pageMap.redirect[key] + url.substring(key.length);
            break;
        }
    }
    
    // refresh single elements
    // TODO: add parameters to refreshed objects
    if(data.postData?.getElement) {
        const element = rElements[data.postData.getElement];
        if(element) {
            respondMainPage(element, res, 200, url, data);
        } else {
            // invalid requested element -> respond with nothing
            res.setHeader('Content-Type', 'text/plain');
            res.writeHead(404);
            res.end('');
        }
        return;
    }
    
    // check if the requested url is a resource
    // TODO: add a way to not send server side js files
    if(fs.existsSync('page/' + url) && fs.lstatSync('page/' + url).isFile()) {
        respondResource(res, url);
        return;
    }
    
    // check if the requested url is a main page
    for(let key of Object.keys(mainPages)) {
        if(url == key || (url.startsWith(key + '/'))) {
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

/**
 * Parses a string from a http post request into an object
 * @param {string} str 
 */
function parsePostData(str) {
    let obj = {};
    
    // split input into individual property assignments
    const properties = str.split('&');
    properties.forEach((p) => {
        // split property into key and value
        let [key, val] = p.split('=');
        if(!(key && val)) return;
        
        // go to the object that should be changed
        const keyParts = key.match(/[\w\d%!().\-_]+|\[\]/g);
        let current = obj;
        for(let i = 0; i < keyParts.length - 1; i++)
        {
            if(keyParts[i] == '[]') return; // this is only allowed for the last key part
            
            // create new object or array if necessary
            if(!current[keyParts[i]]) {
                if(keyParts[i + 1] && (!isNaN(keyParts[i + 1]) || keyParts[i + 1] == '[]')) current[keyParts[i]] = [];
                else current[keyParts[i]] = {};
            }
            
            // go to the next object/array
            current = current[keyParts[i]];
        }
        
        // insert value
        const lastKey = keyParts[keyParts.length - 1];
        if(lastKey == '[]' && current instanceof Array) {
            current.push(val);
        } else {
            current[lastKey] = val;
        }
    });
    
    return obj;
}

const server = http.createServer((req, res) => {
    
    let data = {};
    data.req = req;
    
    // get cookies
    const cookies = getCookies(req);
    data.cookies = cookies;
    
    // get session data and create session token if necessary
    let sessionToken = cookies['sessionToken'];
    if(!sessionToken || !sessionData.hasOwnProperty(sessionToken)) {
        sessionToken = generateSessionToken();
        sessionData[sessionToken] = {pageState: {someKey: 'someData'}};
        res.setHeader('Set-Cookie', `sessionToken=${sessionToken}; SameSite=Strict`)
    }
    data.sessionData = sessionData[sessionToken];
    
    if(req.method != 'POST') {
        // respond
        respond(req, res, data);
        return
    }
    
    // get data from http POST
    let end = false;
    let postDataString = '';
    
    req.on('data', (chunk) => {
        if(end) return;
        
        postDataString += chunk.toString();
        
        // limit request size
        // TODO: find a better way of limiting the request size
        if(postDataString.length > (1024 * 16)) {
            end = true;
            respondMainPage(mainPages.default, res, 404, '/404', data);
        }
    });
    
    function endTransfer() {
        if(end) return;
        end = true;
        
        // parse post data
        // TODO: check for special characters in postDataString
        let postDataObject = parsePostData(decodeURIComponent(postDataString));
        data.postData = postDataObject;
        
        // respond
        respond(req, res, data);
    }
    req.on('end', endTransfer);
    setTimeout(endTransfer, 5000);
});

server.listen(port, host, () => {
    console.log(`Server listening on ${host}:${port}`);
});
