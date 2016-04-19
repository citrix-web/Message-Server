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
			return res.statusCode(e.statusCode);
		};

		return res.json(body);
	});
});

router.put('/', function(req, res) {
	var message = req.body.message;
	sqs.sendMessage(message, queueUrl, function(e, body) {
		if (e) {
			return res.statusCode(e.statusCode);
		};

		return res.json(body);
	});
});

module.exports = router;
