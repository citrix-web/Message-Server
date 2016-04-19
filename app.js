var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var routes = require('./routes/queue');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use('/queue', routes);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
