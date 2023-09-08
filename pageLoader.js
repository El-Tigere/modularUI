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
        
        this.path = parsers.parseUrlPath(this.pathStr);
        
        this.args = parsers.parseHttpData(this.argsStr);
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
        this.rElements = initializePage(this.allElements).rElements;
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

/**
 * Loads a directory.
 * @param {string} dir 
 * @param {object} allElements 
 * @returns 
 */
function loadPageDir(dir, allElements) {
    let subPage = {};
    
    const subpaths = fs.readdirSync(dir);
    subpaths.forEach((e) => {
        
        let dire = dir + '/' + e;
        
        // load module
        if(fs.statSync(dire).isFile() && dire.endsWith('.m.js')) {
            const module = require(('./' + dire).replace('.js', ''));
            if(module.elements && module.groupName) {
                // add elements to allElements
                if(allElements[module.groupName]) {
                    Object.assign(allElements[module.groupName], module.elements)
                } else {
                    allElements[module.groupName] = module.elements;
                }
                // add content element to entry elements (if possible)
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
 * Initializes all elements.
 * @param {Object} allElements
 */
function initializePage(allElements) {
    let collector = {rElements: {}};
    
    Object.values(allElements).forEach((module) => Object.values(module).forEach((element) => {
        element.init(collector, allElements);
    }));
    
    return collector;
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
