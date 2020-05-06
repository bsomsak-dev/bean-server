const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();
const PORT = process.env.PORT || 5000;

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

app.get('/monitor', function (req, res) {
    console.log("call /monitor");
    dbConn.query('SELECT * FROM beans', function (error, results) {
        if (error)
            throw error;
        return res.send({data: results});
    });
});

app.get('/updateStock/:beanType/:beanNum', function (req, res) {
    let beanType = req.params.beanType;
    let beanNum = req.params.beanNum;
    console.log("call /updateStock = > beanType: " + beanType + ", beanNum: " + beanNum);
    if (!beanType || !beanNum)
        return res.status(400).send({error: true, message: 'Please provide [beanType, beanNum]'});
    let queryString = 'UPDATE beans SET bean_num = ? WHERE bean_type = ?';
    let filter = [beanNum, beanType];
    dbConn.query(queryString, filter, function (error, results) {
        if (error) throw error;
        return res.send({data: results});
    });
});

app.get('/makeOrder/:username/:beanType/:beanNum', function (req, res) {
    let username = req.params.username;
    let beanType = req.params.beanType;
    let beanNum = req.params.beanNum;
    console.log("call /makeOrder = > username: " + username + ", beanType: " + beanType + ", beanNum: " + beanNum);
    if (!username || !beanType || !beanNum)
        return res.status(400).send({error: true, message: 'Please provide [username, beanType, beanNum]'});
    let queryString = "INSERT INTO orders (username, bean_type, bean_num, complete_status)" +
        " VALUES (?, ?, ?, ?)";
    let filter = [username, beanType, beanNum, false];
    dbConn.query(queryString, filter, function (error, results) {
        if (error) throw error;
        return res.send("Number of records inserted: " + results.affectedRows);
    });
});

app.get('/getOrder', function (req, res) {
    console.log("call /getOrder");
    let queryString = "SELECT username, bean_type, bean_num, REPLACE(timestamp, 't', '') AS timestamp, order_id " +
        " FROM orders " +
        " WHERE complete_status = ? " +
        " ORDER BY timestamp, username ASC " +
        " LIMIT 1";
    let filter = [false]
    dbConn.query(queryString, filter, function (error, results) {
        if (error) throw error;
        return res.send(results[0]);
    });
});

app.get('/completeOrder/:username/:orderId', function (req, res) {
    let username = req.params.username;
    let orderId = req.params.orderId;
    console.log("call /successOrder = > username: " + username + ", orderId: " + orderId);
    if (!username || !orderId)
        return res.status(400).send({error: true, message: 'Please provide [username, orderId]'});
    let queryString = 'WITH processing_order AS (' +
        '   SELECT bean_type, bean_num ' +
        '   FROM beandb.orders ' +
        '   WHERE username = ? ' +
        '   AND order_id = ? )' +
        ' UPDATE beans ' +
        ' INNER JOIN processing_order ON beans.bean_type  = processing_order.bean_type ' +
        ' SET beans.bean_num = beans.bean_num - processing_order.bean_num ' +
        ' WHERE beans.bean_type = processing_order.bean_type ';
    let filter = [username, orderId];
    dbConn.query(queryString, filter, function (error) {
        if (error) throw error;
    });
    let queryString2 = 'UPDATE orders SET complete_status = ? ' +
        ' WHERE username = ? AND order_id = ?';
    let filter2 = [true, username, orderId];
    dbConn.query(queryString2, filter2, function (error, results) {
        if (error) throw error;
        return res.send({data: results});
    });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
