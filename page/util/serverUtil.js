
function seperatedToCamelCase(str) {
    let parts = str.match(/[\w\d]+/g) || [];
    parts = parts.map((e) => e[0].toUpperCase() + e.substring(1).toLowerCase());
    return parts.join('');
}
exports.seperatedToCamelCase = seperatedToCamelCase;
