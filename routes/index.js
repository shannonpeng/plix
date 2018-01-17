/* Imports */
var express = require('express');
var router = express.Router();

/* Schemas */
var User = require('../schemas/user');
var Board = require('../schemas/board');
var Pixel = require('../schemas/pixel');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
