const fs = require('fs');
const parsers = require('./parsers');

/**
 * A class for urls. Contains the string- and array-form of the url.
 */
class UrlPath {
    
    /**
     * Constructor for a url using the url string.
     * @param {string} str 
     */
    constructor(str) {
        this.str = str;
        [this.pathStr, this.argsStr] = str.split('?');
        
        this.pathStr = this.pathStr.toLowerCase();
        this.path = parsers.parseUrlPath(this.pathStr);
        
        if(this.argsStr) this.args = parsers.parseHttpData(this.argsStr);
    }
    
}
exports.UrlPath = UrlPath;

/**
 * A class for the structure of the page entries and rElements.
 */
class Page {
    
    /**
     * Uses the page root to read the page structure.
     * @param {string} pageRoot 
     */
    constructor(pageRoot) {
        this.allElements = {};
        this.entries = loadPage(pageRoot, this.allElements);
        this.rElements = initializePage(this.entries).rElements;
    }
    
    /**
     * Returns the entry element of the given url.
     * @param {UrlPath} url 
     * @returns entry element
     */
    getEntry(url) {
        return parsers.getAt(this.entries, url.path)?.index;
    }
}
exports.Page = Page;

/**
 * Loads the specified page and adds all custom elements to allElements.
 * @param {string} pageRoot
 * @param {object} allElements
 */
function loadPage(pageRoot, allElements) {
    if(!pageRoot) return null;
    if(!fs.existsSync(pageRoot)) return null;
    if(!fs.statSync(pageRoot).isDirectory()) return null;
    
    return loadPageDir(pageRoot, allElements);
}

function loadPageDir(dir, allElements) {
    let subPage = {};
    
    const subpaths = fs.readdirSync(dir);
    subpaths.forEach((e) => {
        
        let dire = dir + '/' + e;
        
        // load module
        if(fs.statSync(dire).isFile() && dire.endsWith('.m.js')) {
            const module = require(('./' + dire).replace('.js', ''));
            if(module.elements) {
                let moduleName = e.substring(0, e.length - '.m.js'.length); // TODO: use a name that is set somewhere in the file instead of e (the filename)
                allElements[moduleName] = module.elements;
                if(module.elements.content) subPage['index'] = module.elements.content;
            }
        }
        
        // load subpage
        if(fs.statSync(dire).isDirectory()) {
            subPage[e] = loadPageDir(dire, allElements);
        }
        
    });
    
    return subPage;
}

/**
 * Initializes all elements that are related to (dependencies) or that are one of the entryElements.
 * @param {Object} entryElements
 */
function initializePage(entryElements) {
    let collector = {rElements: {}};
    initializeSubPage(entryElements, collector);
    return collector;
}

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
