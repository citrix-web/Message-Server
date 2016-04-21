var express = require('express');
var router = express.Router();
import dynamo from '../lib/dynamo';



router.put('/user/:userId/read', function(req, res) {
  if(dynamo.putUserRead(req.params.userId, req.body.messageId)) {
    return res.status(200).json({message: 'message marked as read'});
  } else {
    return res.status(500).json({message: 'an error occurred'});
  }

});

router.get('/user/:userId/read', function(req, res) {
    dynamo.getUserRead(req.params.userId).then((result) => {
      console.log('m', result)
      return res.send(result);
    }).catch((err) => {
      res.send(err)
    })
})
module.exports = router;
