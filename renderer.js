// there are probably much better ways of implementing this
function renderOne(part, tag, elements) {
    let start = part.indexOf(tag[0]);
    let name = tag[0].match(/[\w\d]+:[\w\d]+/)[0];
    let open = `<${name}`; // > is missing because open tags can have arguments but always start with <name
    let close = `</${name}>`;
    let counter = 0;
    
    // find closing tag
    let i;
    for(i = start + tag.length; i < part.length; i++) {
        if(part.substring(i).startsWith(open)) {
            counter++;
        }
        if(part.substring(i).startsWith(close)) {
            if(counter == 0) break;
            else counter--;
        }
    }
    let end = i;
    let content = part.substring(start + tag[0].length, end);
    
    // find arguments
    let args = {};
    (tag[0].substring(1 + name.length).match(/[\w\d]+(?:\s*=\s*(?:".*"|\d+))?/g) || []).forEach((e) => {
        let parts = e.split('=');
        if(parts[1]) {
            args[parts[0]] = parts[1].startsWith('"') ? parts[1].substring(1, parts[1].length - 1) : + parts[1];
        } else {
            args[parts[0]] = 1;
        }
    });
    
    // insert the resulting elements
    let nameParts = name.split(':');
    let result = elements[nameParts[0]][nameParts[1]](content, args).trim();
    return part.substring(0, start) + result + part.substring(end + close.length, part.length);
}

function render(part, elements) {
    let tagRegex = /<[\w\d]+:[\w\d]+(?:\s+[\w\d]+(?:\s*=\s*(?:".*"|\d+))?)*>/; // matches an open tag with arguments like <div class="h">
    
    // find first tag
    let tag = part.match(tagRegex);
    while(tag && tag[0]) {
        // render tag
        part = renderOne(part, tag, elements);
        
        // find next tag
        tag = part.match(tagRegex);
    }
    
    return part;
}

exports.render = render;