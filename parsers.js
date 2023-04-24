
/**
 * Parses the path of a url int an array of strings.
 * @param {string} pathStr 
 * @returns {Array<string>}
 */
function parseUrlPath(pathStr) {
    let parts = pathStr.split('/');
    
    if(parts[0] == '') parts.splice(0, 1);
    if(parts[parts.length - 1] == '') parts.splice(parts.length - 1, parts.length);
    
    if(parts.length == 1 && parts[0] == '') return [];
    return parts;
}
exports.parseUrlPath = parseUrlPath;

/**
 * Parses the http cookie string into an object.
 * @param {string} cookieString 
 * @returns {Object}
 */
function parseCookies(cookieString) {
    let cookies = {};
    cookieString.split(';')?.forEach((e) => {
        let [key, ...value] = e.split('=');
        key = key.trim();
        value = decodeURIComponent(value?.join('=').trim());
        if(key) cookies[key] = value;
    });
    return cookies;
}
exports.parseCookies = parseCookies;

// TODO: this can probably break very easily
/**
 * Parses a string from a http post request into an object
 * @param {string} str 
 */
function parseHttpData(str) {
    let obj = {};
    
    // split input into individual property assignments
    const properties = str.split('&');
    properties.forEach((p) => {
        // split property into key and value
        let [key, val] = p.split('=');
        if(!(key && val)) return;
        key = decodeURIComponent(key);
        val = decodeURIComponent(val);
        
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
        if(current instanceof Array) {
            if(lastKey == '[]') {
                // add to array
                current.push(val);
            } else {
                // set at specific index
                let arrIndex = parseInt(lastKey);
                if(isNaN(arrIndex)) throw new Error('Invalid array index.');
                current[arrIndex] = val;
            }
        } else {
            current[lastKey] = val;
        }
    });
    
    return obj;
}
exports.parseHttpData = parseHttpData;

/**
 * Get the property of a nested object at the given path.
 * @param {Object} obj 
 * @param {Array<string>} path an array of keys of the nested object
 * @returns 
 */
function getAt(obj, path) {
    let current = obj;
    for(let i = 0; i < path.length; i++) {
        if(current[path[i]]) current = current[path[i]];
        else return null;
    }
    return current;
}
exports.getAt = getAt;

/**
 * Sets a property of a nested object at the given path to the given value (val).
 * @param {Object} obj 
 * @param {Array<string>} path an array of keys of the nested object
 * @param {*} val 
 */
function setAt(obj, path, val) {
    console.log(obj);
    console.log(path);
    console.log(val);
    let current = obj;
    for(let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
    }
    current[path[path.length - 1]] = val;
}
exports.setAt = setAt;
