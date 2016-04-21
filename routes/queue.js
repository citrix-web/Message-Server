var express = require('express');
var router = express.Router();
var sqs = require('../lib/sqs');

var queueUrl;
sqs.getQueue(function(e, body) {
    if (e) {
        return e;
    };

    queueUrl = body.QueueUrl;
});

router.get('/', function(req, res) {
    sqs.receiveMessage(queueUrl, function(e, body) {
        if (e) {
            return res.sendStatus(500);
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
        return res.json(body);
    });
});

router.put('/', function(req, res) {
    console.log('hello put', req.body)
    sqs.sendMessage(req.body, queueUrl, function(e, body) {
        if (e) {
          //console.log(e)
            return res.sendStatus(500);
        };

        return res.json(body);
    });
});

module.exports = router;
