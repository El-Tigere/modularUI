
function seperatedToCamelCase(str) {
    let parts = str.match(/[\w\d]+/g) || [];
    parts = parts.map((e) => e[0].toUpperCase() + e.substring(1).toLowerCase());
    let camel = parts.join('');
    if(camel) camel = camel[0].toLowerCase() + camel.substring(1);
    return camel;
}
exports.seperatedToCamelCase = seperatedToCamelCase;
