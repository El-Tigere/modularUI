// TODO: add a custom url class
// TODO: add url parameters
function parseUrl(url) {
    let parts = url.split('/');
    parts.splice(0, 1);
    return parts;
}
exports.parseUrl = parseUrl;

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
exports.parsePostData = parsePostData;
