const {Element} = require('../../renderer');

exports.form = new Element({}, (content, args) => `
<form action="/" method="post">
    <fieldset>
        <legend>login</legend>
        <table>
            <tr><td>username:</td><td><input id="username" type="text" name="username"></td></tr>
            <tr><td>password:</td><td><input id="password" type="password" name="password"></td></tr>
        </table>
        <input type="submit" value="submit">
    </fieldset>
</form>
`);

/* debug element */
exports.info = new Element({}, (content, args, data) => `
<p>username: ${(data.formData || {}).username || ''}</p>
<p>method: ${data.req.method}</p>
`);
