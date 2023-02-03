const {Element} = require('../../renderer');

const namespaces = {
    'random': require('./random')
}

exports.randomNumber = new Element(namespaces, (content, args) => parseInt(Math.random() * 100).toString());

exports.randomElement = new Element(namespaces, (content, args) => `
<p id="randomElement">
    Hier ist eine zufällige Zahl: <random:randomNumber></random:randomNumber>
</p>
`);

exports.content = new Element(namespaces, (content, args) => `
<main>
    <h1>Zufall</h1>
    <random:randomElement></random:randomElement>
</main>
`);