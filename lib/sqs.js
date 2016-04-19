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

    sendMessage: function(message, queueUrl, cb) {
        var params = {
            MessageBody: message,
            QueueUrl: queueUrl,
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
            AttributeNames: [
                'Policy', 'VisibilityTimeout', 'MaximumMessageSize', 'MessageRetentionPeriod', 'ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible', 'CreatedTimestamp', 'LastModifiedTimestamp', 'QueueArn', 'ApproximateNumberOfMessagesDelayed', 'DelaySeconds', 'ReceiveMessageWaitTimeSeconds', 'RedrivePolicy'
            ],
            MaxNumberOfMessages: 1,
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
