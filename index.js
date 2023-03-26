const http = require('http');
const fs = require('fs');

const renderer = require('./renderer');
const parsers = require('./parsers');
const pageLoader = require('./pageLoader');

const config = JSON.parse(fs.readFileSync('config.json'));

const mimeTypes = JSON.parse(fs.readFileSync('mime.json'));
// TODO: add url parameters to specify error type in page maps
const pageMap = JSON.parse(fs.readFileSync('pageMap.json'));
const entryElements = pageLoader.getEntries(config.pageRoot);

// TODO: automatically delete entries
const sessionData = {};

// init RElements
const rElements = pageLoader.initializePage(entryElements).rElements;

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

/**
 * The function that is used as the http request listener for the server.
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 * @returns 
 */
function serverListener(req, res) {
    
    let data = {};
    data.req = req;
    
    // get cookies
    data.cookies = req.headers?.cookie ? parsers.parseCookies(req.headers.cookie) : {};
    
    // get session data and create session token if necessary
    let sessionToken = data.cookies['sessionToken'];
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
        // TODO: change error type
        if(postDataString.length > (1024 * 16)) {
            end = true;
            respondError(res, 404, data);
        }
    });
    
    function endTransfer() {
        if(end) return;
        end = true;
        
        // parse post data
        // TODO: check if decodeURIComponent() is needed here
        let postDataObject = parsers.parseHttpData(decodeURIComponent(postDataString));
        data.postData = postDataObject;
        
        // respond
        respond(req, res, data);
    }
    req.on('end', endTransfer);
    setTimeout(endTransfer, 5000);
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

/**
 * Responds to a http request after the cookies, session data and post data have been recieved and parsed.
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 * @param {Object} data 
 */
function respond(req, res, data) {
    // TODO: find a solution for ignoring case only in path and not in url parameters
    const urlStr = (((req.url || '/').match(/^([\w\d/?%&=]\.?)+$/g) || [''])[0]/*.toLowerCase()*/).trim();
    
    if(!urlStr) {
        // respond with 404 to all requests with special chars in the url (except / and . (but not ..))
        respondError(res, 404, data);
        return;
    }
    
    let url = new pageLoader.UrlPath(urlStr);
    
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
        if(url.pathStr == key || (url.pathStr.startsWith(key + '/'))) {
            url = new pageLoader.UrlPath(pageMap.redirect[key] + url.pathStr.substring(key.length));
            break;
        }
    }
    
    // refresh single elements
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
    
    // check if the requested url is an entry page
    const entry = url.getEntryElement(entryElements);
    if(entry) {
        respondMainPage(entry, res, 200, url, data);
        return;
    }
    
    // check if the requested url is a resource
    const resourcePath = config.pageRoot + '/' + url.pathStr;
    if(!resourcePath.endsWith('.m.js') && fs.existsSync(resourcePath) && fs.statSync(resourcePath).isFile()) {
        respondResource(res, url.str);
        return;
    }
    
    // if this is reached, no useful response was found
    respondError(res, 404, data);
}

/**
 * Renders the given entry element and responds to the http request with it.
 * @param {renderer.Element} element 
 * @param {http.ServerResponse} res 
 * @param {Number} resCode 
 * @param {pageLoader.UrlPath} url 
 * @param {Object} data 
 */
function respondMainPage(element, res, resCode, url, data) {
    data.url = url;
    data.resCode = resCode; // sets res code to expected res code
    res.setHeader('Content-Type', 'text/html');
    let page = element.render('', {}, data);
    res.writeHead(data.resCode); // sends res code that might have changed
    res.end(page);
}

/**
 * Responds to the http request with a resource.
 * @param {http.ServerResponse} res 
 * @param {String} urlStr 
 */
function respondResource(res, urlStr) {
    const ending = (urlStr.match(/\.[\w\d]+$/) || [])[0];
    if(ending && mimeTypes[ending]) {
        res.setHeader('Content-Type', mimeTypes[ending]);
        res.writeHead(200);
        res.end(fs.readFileSync(config.pageRoot + '/' + urlStr));
    } else {
        console.log('unknown file type:')
        console.log('url: ' + urlStr);
        console.log(fs.lstatSync(config.pageRoot + '/' + urlStr).isFile());
        res.writeHead(415);
        res.end();
    }
    return;
}

// TODO: simplify this
/**
 * Responds to the http request with the error page.
 * @param {http.ServerResponse} res 
 * @param {Number} resCode 
 * @param {Object} data 
 */
function respondError(res, resCode, data) {
    const url = new pageLoader.UrlPath(pageMap.error + '?errorCode=' + resCode);
    respondMainPage(url.getEntryElement(entryElements), res, resCode, url, data);
}

// TODO: add databases for actual user authentication
function login(username, password, session) {
    if(!username || !password) return false; // login if any username or password is used
    session.login = {username: username};
    return true;
}

const server = http.createServer(serverListener);

server.listen(config.port, config.host, () => {
    console.log(`Server listening on ${config.host}:${config.port}`);
});
