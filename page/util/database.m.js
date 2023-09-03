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
async function login(username, password) {
    if(!connection) return -1;
    
    const escapedUserName = mysql.escape(username);
    const escapedPWHash = mysql.escape(sha256(password));
    const query = `SELECT ID FROM users WHERE Name = ${escapedUserName} AND PWHash = ${escapedPWHash}`;
    
    // get user id
    const result = await asyncQuery(query);
    if(result.length <= 0) return -1;
    const id = result[0]['ID'];
    
    // set LoggedIn in users table to 1
    const escapedId = mysql.escape(id);
    const query2 = `UPDATE users SET LoggedIn = 1 WHERE ID = ${escapedId}`;
    const result2 = await asyncQuery(query2);
    if(result2.affectedRows != 1) return -1;
    
    return id;
}
exports.login = login;

/**
 * Tries to log out a user.
 * @param {number} userId 
 */
async function logout(userId) {
    if(!connection) return false;
    
    const escapedId = mysql.escape(userId);
    const query = `UPDATE users SET LoggedIn = 0 WHERE ID = ${escapedId}`;
    const result = await asyncQuery(query);
    if(result.affectedRows != 1) return false;
    
    return true;
}
exports.logout = logout;

/**
 * Adds an account to the users table.
 * @param {string} username 
 * @param {string} password 
 * @param {string} password2 
 * @returns {number} 0: success; 1: name already exists; 2: invalid username; 3: other error
 */
async function register(username, password) {
    if(!connection) return 3;
    
    // TODO: check for illegal special characters in the username
    const escapedUserName = mysql.escape(username);
    const escapedPWHash = mysql.escape(sha256(password));
    const query = `SELECT ID FROM users WHERE Name = ${escapedUserName}`;
    
    // check if username already exists
    const result = await asyncQuery(query);
    if(result.length == 1) return 1;
    
    // insert new user
    const query2 = `INSERT INTO users (Name, PWHash, LoggedIn) VALUES (${escapedUserName}, ${escapedPWHash}, 0)`;
    const result2 = await asyncQuery(query2);
    if(result2.affectedRows != 1) return 3;
    
    return 0;
}
exports.register = register;

/**
 * An async version of the query function of connections.
 * @param {string} query SQL-query
 * @returns promise for the result of the sql query
 */
function asyncQuery(query) {
    if(!connection) return null;
    
    let promise = new Promise((resolve, reject) => {
        connection.query(query, (err, result) => {
            if(err) throw err;
            resolve(result);
        })
    });
    
    return promise;
}

/**
 * Returns the SHA256 value of the input in hexadecimal.
 */
function sha256(input) {
    let hash = crypto.createHash('sha256').update(input).digest('hex');
    return hash;
}
