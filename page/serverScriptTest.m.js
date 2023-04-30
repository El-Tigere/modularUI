const {Element} = require('../renderer');

const namespaces = {};

exports.test = new Element(namespaces, false, (content, args, data) => {
    
    console.log('test');
    console.log(`test arg: ${args['t']}`)
    
});
