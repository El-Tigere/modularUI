const {Element} = require('../../../renderer');

const database = require('../../util/database.m');

exports.elements = {};
exports.groupName = 'logout';

exports.elements.content = new Element({isAsync: true}, async (content, args, data) => {
    return `
    <app:basePage>
        <main>
            <h1>Logout</h1>
            <app:section>
                ${data.sessionData.login
                    ? '<login:loggedin>'
                    : 'You are not logged in'
                }
            </app:section>
        </main>
    </app:basePage>
    `;
});
