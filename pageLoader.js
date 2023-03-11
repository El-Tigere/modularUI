const fs = require('fs');

/**
 * @callback FileCallback
 * @param {string} filePath
 */

/**
 * Traverses every File and Directory in the given path.
 * @param {string} path 
 * @param {FileCallback} fileCallback 
 * @returns 
 */
function traverseDirectory(path, fileCallback) {
    if(!fs.existsSync(path)) return;
    
    fileCallback(path);
    if(!fs.statSync(path).isDirectory()) return;
    
    const subpaths = fs.readdirSync(path);
    subpaths.forEach((e) => traverseDirectory(path + '/' + e, fileCallback));
}

// TODO: remove this testfunction
traverseDirectory('page', (filePath) => {
    if(!fs.statSync(filePath).isFile) return;
    
    if(filePath.endsWith('.js')) console.log(filePath);
});
