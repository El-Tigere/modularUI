const {Element} = require('../../renderer');

const namespaces = {};

exports.switch = new Element(namespaces, (content, args) => `
<div class="switch" onclick="toggleButton(this${args.toggle ? ', ' + args.toggle : ''})">
    <span></span>
</div>
`);
