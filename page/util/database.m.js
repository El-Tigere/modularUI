const mysql = require('mysql');
const crypto = require('crypto');

var connection;

/**
 * Starts a new cinnection with the given login if there is no existing connection.
 */
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
 */
function login(username, password) {
    const escapedUserName = mysql.escape(username);
    const escapedPWHash = mysql.escape(sha256(password));
    const query = `SELECT ID FROM users WHERE Name = ${escapedUserName} AND PWHash = ${escapedPWHash}`;
    
    let promise = new Promise((resolve, reject) => {
        if(!connection) {
            resolve(-1);
            return;
        }

        // get user id
        connection.query(query, (err, result) => {
            if(err) throw err;
            if(result.length > 0) {
                const id = result[0]['ID'];
                const escapedId = mysql.escape(id);
                const query2 = `UPDATE users SET LoggedIn = 1 WHERE ID = ${escapedId}`;
                // set LoggedIn in users table to 1
                connection.query(query2, (err2, result2) => {
                    if(err2) throw err2;
                    if(result2.affectedRows == 1) resolve(id);
                    else resolve(-1);
                });
            } else {
                resolve(-1);
            }
        });
    });
    
    return promise;
}
exports.login = login;

/**
 * Tries to log out a user.
 * @param {number} userId 
 */
function logout(userId) {
    const escapedId = mysql.escape(userId);
    const query = `UPDATE users SET LoggedIn = 0 WHERE ID = ${escapedId}`;
    
    let promise = new Promise((resolve, reject) => {
        if(!connection) {
            resolve(false);
            return;
        }

        connection.query(query, (err, result) => {
            if(err) throw err;
            
            if(result.affectedRows == 1) resolve(true);
            else resolve(false);
        });
    });
    
    return promise;
}
exports.logout = logout;

/**
 * Adds an account to the users table.
 * @param {string} username 
 * @param {string} password 
 * @param {string} password2 
 * @returns {boolean} success
 */
async function register(username, password, password2) {
    return true;
}
exports.register = register;

/**
 * Returns the SHA256 value of the input in hexadecimal.
 */
function sha256(input) {
    let hash = crypto.createHash('sha256').update(input).digest('hex');
    return hash;
}
