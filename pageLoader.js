const fs = require('fs');

/**
 * Gets the entry points from the specified page
 * @param {string} pageRoot
 */
function getEntries(pageRoot) {
    
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
