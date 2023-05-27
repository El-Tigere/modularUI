const {Element} = require('../../renderer');

exports.logo = new Element({}, false, false, (content, args) => {
    const s = args.size ? (args.size <= 64 ? 64 : args.size <= 128 ? 128 : 256) : 128;
    return `<img src="/resources/text_logo_${s}.png" width=${args.size || 128} alt="logo">`;
});