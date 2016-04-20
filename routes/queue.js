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

        return res.json(body);
    });
});

router.put('/', function(req, res) {
    var message = req.body.message;
    var messageAttributes = req.body.messageAttributes;
    sqs.sendMessage(message, messageAttributes, queueUrl, function(e, body) {
        if (e) {
            return res.sendStatus(500);
        };

        return res.json(body);
    });
});

module.exports = router;
