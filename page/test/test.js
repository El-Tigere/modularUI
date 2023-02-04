const {Element} = require('../../renderer');

const namespaces = {
    'test': require('./test')
}

exports.randomNumber = new Element(namespaces, (content, args) => parseInt(Math.random() * 100).toString());

exports.randomElement = new Element(namespaces, (content, args) => `
<p id="randomElement">
    Hier ist eine zufällige Zahl: <test:randomNumber></test:randomNumber>
</p>
`);

exports.content = new Element(namespaces, (content, args, data) => `
<main>
    <h1>Tests<h1>
    <h2>Zufall</h2>
    <test:randomElement></test:randomElement>
    <h2>sessionData</h2>
    <table>
        <tr>
            ${Object.keys(data.sessionData || {}).map((e) => `<td>${e}</td>`)}
        </tr>
        <tr>
            ${Object.values(data.sessionData || {}).map((e) => `<td>${e}</td>`)}
        </tr>
    </table>
    <button onClick="testSessionData()">send some sessionData</button>
    <h2>Schriftgröße</h2>
    <p>Ein bisschen normaler Text.</p>
    <div class="test-square"></div>
</main>
`);