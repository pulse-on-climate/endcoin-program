var express = require('express');
var app = express();
var fs = require("fs");

app.get('/averageTemp', function (req, res) {
   fs.readFile( __dirname + "/" + "data.json", 'utf8', function (err, data) {
    var today = new Date().toISOString().split('T')[0];
    console.log(today);
    var json = JSON.parse(data);

    var meanTemp = json[today].temperature.toString();
    console.log( meanTemp );
    res.end( meanTemp );
   });
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://localhost:8081", host, port)
})