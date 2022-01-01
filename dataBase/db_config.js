const mysql = require('mysql');

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "world"
});

db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = db