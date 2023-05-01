const {Element} = require('../renderer');

const namespaces = {};

exports.load = new Element(namespaces, false, (content, args, data) => {
    updatePageState(data);
    login(data);
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

function login(data) {
    if(data.postData?.username && data.postData?.password) {
        login(data.postData.username, data.postData.password, data.sessionData);
    }
}
exports.login = login;
