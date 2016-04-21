var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var routes = require('./routes/queue');
var io = require('socket.io')(http);
var sqs = require('./lib/sqs');
var user = require('./routes/user');
import dynamo from './lib/dynamo';
require('events').EventEmitter.defaultMaxListeners = Infinity;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.use('/queue', routes);
app.use('/api', user)


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
  console.log('a user connected');

  setInterval(function () {
      sqs.receiveMessage(queueUrl, function(e, body) {
          if (e) {
              console.log(e);
          };
          var receiptHandles = [];
          if (body.Messages && body.Messages.length > 0) {
              for (var i = 0; i < body.Messages.length; i++) {
                  receiptHandles.push({ Id : i.toString(), ReceiptHandle : body.Messages[i].ReceiptHandle });
                  dynamo.putMessage(body.Messages[i])
              }
              io.emit('messages', body.Messages);
          }
          if (receiptHandles.length > 0) {
              sqs.deleteMessages(receiptHandles, queueUrl, function(e, body) {
                if(body.Successful){
                  console.log("Deletion of " + body.Successful.length + " succeeded, ");
                }
                if(body.Failed) {
                  console.log("Deletion of " + body.Failed.length + " failed");
                }
              });
          }

        });
  }, 5000);

});
