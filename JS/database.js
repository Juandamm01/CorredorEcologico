const mysql = require("mysql2");

const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Jdmm10__",
    database:"dbCorredor"
});
connection.connect(err => {
    if (err) throw err;
    console.log("Conexion exitosa a MySQL")
});
module.exports = connection;