const {Element} = require('../renderer');

const namespaces = {
    'app': require('./app'),
    'logos': require('./logos/logos'),
    'login': require('./login/login'),
    'test': require('./test/test'),
    'error': require('./error/error')
};

exports.main = new Element(namespaces, (content, args) => `
<!DOCTYPE html>
<html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Testseite</title>
        <link rel="stylesheet" href="/style/common.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
        <script src="/client.js"></script>
    </head>
    <body>
        <app:header></app:header>
        <center>
            <app:pagecontent></app:pagecontent>
        </center>
    </body>
</html>
`);

exports.pagecontent = new Element(namespaces, (content, args, data) => {
    if(!data.url[0]) return '<app:content></app:content>';
    if(data.url[0] == '404') return '<error:notFoundContent></error:notFoundContent>';
    if(data.url[0] == 'login') return '<login:content></login:content>';
    if(data.url[0] == 'test') return '<test:content></test:content>';
    return '';
});

exports.header = new Element(namespaces, (content, args, data) => `
<header>
    <aside><logos:logo size=64></logos:logo></aside>
    <h1><a href="/">Testseite</a></h1>
    <aside class="user-info">
        ${data.sessionData.login ? `<p>logged in as</p><p><b>${data.sessionData.login.username}</b></p>` : '<p>not logged in</p><p><a href="/login">login</a></p>'}
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
    <h2>Links</h2>
    <a href="/test">Tests</a>
</main>
`);
