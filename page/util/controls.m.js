const {Element} = require('../../renderer');

exports.elements = {};

const namespaces = {};

exports.elements.switch = new Element(namespaces, false, false, (content, args) => `
<div class="switch" onclick="toggleButton(this${args.toggle ? ', ' + args.toggle : ''})">
    <span></span>
</div>
`);
