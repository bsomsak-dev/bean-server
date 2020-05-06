const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// config DB
var dbConn = mysql.createConnection({
    host: '35.240.143.70',
    user: 'beanuser',
    password: 'beanpassword',
    database: 'beandb'
});
dbConn.connect()

// simple route
app.get("/", (req, res) => {
    res.json({message: "Welcome to beans RestFul API server."});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
