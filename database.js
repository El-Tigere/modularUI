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

function sha256(input) {
    let hash = crypto.createHash('sha256').update(input).digest('hex');
    return hash;
}
