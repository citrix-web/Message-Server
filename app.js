var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var routes = require('./routes/queue');
var io = require('socket.io')(http);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.use('/queue', routes);

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('join', function(data) {
        console.log(data);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
