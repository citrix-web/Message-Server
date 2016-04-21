var AWS = require('aws-sdk');
AWS.config.update({region:'us-west-1'});

var docClient = new AWS.DynamoDB.DocumentClient();

var usertable = "notificat-users";
var messagetable = "notificat-message";

var createUser = (userId, messageId) => {
  return new Promise((resolve, reject) => {
    var pParams = {
        TableName: usertable,
        Item: {user_id: userId, messages: [messageId]},
    };
    docClient.put(pParams, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            reject(err);
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
            resolve(data);
        }
    });
  });
}

var updateUser = (userId, messageId, messageArray) => {
  return new Promise((resolve, reject) => {
    messageArray.push(messageId);
    var pParams = {
        TableName: usertable,
        Item: {user_id: userId, messages: messageArray},
    };

    docClient.put(pParams, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            reject(err);
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
            resolve(data);
        }
    });
  });
}


module.exports = {
  putUserRead: (userId, messageId) => {
    var qParams = {
        TableName : usertable,
        KeyConditions: {
            user_id: {
                ComparisonOperator: 'EQ', // (EQ | NE | IN | LE | LT | GE | GT | BETWEEN |
                                          //  NOT_NULL | NULL | CONTAINS | NOT_CONTAINS | BEGINS_WITH)
                AttributeValueList: [userId],
            }
        },
    };

    return docClient.query(qParams, function(err, data) {
          if (err) {
              console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
          } else {
              if(data.Items.length === 0) {
                createUser(userId, messageId).then((result) => {
                  return true;
                })
              } else {
                updateUser(userId, messageId, data.Items[0].messages).then((result) => {
                  return true;
                })
              }
          }
      });
  },
  getUserRead: (userId) => {
      return new Promise((resolve, reject) => {
        var qParams = {
          TableName : usertable,
          KeyConditions: {
              user_id: {
                  ComparisonOperator: 'EQ', // (EQ | NE | IN | LE | LT | GE | GT | BETWEEN |
                                            //  NOT_NULL | NULL | CONTAINS | NOT_CONTAINS | BEGINS_WITH)
                  AttributeValueList: [userId],
              }
          },
        };

      docClient.query(qParams, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            if(data.Items.length === 0) {
              return resolve({read_message: 'user has not read anything'});
            } else {
              return resolve({read_messages: data.Items[0].messages});
            }
          }
      });
    })
  },
  putMessage: (message) => {
    var pParams = {
        TableName: messagetable,
        Item: message,
    };
    docClient.put(pParams, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            return false;
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
            return true;
        }
    });
  },
  getAllMessages: (limit) => {
    return new Promise((resolve, reject) => {
      var qParams = {
        TableName : messagetable,
        Limit: limit,
        AttributesToGet: ['MessageId','Body'],

      };

      docClient.scan(qParams, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
          if(data.Items.length === 0) {
            return resolve({messages: 'no messages'});
          } else {
            return resolve(data);
          }
        }
    });
  })
  }
}
