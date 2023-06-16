const {Element} = require('../../../renderer');

exports.elements = {};
exports.groupName = 'register';

exports.elements.content = new Element({}, (content, args, data) => `
<app:basePage>
    <main>
        <h1>Create a new account</h1>
        <app:section>
            <register:form>
        </app:section>
    </main>
</app:basePage>
`);

exports.elements.form = new Element({preRender: true}, (content, args) => `
<form action="/" method="post">
    <fieldset>
        <legend>register</legend>
        <table>
            <tr><td>username:</td><td><input id="username" type="text" name="rUsername"></td></tr>
            <tr><td>password:</td><td><input id="password" type="password" name="rPassword"></td></tr>
            <tr><td>repeat password:</td><td><input id="password2" type="password" name="rPassword2"></td></tr>
        </table>
        <input type="submit" value="create account">
    </fieldset>
</form>
`);
