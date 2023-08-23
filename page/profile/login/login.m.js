const {Element} = require('../../../renderer');

const database = require('../../util/database.m');

exports.elements = {};
exports.groupName = 'login';

exports.elements.content = new Element({isAsync: true}, async (content, args, data) => {
    let loginSuccess = false;
    let pd = data.postData;
    if(pd && pd.username && pd.password)  {
        loginSuccess = await login(pd.username, pd.password, data.sessionData);
    }
    return `
    <app:basePage>
        <main>
            <h1>Login</h1>
            <app:section>
                ${loginSuccess
                    ? `<p>Successfully logged in. Welcome back, ${data.sessionData.login.username}!</p>`
                    : data.sessionData.login
                        ? '<login:loggedin>'
                        : '<login:form>'
                }
            </app:section>
        </main>
    </app:basePage>
    `
});

/**
 * Tries to log in with the given username and password.
 * @param {string} username 
 * @param {string} password 
 * @param {object} session 
 * @returns {boolean} success
 */
async function login(username, password, session) {
    if(!username || !password) return false;
    let id = await database.login(username, password);
    if(id <= -1) return false;
    
    session.login = {id: id, username: username};
    
    return true;
}

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
