// TODO: add global imports that can be used in every element (for example app.js elements are needed in nearly every file)

class Element {
    
    /**
     * @callback GetElementCallback
     * @param {string} content
     * @param {Object} args
     * @returns {string}
     */
    
    /**
     * constructor
     * @param {Object.<string, Object>} namespaces an Object with this format: {'xmlNamespace': require('according import')}
     * @param {boolean} hasContent elements with no content are compact elements like the <img> element
     * @param {GetElementCallback} getElement
     */
    constructor(namespaces, hasContent, getElement) {
        this.namespaces = namespaces;
        this.hasContent = hasContent;
        this.getElement = getElement;
        this.initialized = false;
    }
    
    /**
     * Initializes this Element and every other element relatet through namespaces recursively.
     * @param {Object} collector an object that can be modified by every Element during initialization
     */
    init(collector) {
        if(this.initialized) return;
        this.initialized = true;
        
        Object.values(this.namespaces).forEach((e) => Object.values(e).forEach((se) => {
            if(se instanceof Element) se.init(collector);
        }));
    }
    
    /**
     * Renders the element.
     * @param {string} content the xml inbetween the opening and closing tag
     * @param {Object} args the xml attributes passed in the open tag
     * @param {Object} request the data from the http request (req: http request, formData: data from forms)
     * @returns {string}
     */
    render(content, args, requestData) {
        // first call the getElement function
        let part = this.getElement(content, args, requestData) || '';
        
        // then render the custom tags
        return this.renderCustomElements(part, requestData).trim();
    }
    
    // renders the custom elements used in this element; there are probably much better ways of implementing this
    renderCustomElements(part, requestData) {
        if(!part) return part;
        
        // find first tag
        let tags = this.getKnownParts(part)
        if(!tags) return part;
        
        tags.forEach((tag) => {
            
            // get tag information
            let start = part.indexOf(tag);
            if(start == -1) return;
            let name = tag.match(/[\w\d]+:[\w\d]+/)[0];
            let open = `<${name}`; // > is missing because open tags can have arguments but always start with <name
            let close = `</${name}>`;
            
            // get element type
            let nameParts = name.split(':');
            let type = this.namespaces[nameParts[0]][nameParts[1]];
            
            // find closing tag
            let content, end;
            if(type.hasContent) {
                let counter = 1;
                let i;
                for(i = start + tag.length; i < part.length; i++) {
                    if(part.substring(i).startsWith(open)) counter++;
                    if(part.substring(i).startsWith(close)) counter--;
                    if(counter == 0) break;
                }
                content = part.substring(start + tag.length, i);
                end = i + close.length;
            } else {
                content = '';
                end = start + tag.length;
            }
            
            // find arguments
            let args = {};
            (tag.substring(1 + name.length).match(/[\w\d]+(?:\s*=\s*(?:".*"|\d+))?/g) || []).forEach((e) => {
                let eqPos = e.indexOf('=')
                let parts = [e.substring(0, eqPos), e.substring(eqPos + 1)];
                if(parts[1]) {
                    args[parts[0]] = parts[1].startsWith('"') ? parts[1].substring(1, parts[1].length - 1) : + parts[1];
                } else {
                    args[parts[0]] = 1;
                }
            });
            
            // insert the resulting elements
            let result = type.render(content, args, requestData).trim();
            part = part.substring(0, start) + result + part.substring(end, part.length);
            
        });
        
        return part;
    }
    
    getKnownParts(part) {
        const tagRegex = /<[\w\d]+:[\w\d]+(?:\s+[\w\d]+(?:\s*=\s*(?:".*"|\d+))?)*>/g; // matches an open tag with arguments like <div class="h">
        
        let tags = part.match(tagRegex);
        if(tags == null) return null;
        
        // exclude unknown parts
        tags = tags.filter((e) => {
            let name = e.match(/[\w\d]+:[\w\d]+/)[0];
            let nameParts = name.split(':');
            return this.namespaces[nameParts[0]] && this.namespaces[nameParts[0]][nameParts[1]];
        });
        
        return tags.length > 0 ? tags : null;
    }
    
}
exports.Element = Element;

/**
 * RElements are Elements that can be individualy reloaded without reloading and rendering the entire page.
 */
class RElement extends Element {
    
    constructor(namespaces, id, hasContent, getElement) {
        super(namespaces, hasContent, getElement);
        this.id = id;
    }
    
    init(collector) {
        if(this.initialized) return;
        
        collector.rElements[this.id] = this;
        
        super.init(collector);
    }
    
}
exports.RElement = RElement;