const {Element} = require('../renderer');

const util = require('./util/serverUtil.m');

exports.elements = {};
exports.groupName = 'app';

// args.scripts = '/script.js;/abc/xyz.js'
exports.elements.basePage = new Element({hasContent: true}, (content, args) => `
<app:sessionManager>
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
        ${args.scripts ? args.scripts.split(';') .map((e) => `<script src="${e}"></script>`).join('\r\n') : ''}
    </head>
    <body>
        <app:header title="Testseite">
        <div class="center">
            ${content}
        </div>
    </body>
</html>
`);

exports.elements.header = new Element({}, (content, args, data) => `
<header>
    <aside><logos:logo size=64></aside>
    <h1><a href="/">${args.title}</a></h1>
    <aside class="user-info">
        ${data.sessionData.login ? '<login:loggedin a>' : '<p>not logged in</p><p><a href="/profile/login">login</a></p>'}
    </aside>
</header>
`);

exports.elements.content = new Element({}, (content, args) => `
<app:basePage>
    <main>
        <h1>Testseite</h1>
        <app:section name="Unterüberschrift">
            <p>
                Das ist eine Testseite. Damit die Seite interessanter ist, sind hier noch mehr Überschriften und Texte. An diesen Texten kann man sehen, wie andere Texte
                auf dieser Seite aussehen würden, ohne diese Texte hier hin zu kopieren. Das liegt daran, dass die meisten Texte äußerlich fast gleich aussehen und der
                einzige Unterschied, der direkt auffällt, die Länge des Textes ist. Der Inhalt des Textes beeinflusst nicht das aussehen des Textes, welches auf dieser Seite
                mit diesem Text getestet werden kann.
            </p>
        </app:section>
        <app:section name="Mehr Text">
            <p>
                Hier ist<br>
                ein<br>
                Beispieltext
            </p>
            <p>lorem ipsum oder so</p>
        </app:section>
        <app:section name="Links">
            <p>Tests: <a href="/test">Tests</a></p>
            <p>Seite mit viel Inhalt: <a href="/test2">viel Inhalt</a></p>
        </app:section>
    </main>
</app:basePage>
`);

exports.elements.section = new Element({hasContent: true}, (content, args) => {
    let name = args?.name?.trim();
    if(!name) {
        return `<section>${content}</section>`;
    }
    
    // convert to camel case
    let id = util.seperatedToCamelCase(name);
    if(id) {
        return `<section id="${id}"><h2>${name}</h2>${content}</section>`;
    } else {
        return `<section><h2>${name}</h2>${content}</section>`;
    }
});
