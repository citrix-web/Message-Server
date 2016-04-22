var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var routes = require('./routes/queue');
var io = require('socket.io')(http);
var sqs = require('./lib/sqs');
var user = require('./routes/user');
var dynamo = require('./lib/dynamo');
var messages = require('./routes/messages');

require('events').EventEmitter.defaultMaxListeners = Infinity;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.use('/queue', routes);
app.use('/api', user, messages)


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

io.on('connection', function(socket){
  console.log('user connected');

  setInterval(function () {
      sqs.receiveMessage(queueUrl, function(e, body) {
          if (e) {
              console.log(e);
          };
          var receiptHandles = [];
          if (body.Messages && body.Messages.length > 0) {
              for (var i = 0; i < body.Messages.length; i++) {
                  receiptHandles.push({ Id : i.toString(), ReceiptHandle : body.Messages[i].ReceiptHandle });
                  console.log('body', body.Messages[i].Body)
                  dynamo.putMessage(body.Messages[i], body.Messages[i].MessageAttributes)
              }
          }
          if (receiptHandles.length > 0) {
              sqs.deleteMessages(receiptHandles, queueUrl, function(e, delBody) {
                if(delBody.Successful) {
                  io.emit('messages', body.Messages);
                  console.log("Deletion of " + delBody.Successful.length + " succeeded, ");
                }
                if(delBody.Failed) {
                  console.log("Deletion of " + delBody.Failed.length + " failed");
                }
              });
          }
        });
  }, 1500);

});
