const {Element, RElement} = require('../../renderer');

const namespaces = {
    'test': require('./test')
}

exports.randomNumber = new Element(namespaces, (content, args) => parseInt(Math.random() * 100).toString());

exports.randomElement = new RElement(namespaces, 'randomElement', (content, args) => `
Hier ist eine zufällige Zahl: <test:randomNumber></test:randomNumber>
<button onClick="update('randomElement', {});">update</button>
`);

exports.content = new Element(namespaces, (content, args, data) => `
<main>
    <h1>Tests<h1>
    <h2>Zufall</h2>
    <p id="randomElement">
        <test:randomElement></test:randomElement>
    </p>
    <h2>sessionData</h2>
    <table>
        <tr>
            ${Object.keys(data.sessionData.pageState || {}).map((e) => `<td>${e}</td>`)}
        </tr>
        <tr>
            ${Object.values(data.sessionData.pageState || {}).map((e) => `<td>${e}</td>`)}
        </tr>
    </table>
    <button onClick="testSessionData()">send some sessionData</button>
    <h2>Schriftgröße</h2>
    <p>Ein bisschen normaler Text.</p>
    <div class="test-square"></div>
</main>
`);