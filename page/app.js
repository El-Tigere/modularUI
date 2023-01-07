const {Element} = require('../renderer');

const namespaces = {
    'app': require('./app'),
    'logos': require('./logos/logos')
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
    <app:form></app:form>
    <app:info></app:info>
</main>
<footer>
    <p>xyz</p>
</footer>
`);

exports.form = new Element(namespaces, (content, args) => `
<form action="/" method="post">
    <fieldset>
        <legend>login</legend>
        <label for="username">username: </label>
        <input id="username" type="text" name="username"><br>
        <label for="password">password: </label>
        <input id="password" type="password" name="password"><br>
        <input type="submit" value="submit">
    </fieldset>
</form>
`);

exports.info = new Element(namespaces, (content, args, data) => `
<p>username: ${data.username || ''}</p>
`);
