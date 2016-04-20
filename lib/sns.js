var cfg = require('../config/config');

AWS.config.loadFromPath('./config/AWS.config.js');

var sqs = new AWS.SQS();


