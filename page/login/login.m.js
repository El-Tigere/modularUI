const {Element} = require('../../renderer');

exports.elements = {};

const namespaces = {
    'login': require('./login.m'),
    'app': require('../app.m')
}

exports.elements.form = new Element(namespaces, false, true, (content, args) => `
<form action="/" method="post">
    <fieldset>
        <legend>login</legend>
        <table>
            <tr><td>username:</td><td><input id="username" type="text" name="username"></td></tr>
            <tr><td>password:</td><td><input id="password" type="password" name="password"></td></tr>
        </table>
        <input type="submit" value="login">
    </fieldset>
</form>
`);

exports.elements.content = new Element(namespaces, false, true, (content, args) => `
<app:basePage>
    <main>
        <h1>Login</h1>
        <app:section>
            <login:form>
        </app:section>
    </main>
</app:basePage>
`);
