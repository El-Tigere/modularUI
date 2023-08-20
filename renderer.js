/**
 * A class for custom html elements. These elements are replaced with the result of the getElement function of the element when the page is rendered.
 * getElement can also be used as a server script (for example a script that updates / parses session data before the rest of the page is loaded).
 */
class Element {
    
    /**
     * @callback GetElementCallback
     * @param {string} content
     * @param {Object} args
     * @param {Object} data
     * @returns {string}
     */
    
    /**
     * constructor
     * @param {boolean} hasContent elements with no content are compact elements like the <img> element
     * @param {boolean} preRender
     * @param {GetElementCallback} getElement
     */
    constructor(options, getElement) {
        if(options) {
            this.hasContent = options.hasContent || false;
            this.preRender = options.preRender || false;
            this.isAsync = options.isAsync || false;
        }
        
        this.getElement = getElement;
        this.initialized = false;
    }
    
    /**
     * Initializes the Element.
     * @param {Object} collector an object that can be modified by every Element during initialization
     */
    init(collector) {
        if(this.initialized) return;
        this.initialized = true;
        
        if(this.preRender) {
            // TODO: change prerendering to actual prerendering
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
    async render(content, args, requestData, allElements) {
        // first call the getElement function (or get the prerendered content)
        let part;
        if(this.preRender) {
            part = this.preRenderedContent;
        } else {
            if(this.isAsync) {
                part = (await this.getElement(content, args, requestData)) || '';
            } else {
                part = this.getElement(content, args, requestData) || '';
            }
        }
        
        // then render the custom tags
        try {
            return (await this.renderCustomElements(part, requestData, allElements)).trim();
        } catch (e) {
            console.error('An error has occured while rendering:');
            console.error(e);
        }
    }
    
    // renders the custom elements used in this element; there are probably much better ways of implementing this
    async renderCustomElements(part, requestData, allElements) {        
        if(!part) return part;
        
        // find first tag
        let tags = this.getKnownTags(part, allElements)
        if(!tags) return part;
        
        for(let i = 0; i < tags.length; i++) {
            let tag = tags[i];
            
            // get tag information
            let start = part.indexOf(tag);
            if(start == -1) continue;
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
                let eqPos = e.indexOf('=');
                if(eqPos > -1) {
                    // arguments with '=' and a value
                    let argK = e.substring(0, eqPos);
                    let argV = e.substring(eqPos + 1);
                    args[argK] = argV.startsWith('"') ? argV.substring(1, argV.length - 1) : + argV;
                } else {
                    // flags without a value
                    args[e] = 1;
                }
            });
            
            // insert the resulting elements
            let asdfd = await type.render(content, args, requestData, allElements);
            let result = asdfd.trim();
            part = part.substring(0, start) + result + part.substring(end, part.length);
            
        }
        
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
    
    constructor(id, options, getElement) {
        super(options, getElement);
        this.id = id;
    }
    
    init(collector) {
        if(this.initialized) return;
        super.init(collector);
        
        collector.rElements[this.id] = this;
    }
    
}
exports.RElement = RElement;