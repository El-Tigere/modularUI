const fs = require('fs');

/**
 * Gets the entry points from the specified page.
 * @param {string} pageRoot
 */
function getEntries(pageRoot) {
    const page = {};
    
    traverseDirectory([pageRoot], (path) => {
        if(!fs.statSync(path.join('/')).isFile()) return;
        if(!path[path.length - 1].endsWith('.m.js')) return;
        
        // TODO: This is horrible. I need to change this.
        const mod = require(('./' + path.join('/')).replace('.js', ''));
        
        if(!mod.content) return;
        // TODO: make a function for this in parsers.js (also for parsePostData)
        // insert object
        let current = page;
        path.forEach((e) => {
            if(current[e]) {
                current = current[e];
            } else {
                current = current[e] = {};
            }
        });
        current.content = mod.content;
    });
    
    return page;
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
function traverseDirectory(path, fileCallback) {
    const pathStr = path.join('/');
    
    if(!fs.existsSync(pathStr)) return;
    
    fileCallback(path);
    if(!fs.statSync(pathStr).isDirectory()) return;
    
    const subpaths = fs.readdirSync(pathStr);
    subpaths.forEach((e) => traverseDirectory([...path, e], fileCallback));
}

// TODO: remove this testfunction
traverseDirectory(['page'], (filePath) => {
    if(!fs.statSync(filePath.join('/')).isFile()) return;
    
    if(filePath[filePath.length - 1].endsWith('.m.js')) console.log(filePath);
});

console.log(getEntries('page'));