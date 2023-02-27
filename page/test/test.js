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
        <test:schalter></test:schalter>
    </section>
</main>
<script src="/test/clientTest.js"></script>
`);

exports.schalter = new RElement(namespaces, 'schalter', (content, args) => `
<h2>Schalter</h2>
<table>
    <tr>
        <td>Rot: </td>
        <td><controls:switch toggle="(s)=>colors[0]=s"></controls:switch></td>
    </tr>
    <tr>
        <td>Grün: </td>
        <td><controls:switch toggle="(s)=>colors[1]=s"></controls:switch></td>
    </tr>
    <tr>
        <td>Blau: </td>
        <td><controls:switch toggle="(s)=>colors[2]=s"></controls:switch></td>
    </tr>
    <tr>
        <td><button onClick="update('schalter', {testColors: colors}); colors = [false, false, false];">speichern</button></td>
        <td></td>
    </tr>
    <tr>
        <td>Ergebnis: </td>
        <test:colorSquare></test:colorSquare>
    </tr>
</table>
`);

// FIXME: unreadable code
exports.colorSquare = new Element(namespaces, (content, args, data) => {
    let ps = data.sessionData.pageState;
    if(ps.testColors && ps.testColors[2]) {
        let colors = data.sessionData.pageState.testColors;
        let hex = ((colors[0] == 'true') ? 'F' : '0') + ((colors[1] == 'true') ? 'F' : '0') + ((colors[2] == 'true') ? 'F' : '0');
        return `<td><div id="color-square" style="width: 1em; height: 1em; background-color: #${hex};"></div></td>`;
    }
    return '<td><div id="color-square" style="width: 1em; height: 1em;"></div></td>';
});