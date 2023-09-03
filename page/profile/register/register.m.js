const {Element} = require('../../../renderer');

const database = require('../../util/database.m');

exports.elements = {};
exports.groupName = 'register';

exports.elements.content = new Element({isAsync: true}, async (content, args, data) => {
    let registerStatus = -1;
    let pd = data.postData;
    if(pd && pd.username && pd.password && pd.password2) {
        registerStatus = await register(pd.username, pd.password, pd.password2, data.sessionData);
    }
    return `
    <app:basePage>
        <main>
            <h1>Create a new account</h1>
            <app:section>
                ${
                    registerStatus == -1 ? '<register:form>'
                    : registerStatus == 0 ? `<p>Successfully registered. Welcome, ${data.sessionData.login.username}!</p>`
                    : registerStatus == 1 ? '<p>This username already exists</p><register:form>' // TODO: check duplicate usernames as soon as the username is typed (not when the register form is submitted)
                    : registerStatus == 2 ? '<p>Your Input is invalid.</p><register:form>'
                    : '<p>An error has occured.</p><register:form>'
                
                    //: data.sessionData.login
                    //    ? '<p>You can\'t create an account when logged in.</p><login:loggedin>' // TODO: make it impossible to login or register when logged in (or logout automatically)
                }
            </app:section>
        </main>
    </app:basePage>
    `
});

// TODO: merge this with the according function in database
// returns: 0: success; 1: name already exists; 2: invalid input; 3: other error
async function register(username, password, password2, session) {
    if(!username || !password || !password2 || !session) return 2;
    if(password != password2) return 2;
    
    // create account
    let registerStatus = await database.register(username, password);
    if(registerStatus != 0) return registerStatus;
    
    // login with new account
    let id = await database.login(username, password);
    if(id <= -1) return 3;
    
    session.login = {id: id, username: username}; // TODO: remove duplicate code for login
    
    return 0;
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
