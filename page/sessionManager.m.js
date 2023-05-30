const {Element} = require('../renderer');

exports.elements = {};

const namespaces = {};

exports.elements.load = new Element(namespaces, false, false, (content, args, data) => {
    updatePageState(data);
    if(data?.postData?.username && data?.postData?.password) {
        login(data.postData.username, data.postData.password, data.sessionData);
    }
});

function updatePageState(data) {
    if(data.postData?.updateData) {
        try {
            let pageState = JSON.parse(data.postData.updateData);
            Object.assign(data.sessionData.pageState, pageState);
        } catch (error) {
            
        }
    }
}
exports.updatePageState = updatePageState;

// TODO: add databases for actual user authentication
/**
 * Tries to log in with the given username and password.
 * @param {string} username 
 * @param {string} password 
 * @param {object} session 
 * @returns {boolean} success
 */
function login(username, password, session) {
    if(!username || !password) return false; // login if any username or password is used
    session.login = {username: username};
    return true;
}

exports.login = login;
