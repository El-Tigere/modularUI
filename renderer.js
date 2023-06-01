// TODO: add global imports that can be used in every element (for example app.js elements are needed in nearly every file)

/**
 * A class for custom html elements. These elements are replaced with the result of the getElement function of the element when the page is rendered.
 * getElement can also be used as a server script (for example a script that updates / parses session data before the rest of the page is loaded).
 */
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
     * @param {boolean} preRender
     * @param {GetElementCallback} getElement
     */
    constructor(namespaces, hasContent, preRender, getElement) {
        this.namespaces = namespaces;
        this.hasContent = hasContent;
        this.preRender = preRender;
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
        
        if(this.preRender) {
            this.preRenderedContent = this.getElement('', {}, {});
        }
    }
    
    /**
     * Renders the element.
     * @param {string} content the xml inbetween the opening and closing tag
     * @param {Object} args the xml attributes passed in the open tag
     * @param {Object} request the data from the http request (req: http request, formData: data from forms)
     * @returns {string}
     */
    render(content, args, requestData, allElements) {
        // first call the getElement function (or get the prerendered content)
        let part = this.preRender ? this.preRenderedContent : (this.getElement(content, args, requestData) || '');
        
        // then render the custom tags
        try {
            return this.renderCustomElements(part, requestData, allElements).trim();
        } catch (e) {
            console.error('An error has occured while rendering:');
            console.error(e);
        }
    }
    
    // renders the custom elements used in this element; there are probably much better ways of implementing this
    renderCustomElements(part, requestData, allElements) {
        if(!part) return part;
        
        // find first tag
        let tags = this.getKnownTags(part, allElements)
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
            let type = allElements[nameParts[0]][nameParts[1]];
            
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
            let result = type.render(content, args, requestData, allElements).trim();
            part = part.substring(0, start) + result + part.substring(end, part.length);
            
        });
        
        return part;
    }
    
    getKnownTags(part, allElements) {
        const tagRegex = /<[\w\d]+:[\w\d]+(?:\s+[\w\d]+(?:\s*=\s*(?:".*"|\d+))?)*>/g; // matches an open tag with arguments like <div class="h">
        
        let tags = part.match(tagRegex);
        if(tags == null) return null;
        
        // exclude unknown parts
        tags = tags.filter((e) => {
            let name = e.match(/[\w\d]+:[\w\d]+/)[0];
            let nameParts = name.split(':');
            return allElements[nameParts[0]] && allElements[nameParts[0]][nameParts[1]];
        });
        
        return tags.length > 0 ? tags : null;
    }
    
}
exports.Element = Element;

/**
 * RElements are Elements that can be individualy reloaded without reloading and rendering the entire page.
 */
class RElement extends Element {
    
    constructor(namespaces, id, hasContent, preRender, getElement) {
        super(namespaces, hasContent, preRender, getElement);
        this.id = id;
    }
    
    init(collector) {
        if(this.initialized) return;
        super.init(collector);
        
        collector.rElements[this.id] = this;
    }
    
}
exports.RElement = RElement;