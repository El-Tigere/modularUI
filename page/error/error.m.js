const {Element} = require('../../renderer');

exports.elements = {};
exports.groupName = 'error';

const errorMessages = {
    '400': 'Die Anfrage ist ungültig.',
    '404': 'Die von ihnen aufgerufene Seite wurde nicht gefunden.',
    '413': 'Die Anfrage ist zu groß',
    'inverr': 'Der von ihnen verursachte Fehler ist ungültig.'
}

exports.elements.content = new Element({}, (content, args, data) => `
<app:basePage>
    <main>
        <h1>Fehler ${data.url?.args?.errorCode || ':('}</h1>
        <p>${errorMessages[data.url?.args?.errorCode || 'inverr'] || errorMessages['inverr']}</p>
    </main>
</app:basePage>
`);