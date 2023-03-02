const {Element} = require('./../../renderer');

exports.logo = new Element({}, (content, args) => `
<img src="/resources/text_logo_${args.size ? (args.size <= 64 ? 64 : args.size <= 128 ? 128 : 256) : 128}.png" width=${args.size} alt="logo">
`);