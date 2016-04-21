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

    deleteMessage: function(receiptHandle, queueUrl, cb) {
        var params = {
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle
        };
        sqs.deleteMessage(params, function(err, data) {
            if (err) {
                cb(err, err.stack);
            } else {
                cb(null, data);
            }
        });
    },

    purgeMessages: function(queueUrl, cb) {
        var params = {
            QueueUrl: queueUrl
        };
        sqs.purgeQueue(params, function(err, data) {
            if (err) {
                cb(err, err.stack);
            } else {
                cb(null, data);
            }
        });
    },

    deleteMessages: function(receiptHandles, queueUrl, cb) {
        var params = {
            QueueUrl: queueUrl,
            Entries: receiptHandles
        };
        sqs.deleteMessageBatch(params, function(err, data) {
            if (err) {
                cb(err, err.stack);
            } else {
                cb(null, data);
            }
        });
    },

    sendMessage: function(body, queueUrl, cb) {
      var params = {
         MessageBody: body.message,
         QueueUrl: queueUrl,
         MessageAttributes: {
           group: {
             DataType: 'String',
             StringValue: body.group
           },
           category: {
             DataType: 'String',
             StringValue: body.category
           }
         },
         DelaySeconds: 0

       }
        
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
            MessageAttributeNames: [ 'GroupId' ],
            MaxNumberOfMessages: 10
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
