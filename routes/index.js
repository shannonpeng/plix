// Imports
const express = require('express');
const router = express.Router();

// Schemas
const User = require('../schemas/user');
const Board = require('../schemas/board');
const Pixel = require('../schemas/pixel');

// GET home page
router.get('/', function(req, res, next) {
	if (req.user) { res.redirect('/dashboard'); } // user logged in
	else { res.render('index'); } // render landing page
});

// GET dashboard
router.get('/dashboard', function(req, res, next) {
	if (req.session.userId) { // user logged in
		var userId = req.session.userId;
		User.findOne({ _id: userId }, function(err, user) {
			if (err) { console.log(err); }
			else if (user) { // user found
				var boards_contributed = [];
				for (var i = 0; i < user.boards.length; i++) { // retrieve boards by board ID
					Board.findOne({ _id: user.boards[i] }, function(err, board) {
						if (err) { console.log(err); }
						else if (board) {
							boards_contributed.push(board);
						};
					});
				}
				Board.find({}, function(err, boards) { // retrieve all boards in database
					if (err) { console.log(err); }
					else if (boards) {
						res.render('dashboard', {
							//account: req.user,
							//user: user,
							boards: boards,
							boards_contributed: boards_contributed
						}, function(err, data) {
							if (err) { console.log(err); }
							else { res.send(data); }
						});
					}
				});
			}
			else { // no user found with given username
				console.log('no user found with Id' + userId);
			}
		});
	}
    else { // user not logged in
		res.redirect('/login');
	}
});

module.exports = router;
