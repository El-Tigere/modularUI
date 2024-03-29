const {Element, RElement} = require('../../renderer');
const sessionManager = require('../sessionManager.m');

exports.elements = {};
exports.groupName = 'test';

exports.elements.randomNumber = new Element({}, (content, args) => parseInt(Math.random() * 100).toString());

exports.elements.randomElement = new RElement('randomElement', {}, (content, args) => `
Hier ist eine zufällige Zahl: <test:randomNumber>
<button onClick="update('randomElement', {});">update</button>
`);

exports.elements.content = new Element({}, (content, args, data) => `
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
        <app:section name="MathMl">
            <p>
                x
            </p>    
            <math>
                <mrow>
                    <mi>x</mi><mo>=</mo><mn>41</mn><mo>+</mo><mfrac><mrow><mn>42</mn></mrow><mrow><mn>42</mn></mrow></mfrac>
                </mrow>
            </math>
        </app:section>
    </main>
</app:basePage>
`);

exports.elements.colorSquare = new RElement('colorSquare', {}, (content, args, data) => {
    
    sessionManager.updatePageState(data);
    
    let colors = data.sessionData.pageState.testColors;
    if(colors && colors.length == 3) {
        let hex = '';
        colors.forEach((e) => {
            hex += e ? 'F' : '0';
        });
        return `<div id="color-square" style="width: 1em; height: 1em; background-color: #${hex};"></div>`;
    }
    return '<div id="color-square" style="width: 1em; height: 1em;"></div>';
    
});