const {Element} = require('../../../renderer');

const database = require('../../util/database.m');

exports.elements = {};
exports.groupName = 'login';

exports.elements.content = new Element({isAsync: true}, async (content, args, data) => {
    let loginSuccess = false;
    let pd = data.postData;
    if(pd && pd.username && pd.password && !data.sessionData.login)  {
        // try login
        let id = await database.login(pd.username, pd.password);
        loginSuccess = id > -1;
        if(loginSuccess) data.sessionData.login = {id: id, username: pd.username};
    }
    return `
    <app:basePage>
        <main>
            <h1>Login</h1>
            <app:section>
                ${
                    loginSuccess ? `<p>Successfully logged in. Welcome back, ${data.sessionData.login.username}!</p>`
                    : data.sessionData.login ? '<p>You can not log in when already logged in.</p><login:loggedin>'
                    : pd && (pd.username || pd.password) ? '<p class="loginFail">Login failed. Please try again.</p><login:form>'
                    : '<login:form>'
                }
            </app:section>
        </main>
    </app:basePage>
    `
});

exports.elements.form = new Element({preRender: true}, (content, args) => `
<form action="/profile/login" method="post">
    <fieldset>
        <legend>login</legend>
        <table>
            <tr><td>username:</td><td><input id="username" type="text" name="username"></td></tr>
            <tr><td>password:</td><td><input id="password" type="password" name="password"></td></tr>
        </table>
        <input type="submit" value="login">
    </fieldset>
</form>
<p>Don\'t have an account yet? <a href="/profile/register">Create a new account.</a></p>
`);

exports.elements.loggedin = new Element({}, (content, args, data) => `
    <p>logged in as</p>
    <p>${args.a ? '<a href="/profile/settings">' : ''}<b>${data.sessionData.login.username}</b>${args.a ? '</a>' : ''}</p>
`);
