var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();

var table = "notificat-users";

const createUser = (userId, messageId) => {
  return new Promise((resolve, reject) => {
    let pParams = {
        TableName:table,
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

const updateUser = (userId, messageId, messageArray) => {
  console.log('updating user', messageId, messageArray)
  return new Promise((resolve, reject) => {
    messageArray.push(messageId);
    let pParams = {
        TableName:table,
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


export default {
  putUserRead: (userId, messageId) => {
    var qParams = {
        TableName : table,
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
          TableName : table,
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
  }
}
