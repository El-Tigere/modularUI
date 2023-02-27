const {Element, RElement} = require('../../renderer');

const namespaces = {
    'test': require('./test'),
    'controls': require('../controls')
}

exports.randomNumber = new Element(namespaces, (content, args) => parseInt(Math.random() * 100).toString());

exports.randomElement = new RElement(namespaces, 'randomElement', (content, args) => `
Hier ist eine zufällige Zahl: <test:randomNumber></test:randomNumber>
<button onClick="update('randomElement', {});">update</button>
`);

// TODO: fix margin stacking of switches (switch margin is distance from header margin and not from header itself for some reason)
exports.content = new Element(namespaces, (content, args, data) => `
<main>
    <h1>Tests</h1>
    <section id="zufall">
        <h2>Zufall</h2>
        <p id="randomElement">
            <test:randomElement></test:randomElement>
        </p>
    </section>
    <section id="sessionData">
        <h2>sessionData</h2>
        <table>
            <tr>
                ${Object.keys(data.sessionData.pageState || {}).map((e) => `<td>${e}</td>`).join('')}
            </tr>
            <tr>
                ${Object.values(data.sessionData.pageState || {}).map((e) => `<td>${e}</td>`).join('')}
            </tr>
        </table>
        <button onClick="testSessionData()">send some sessionData</button>
    </section>
    <section id="schriftgroesse">
        <h2>Schriftgröße</h2>
        <p>Ein bisschen normaler Text.</p>
        <div class="test-square"></div>
    </section>
    <section id="schalter">
        <h2>Schalter</h2>
        <controls:switch></controls:switch><controls:switch></controls:switch><controls:switch></controls:switch>
    </section>
</main>
<script src="/test/clientTest.js"></script>
`);