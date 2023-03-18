const fs = require('fs');

function get(entryElements, urlParts) {
    let current = entryElements;
    urlParts.forEach((e) => {
        if(e) current = current[e] || {};
    });
    return current.index;
}
exports.get = get;

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
        // TODO: make a function for this in parsers.js (also for parsePostData)
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

// TODO: remove this testfunction
traverseDirectory('page', [], (filePath) => {
    if(!fs.statSync('page/' + filePath.join('/')).isFile()) return;
    
    if(filePath[filePath.length - 1].endsWith('.m.js')) console.log(filePath);
});

//console.log(getEntries('page'));

//console.log(get(getEntries('page')['error'], []));
//console.log(get(getEntries('page'), []));