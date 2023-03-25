const fs = require('fs');
const parsers = require('./parsers');

class UrlPath {
    
    constructor(str) {
        this.str = str;
        [this.pathStr, this.argsStr] = str.split('?');
        this.path = parsers.parseUrlPath(this.pathStr);
        if(this.argsStr) this.args = parsers.parseHttpData(this.argsStr);
    }
    
}
exports.UrlPath = UrlPath;

function get(entryElements, urlParts) {
    return parsers.getAt(entryElements, urlParts)?.index;
}
exports.get = get;

// TODO: create a custom class for the page entries
/**
 * Gets the entry points from the specified page.
 * @param {string} pageRoot
 */
function getEntries(pageRoot) {
    if(pageRoot == '') return;
    
    let page = {};
    
    traverseDirectory(pageRoot, [], (path) => {
        const pathStr = pageRoot + path.map((e) => '/' + e).join('');
        if(!fs.statSync(pathStr).isFile()) return;
        if(!pathStr.endsWith('.m.js')) return;
        
        // TODO: This is horrible. I need to change this.
        const mod = require(('./' + pathStr).replace('.js', ''));
        
        if(!mod.content) return;
        
        // insert object
        let current = page;
        path.slice(0, -1).forEach((e) => {
            if(current[e]) {
                current = current[e];
            } else {
                current = current[e] = {};
            }
        });
        current.index = mod.content;
    });
    
    return page;
}
exports.getEntries = getEntries;

/**
 * Initializes all elements that are related to (dependencies) or that are one of the entryElements.
 * @param {Object} entryElements
 */
function initializePage(entryElements) {
    let collector = {rElements: {}};
    initializeSubPage(entryElements, collector);
    return collector;
}
exports.initializePage = initializePage;

function initializeSubPage(subPage, collector) {
    Object.keys(subPage).forEach((k) => {
        if(k == 'index') {
            subPage[k].init(collector);
        } else {
            initializeSubPage(subPage[k], collector);
        }
    });
}

/**
 * @callback FileCallback
 * @param {Array<string>} filePath
 */

/**
 * Traverses every File and Directory in the given path.
 * @param {Array<string>} path 
 * @param {FileCallback} fileCallback 
 * @returns 
 */
function traverseDirectory(root, path, fileCallback) {
    const pathStr = root + path.map((e) => '/' + e).join('');
    
    if(!fs.existsSync(pathStr)) return;
    
    fileCallback(path);
    if(!fs.statSync(pathStr).isDirectory()) return;
    
    const subpaths = fs.readdirSync(pathStr);
    subpaths.forEach((e) => traverseDirectory(root, [...path, e], fileCallback));
}
