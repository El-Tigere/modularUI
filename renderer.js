class Element {
    
    // namespaces: {'xmlNamespace': require('according import')}; getElement: (content, args) => `<html>`
    constructor(namespaces, getElement) {
        this.namespaces = namespaces;
        this.getElement = getElement;
    }
    
    /**
     * renders the element
     * @param {*} content the xml inbetween the opening and closing tag
     * @param {*} args the xml attributes passed in the open tag
     * @param {*} requestData the data from the http request (like form data)
     * @returns 
     */
    render(content, args, requestData) {
        // first call the getElement function
        let part = this.getElement(content, args, requestData);
        
        // then render the custom tags
        return this.renderCustomElements(part, requestData);
    }
    
    // renders the custom elements used in this element; there are probably much better ways of implementing this
    renderCustomElements(part, requestData) {
        const tagRegex = /<[\w\d]+:[\w\d]+(?:\s+[\w\d]+(?:\s*=\s*(?:".*"|\d+))?)*>/g; // matches an open tag with arguments like <div class="h">
        
        // find first tag
        let tags = part.match(tagRegex);
        while(tags && tags[0]) {
            
            // get last open tag (can not contain another custom tag)
            let tag = tags[tags.length - 1];
            
            // get tag information
            let start = part.indexOf(tag);
            let name = tag.match(/[\w\d]+:[\w\d]+/)[0];
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
            let content = part.substring(start + tag.length, end);
            
            // find arguments
            let args = {};
            (tag.substring(1 + name.length).match(/[\w\d]+(?:\s*=\s*(?:".*"|\d+))?/g) || []).forEach((e) => {
                let parts = e.split('=');
                if(parts[1]) {
                    args[parts[0]] = parts[1].startsWith('"') ? parts[1].substring(1, parts[1].length - 1) : + parts[1];
                } else {
                    args[parts[0]] = 1;
                }
            });
            
            // insert the resulting elements
            let nameParts = name.split(':');
            let result = this.namespaces[nameParts[0]][nameParts[1]].render(content, args, requestData).trim();
            part = part.substring(0, start) + result + part.substring(end + close.length, part.length);
            
            // find next tag
            tags = part.match(tagRegex);
            
        }
        
        return part;
    }
    
}
exports.Element = Element;