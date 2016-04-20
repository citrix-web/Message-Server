var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var routes = require('./routes/queue');
var io = require('socket.io')(http);
var sqs = require('./lib/sqs');

app.use(bodyParser.urlencoded({ extended: false }))
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

var queueUrl;
sqs.getQueue(function(e, body) {
    if (e) {
        return e;
    };

    queueUrl = body.QueueUrl;
});

setInterval(function () {
    sqs.receiveMessage(queueUrl, function(e, body) {
        if (e) {
            console.log(e);
        };
        var receiptHandles = [];
        if (body.Messages && body.Messages.length > 0) {
            for (var i = 0; i < body.Messages.length; i++) {
                receiptHandles.push({ Id : i.toString(), ReceiptHandle : body.Messages[i].ReceiptHandle });
            }
        }
        if (receiptHandles.length > 0) {
            sqs.deleteMessages(receiptHandles, queueUrl, function(e, body) {
                console.log("Deletion of " + body.Successful.length + " succeeded, " + body.Failed.length + " failed");
            });
        }
    });
}, 5000);
