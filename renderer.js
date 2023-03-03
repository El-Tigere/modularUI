// TODO: reverse order of element rendering to allow for server side script elements that get executed in the correct order

class Element {
    
    /**
     * @callback getElementCallback
     * @param {string} content
     * @param {Object} args
     * @returns {string}
     */
    
    /**
     * constructor
     * @param {Object.<string, Object>} namespaces an Object with this format: {'xmlNamespace': require('according import')}
     * @param {getElementCallback} getElement
     */
    constructor(namespaces, getElement) {
        this.namespaces = namespaces;
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
        let part = this.getElement(content, args, requestData);
        
        // then render the custom tags
        return this.renderCustomElements(part, requestData).trim();
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
            
            // find closing tag
            let counter = 1;
            let i;
            for(i = start + tag.length; i < part.length; i++) {
                if(part.substring(i).startsWith(open)) counter++;
                if(part.substring(i).startsWith(close)) counter--;
                if(counter == 0) break;
            }
            
            // TODO: ensure that an element is either used as a compact element or not
            let compactElement = counter > 0; // compactElement: element with only an open tag
            let content = compactElement ? '' : part.substring(start + tag.length, i);
            let end = compactElement ? start + tag.length : i + close.length; 
            
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
            let nameParts = name.split(':');
            let result = this.namespaces[nameParts[0]][nameParts[1]].render(content, args, requestData).trim();
            part = part.substring(0, start) + result + part.substring(end, part.length);
            
            // find next tag
            tags = part.match(tagRegex);
            
        }
        
        return part.trim();
    }
    
}
exports.Element = Element;

// refreshable / reloadable element
class RElement extends Element {
    
    constructor(namespaces, id, getElement) {
        super(namespaces, getElement);
        this.id = id;
    }
    
    init(collector) {
        if(this.initialized) return;
        
        collector.rElements[this.id] = this;
        
        super.init(collector);
    }
    
}
exports.RElement = RElement;