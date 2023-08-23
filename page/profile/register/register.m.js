const {Element} = require('../../../renderer');

const database = require('../../util/database.m');

exports.elements = {};
exports.groupName = 'register';

exports.elements.content = new Element({isAsync: true}, async (content, args, data) => {
    let registerSuccess = false;
    let pd = data.postData;
    if(pd && pd.username && pd.password && pd.password2) {
        registerSuccess = await register(pd.username, pd.password, pd.password2, data.sessionData); // TODO: fix space being replaced by + in input data
    }
    return `
    <app:basePage>
        <main>
            <h1>Create a new account</h1>
            <app:section>
                ${registerSuccess
                    ? `<p>Successfully registered. Welcome, ${data.sessionData.login.username}!</p>`
                    : data.sessionData.login
                        ? '<p>You can\'t create an account when logged in.</p><login:loggedin>'
                        : '<register:form>' // TODO: registration failed message
                }
            </app:section>
        </main>
    </app:basePage>
    `
});

// TODO: merge this with the according function in database
async function register(username, password, password2, session) {
    if(!username || !password || !password2 || !session) return false;
    if(password != password2) return false;
    
    // create account
    if(await database.register(username, password) != 0) return false;
    
    // login with new account
    let id = await database.login(username, password);
    if(id <= -1) return false;
    
    session.login = {id: id, username: username}; // TODO: remove duplicate code for login
    
    return true;
}

exports.elements.form = new Element({preRender: true}, (content, args) => `
<form action="/profile/register" method="post">
    <fieldset>
        <legend>register</legend>
        <table>
            <tr><td>username:</td><td><input id="username" type="text" name="username"></td></tr>
            <tr><td>password:</td><td><input id="password" type="password" name="password"></td></tr>
            <tr><td>repeat password:</td><td><input id="password2" type="password" name="password2"></td></tr>
        </table>
        <input type="submit" value="create account">
    </fieldset>
</form>
`);
