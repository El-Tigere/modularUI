const {Element} = require('../renderer');
const database = require('./util/database.m');

exports.elements = {};
exports.groupName = 'app';

exports.elements.sessionManager = new Element({isAsync: true}, async (content, args, data) => {
    updatePageState(data);
    
    /*if(data.postData) {
        let pd = data.postData;
        
        // login
        if(pd.username && pd.password) {
            await login(pd.username, pd.password, data.sessionData);
        }
        //register
        if(pd.rUsername && pd.rPassword && pd.rPassword2) {
            await register(pd.rUsername, pd.rPassword, pd.rPassword2, data.sessionData);
        }
    }*/
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
exports.login = login;

async function register(username, password, password2, session) {
    if(!username || !password || !password2) return;
    if(!(await database.register(username, password, password2))) return;
    
    console.log('*register*');
    
    return;
}
exports.register = register;
