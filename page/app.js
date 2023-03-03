const {Element} = require('../renderer');

const namespaces = {
    'app': require('./app'),
    'logos': require('./util/logos'),
    'login': require('./login/login'),
    'test': require('./test/test'),
    'error': require('./util/error')
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
        <app:header title="Testseite">
        <div class="center">
            <app:pagecontent>
        </div>
    </body>
</html>
`);

exports.pagecontent = new Element(namespaces, (content, args, data) => {
    if(!data.url[0]) return '<app:content>';
    if(data.url[0] == 'login') return '<login:content>';
    if(data.url[0] == 'test') return '<test:content>';
    if(data.url[0] == '404') return '<error:notFoundContent>';
    
    data.resCode = 404;
    return '<error:notFoundContent>';
});

exports.header = new Element(namespaces, (content, args, data) => `
<header>
    <aside><logos:logo size=64></aside>
    <h1><a href="/">${args.title}</a></h1>
    <aside class="user-info">
        ${data.sessionData.login ? `<p>logged in as</p><p><b>${data.sessionData.login.username}</b></p>` : '<p>not logged in</p><p><a href="/login">login</a></p>'}
    </aside>
</header>
`);

exports.content = new Element(namespaces, (content, args) => `
<main>
    <h1>Testseite</h1>
    <section id="unterueberschrift">
        <h2>Unterüberschrift</h2>
        <p>
            Das ist eine Testseite. Damit die Seite interessanter ist, sind hier noch mehr Überschriften und Texte. An diesen Texten kann man sehen, wie andere Texte
            auf dieser Seite aussehen würden, ohne diese Texte hier hin zu kopieren. Das liegt daran, dass die meisten Texte äußerlich fast gleich aussehen und der
            einzige Unterschied, der direkt auffällt, die Länge des Textes ist. Der Inhalt des Textes beeinflusst nicht das aussehen des Textes, welches auf dieser Seite
            mit diesem Text getestet werden kann.
        </p>
    </section>
    <section id="mehrText">
        <h2>Mehr Text</h2>
        <p>
            Hier ist<br>
            ein<br>
            Beispieltext
        </p>
        <p>lorem ipsum oder so</p>
    </section>
    <section id="links">
        <h2>Links</h2>
        <p>Tests: <a href="/test">Tests</a></p>
    </section>
</main>
`);
