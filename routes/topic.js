'use strict'

var express = require('express');

var TopicController = require('../controllers/topic');
var md_auth = require('../middlewares/authentication');

var router = express.Router();

router.get('/test', TopicController.test);
router.post('/topic', md_auth.authentication, TopicController.save);
router.get('/topics/:page?', TopicController.getTopics);
router.get('/user-topics/:user', TopicController.getTopicsByUser);
router.get('/topic/:id', TopicController.getTopic);
router.put('/topic/:id', md_auth.authentication, TopicController.update);
router.delete('/topic/:id', md_auth.authentication, TopicController.delete);
router.get('/search/:search', TopicController.search);

module.exports = router;