const {Element} = require('../../renderer');

const namespaces = {
    'app': require('../app')
};

exports.notFoundContent = new Element(namespaces, (content, args) => `
<app:basePage>
    <main>
        <h1>Fehler</h1>
        <p>Die von ihnen aufgerufene Seite wurde nicht gefunden.</p>
    </main>
</app:basePage>
`);