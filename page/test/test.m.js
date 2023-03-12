const {Element, RElement} = require('../../renderer');

const namespaces = {
    'test': require('./test.m'),
    'app': require('../app.m'),
    'controls': require('../util/controls.m')
}

exports.randomNumber = new Element(namespaces, (content, args) => parseInt(Math.random() * 100).toString());

exports.randomElement = new RElement(namespaces, 'randomElement', (content, args) => `
Hier ist eine zufällige Zahl: <test:randomNumber>
<button onClick="update('randomElement', {});">update</button>
`);

// TODO: fix margin stacking of switches (switch margin is distance from header margin and not from header itself for some reason)
exports.content = new Element(namespaces, (content, args, data) => `
<app:basePage scripts="/test/clientTest.js;/test/clientTest.js">
    <main>
        <h1>Tests</h1>
        <app:section name="Zufall">
            <p id="randomElement">
                <test:randomElement>
            </p>
        </app:section>
        <app:section name="sessionData">
            <table>
                <tr>
                    ${Object.keys(data.sessionData.pageState || {}).map((e) => `<td>${e}</td>`).join('')}
                </tr>
                <tr>
                    ${Object.values(data.sessionData.pageState || {}).map((e) => `<td>${e}</td>`).join('')}
                </tr>
            </table>
            <button onClick="testSessionData()">send some sessionData</button>
        </app:section>
        <app:section name="Schriftgröße">
            <p>Ein bisschen normaler Text.</p>
            <div class="test-square"></div>
        </app:section>
        <app:section name="Schalter">
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
                    <td><button onClick="update('colorSquare', {testColors: colors});">speichern</button></td>
                    <td></td>
                </tr>
                <tr>
                    <td>Ergebnis: </td>
                    <td id="colorSquare"><test:colorSquare></td>
                </tr>
            </table>
        </app:section>
    </main>
</app:basePage>
`);

// FIXME: unreadable code
exports.colorSquare = new RElement(namespaces, 'colorSquare', (content, args, data) => {
    let ps = data.sessionData.pageState;
    if(ps.testColors && ps.testColors[2]) {
        let colors = data.sessionData.pageState.testColors;
        let hex = ((colors[0] == 'true') ? 'F' : '0') + ((colors[1] == 'true') ? 'F' : '0') + ((colors[2] == 'true') ? 'F' : '0');
        return `<div id="color-square" style="width: 1em; height: 1em; background-color: #${hex};"></div>`;
    }
    return '<div id="color-square" style="width: 1em; height: 1em;"></div>';
});