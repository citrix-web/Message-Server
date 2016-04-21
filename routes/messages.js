var express = require('express');
var router = express.Router();
var dynamo = require('../lib/dynamo');





router.get('/messages', function(req, res) {
    dynamo.getAllMessages(req.query.limit).then((result) => {
      return res.send(result);
    }).catch((err) => {
      res.send(err)
    })
})
module.exports = router;
