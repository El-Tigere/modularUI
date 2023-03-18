const {Element} = require('../../renderer');

const namespaces = {
    'app': require('../app.m')
};

// TODO: create one main element and select error message from url parameter

exports.content = new Element(namespaces, (content, args) => `
<app:basePage>
    <main>
        <h1>Fehler</h1>
        <p>Die von ihnen aufgerufene Seite wurde nicht gefunden.</p>
    </main>
</app:basePage>
`);