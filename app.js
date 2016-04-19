var express = require('express');
var app = express();

var AWS = require('aws-sdk');

AWS.config.loadFromPath('./config/AWS.config.json');

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
