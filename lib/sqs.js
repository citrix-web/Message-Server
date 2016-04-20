var AWS = require('aws-sdk');
var cfg = require('../config/config');

AWS.config.loadFromPath('./config/AWS.config.js');

var sqs = new AWS.SQS();

module.exports = {
    getQueue: function(cb) {
        var params = {
            QueueName: cfg.queueName,
            QueueOwnerAWSAccountId: cfg.accountId
        };

        sqs.getQueueUrl(params, function(err, data) {
            if (err) {
                cb(err, err.stack); 
            } else {
                  cb(null, data);
            }
        });
    },

    sendMessage: function(message, messageAttributes, queueUrl, cb) {
        var params = {
            MessageBody: message,
            QueueUrl: queueUrl,
            MessageAttributes: messageAttributes,
            DelaySeconds: 0
        };
        sqs.sendMessage(params, function(err, data) {
            if (err) {
                cb(err, err.stack); 
            } else {
                cb(null, data);
            }
        });
    },

    receiveMessage: function(queueUrl, cb) {
        var params = {
            QueueUrl: queueUrl,
            AttributeNames: [ 'All' ],
            MessageAttributeNames: [ 'OrganizerKey' ],
            MaxNumberOfMessages: 10,
            VisibilityTimeout: 0,
            WaitTimeSeconds: 0
        };
        sqs.receiveMessage(params, function(err, data) {
            if (err) {
                cb(err, err.stack); 
            } else {
                cb(null, data);
            }
        });
    }
};
