const {Element} = require('../../../renderer');

const database = require('../../util/database.m');

exports.elements = {};
exports.groupName = 'logout';

exports.elements.content = new Element({isAsync: true}, async (content, args, data) => {
    let logoutSuccess = await logout(data.sessionData);
    return `
    <app:basePage>
        <main>
            <h1>Logout</h1>
            <app:section>
                ${logoutSuccess
                    ? '<p>Successfully logged out.</p>'
                    : data.sessionData.login
                        ? '<login:loggedin>'
                        : '<p>You are not logged in.</p>'
                }
            </app:section>
        </main>
    </app:basePage>
    `;
});

async function logout(session) {
    if(!session.login) return;
    let success = await database.logout(session.login.id);
    if(success) session.login = undefined;
    return success;
}
