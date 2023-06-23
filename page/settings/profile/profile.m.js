const {Element} = require('../../../renderer');

exports.elements = {};
exports.groupName = 'profileSettings';

exports.elements.content = new Element({}, (content, args, data) => `
<app:basePage>
    <main>
        <h1>Settings</h1>
        <app:section name="profile">
        ${data.sessionData.login
            ? `<p>logged in as</p><p><b>${data.sessionData.login.username}</b></p>`
            + '<form action="/profile/logout" method="post"><button onClick="">logout</button></form>'
            : '<p>not logged in</p><p><a href="/login">login</a></p>'
        }
        </app:section>
    </main>
</app:basePage>
`);
