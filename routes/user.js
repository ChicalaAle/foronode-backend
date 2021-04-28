'use strict'

var express = require('express');

var UserController = require('../controllers/user');
var md_auth = require('../middlewares/authentication');

var router = express.Router();

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'});

router.get('/probando', UserController.probando);
router.post('/user/save', UserController.save);
router.post('/user/login', UserController.login);
router.put('/user/update', md_auth.authentication, UserController.update);
router.post('/user/upload-avatar', [md_auth.authentication, md_upload], UserController.uploadAvatar);
router.get('/user/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:id', UserController.getUser);

module.exports = router;