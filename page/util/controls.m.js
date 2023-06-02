const {Element} = require('../../renderer');

exports.elements = {};
exports.groupName = 'controls';

exports.elements.switch = new Element(false, false, (content, args) => `
<div class="switch" onclick="toggleButton(this${args.toggle ? ', ' + args.toggle : ''})">
    <span></span>
</div>
`);
