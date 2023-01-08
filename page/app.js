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

exports.mainbody = new Element(namespaces, (content, args) => `
<header>
    <logos:logo size=128></logos:logo>
    <span>abc</span>
</header>
<main>
    <logos:logo size=400></logos:logo>
    <logos:logo size=200></logos:logo>
    <logos:logo size=100></logos:logo>
    <logos:logo size=50></logos:logo>
    <logos:logo size=25></logos:logo>
    <p>def</p>
    <login:form></login:form>
    <login:info></login:info>
</main>
<footer>
    <p>xyz</p>
</footer>
`);
