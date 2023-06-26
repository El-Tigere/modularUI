const {Element} = require('../../../renderer');

const database = require('../../util/database.m');

exports.elements = {};
exports.groupName = 'logout';

exports.elements.content = new Element({isAsync: true}, async (content, args, data) => {
    logout(data.sessionData);
    return `
    <app:basePage>
        <main>
            <h1>Logout</h1>
            <app:section>
                ${data.sessionData.login
                    ? '<login:loggedin>'
                    : '<p>You are not logged in.</p>'
                }
            </app:section>
        </main>
    </app:basePage>
    `;
});

function logout(session) {
    if(!session.login) return;
    database.logout(session.login.id);
    session.login = undefined;
}
