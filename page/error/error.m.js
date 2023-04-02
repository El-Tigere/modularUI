const {Element} = require('../../renderer');

const namespaces = {
    'app': require('../app.m')
};

const errorMessages = {
    '400': 'Die Anfrage ist ungültig.',
    '404': 'Die von ihnen aufgerufene Seite wurde nicht gefunden.',
    '413': 'Die Anfrage ist zu groß',
    'inverr': 'Der von ihnen verursachte Fehler ist ungültig.'
}

exports.content = new Element(namespaces, (content, args, data) => {console.log(data.url); return`
<app:basePage>
    <main>
        <h1>Fehler ${data.url?.args?.errorCode || ':('}</h1>
        <p>${errorMessages[data.url?.args?.errorCode || 'inverr'] || errorMessages['inverr']}</p>
    </main>
</app:basePage>
`});