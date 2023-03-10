const {Element} = require('../../renderer');

const namespaces = {
    'login': require('./login.m'),
    'app': require('../app.m')
}

exports.form = new Element(namespaces, (content, args) => `
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

exports.content = new Element(namespaces, (content, args) => `
<app:basePage>
    <main>
        <h1>Login</h1>
        <app:section>
            <login:form>
        </app:section>
    </main>
</app:basePage>
`);


/* debug element */
exports.info = new Element(namespaces, (content, args, data) => `
<p>username: ${(data.formData || {}).username || ''}</p>
<p>method: ${data.req.method}</p>
`);
