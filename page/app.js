const {Element} = require('../renderer');

const namespaces = {
    'app': require('./app'),
    'logos': require('./logos/logos'),
    'login': require('./login/login')
};

exports.main = new Element(namespaces, (content, args) => `
<!DOCTYPE html>
<html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Testseite</title>
        <link rel="stylesheet" href="style/common.css">
    </head>
    <body>
        <app:mainbody></app:mainbody>
    </body>
</html>
`);

exports.mainbody = new Element(namespaces, (content, args, data) => `
<app:header></app:header>
${(data.req.url || '/') == '/login' ? '<login:content></login:content>': '<app:content></app:content>'}
`);

exports.header = new Element(namespaces, (content, args, data) => `
<header>
    <aside><logos:logo size=64></logos:logo></aside>
    <h1><a href="/">Testseite</a></h1>
    <aside class="user-info">
        ${(data.formData && data.formData.username) ? `<p>logged in as</p><p><b>${data.formData.username}</b></p>` : '<p>not logged in</p><p><a href="login">login</a></p>'}
    </aside>
</header>
`);

exports.content = new Element(namespaces, (content, args) => `
<main>
    <h1>Testseite</h1>
    <p>Das ist eine Testseite.</p>
    <h2>Unterüberschrift</h2>
    <p>Damit die Seite interessanter ist, sind hier noch mehr Überschriften und Texte.</p>
    <h2>Mehr Text</h2>
    <p>
        Hier ist<br>
        ein<br>
        Beispieltext
    </p>
    <p>lorem ipsum oder so</p>
</main>
`);
