const {Element} = require('../../renderer');

const namespaces = {
};

exports.notFoundContent = new Element(namespaces, (content, args) => `
<main>
    <h1>Fehler</h1>
    <p>Die von ihnen aufgerufene Seite wurde nicht gefunden.</p>
</main>
`);