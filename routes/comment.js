'use strict'

var express = require('express');
var router = express.Router();

var CommentController = require('../controllers/comment');
var md_auth = require('../middlewares/authentication');

router.post('/comment/:topicId', md_auth.authentication, CommentController.add);
router.put('/comment/:commentId', md_auth.authentication, CommentController.update);
router.delete('/comment/:topicId/:commentId', md_auth.authentication, CommentController.delete);

module.exports = router;
