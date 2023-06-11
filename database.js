// TODO: move part of this to the test page

const mysql = require('mysql');
const crypto = require('crypto');

var connection;

function connect(connectionConfig) {
    if(connection) return; // don't reconnect if a connection already exists
    
    connection = mysql.createConnection(connectionConfig);
    
    connection.connect((err) => {
        if(err) throw err;
        console.log('connected to database');
    });
    
    connection.query('USE modularuitest', (err, result) => {
        if(err) throw err;
    });
}
exports.connect = connect;

/**
 * Searches a user with matching login data and returns the id (or -1 when none was found).
 * @param {string} username 
 * @param {string} password 
 * @param {(id : number) => {}} callback 
 */
function login(username, password, callback) {
    const escapedUserName = mysql.escape(username);
    const escapedPWHash = mysql.escape(sha256(password));
    const query = `SELECT ID FROM users WHERE Name = ${escapedUserName} AND PWHash = ${escapedPWHash}`;
    connection.query(query, (err, result) => {
        if(err) throw err;
        if(result.length > 0) {
            callback(result[0]['ID']);
        } else {
            callback(-1);
        }
    });
}
exports.login = login;

function sha256(input) {
    let hash = crypto.createHash('sha256').update(input).digest('hex');
    return hash;
}
