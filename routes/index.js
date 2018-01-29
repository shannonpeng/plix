// Imports
const express = require('express');
const router = express.Router();
const mongo = require('mongodb');

// Schemas
const User = require('../schemas/user');
const Board = require('../schemas/board');
const Pixel = require('../schemas/pixel');

const config = require('../config.js'); // Comment out for heroku

// update unique contributors
function updateUnique(boardId){
    var contributors = []; // list of unique contributors
    Pixel.find({ board : mongo.ObjectId(boardId) }, function(err, pixels) { // get contributors
        if (err) { console.log(err) }
        else if (pixels) {
            for (pixel of pixels) {
                if (contributors.indexOf(pixel.creator) <= -1 ){
                    contributors.push(pixel.creator); // only add contributor if we haven't counted them
                }
            }

            // now update for board
            Board.findOne({ _id: mongo.ObjectId(boardId) }, function(err, board) {
                if (err) { console.log(err); }
                else if (board) {
                    board.unique_contributors = contributors.length;
                    board.save(function(err, data){
                        if (err) { console.log(err) }
                        else if (data) {
                            console.log('board saved');
                        }
                    });
                }
            });
        }
    });
}

// update your boards
function updateBoardsContributed(userId){
    var myBoards = []
    Pixel.find({ creator : mongo.ObjectId(userId) }, function(err, pixels){ // get all pixels owned
        if (err) { console.log(err) }
        else if (pixels) {
            for (pixel of pixels) {
                if (myBoards.indexOf(pixel.board) <= -1){
                    myBoards.push(pixel.board); // only count unique boards
                }
            }

            User.findOne({ _id : mongo.ObjectId(userId) }, function(err, user){
                if (err) { console.log(err); }
                else if (user) {
                    user.boards = myBoards;
                    user.save(function(err, data){
                        if (err) { console.log(err) }
                        else if (data) {
                            console.log('user boards saved');
                        };
                    })
                }
            });
        }
    });
}

// GET home page
router.get('/', function(req, res, next) {
	if (req.session.userId) { res.redirect('/dashboard'); } // user logged in
	else { res.render('index'); } // render landing page
});

// GET profile
router.get('/profile', function(req, res, next) {
	if (req.session.userId) { // user logged in
		var userId = req.session.userId;
		User.findOne({ _id: userId }).exec(function(err, user) {
			if (err) { console.log(err); }
			else if (user) { // user found
				var boards_contributed = [];
				for (var i = 0; i < user.boards.length; i++) { // retrieve boards by board ID
					Board.findOne({ _id: user.boards[i] }, function(err, board) {
						if (err) { console.log(err); }
						else if (board) {
                            Pixel.find({ board : board._id, creator : userId }).sort({ created_at: -1 }).exec(function(err, pixels) {
                                if (err) { console.log(err) }
                                else if (pixels) {
                                    boards_contributed.push({ 'board' : board, 'pixel' : pixels[0]});
                                    console.log(pixels);
                                }
                            });
						};
					});

				}
				Board.find({}).sort({ name: 1 }).exec(function(err, boards) { // retrieve all boards in database
					if (err) { console.log(err); }
					else if (boards) {
						console.log(boards);
						res.render('profile', {
							user: user,
							boards: boards,
							boards_contributed: boards_contributed,
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
		res.redirect('/');
	}
});

// GET a board
router.get('/board', function(req, res, next) {
    if (!req.session.userId) { res.redirect('/'); } // user not logged in
    else {
        var blocks = {};
        var width = [];
        var height = [];
        for (var i = 0; i < 64; i ++) {
            height.push(i);
        }
        for (var j = 0; j < 96; j ++) {
            width.push(j);
        }
        for (x of height){ // basic blocks
            var coords = {};
            for (y of width) {
                coords[y] = {'x': x, 'y': y, 'hex': '#F5F5F5'};
            }
            blocks[x] = coords;
        }

        var boardId = req.originalUrl.substring(req.originalUrl.indexOf('?') + 1, req.originalUrl.length);

        Board.findOne({ _id: mongo.ObjectId(boardId) }, function(err, board) {
            if (err) { console.log(err); }
            else if (board) { // found board
                Pixel.find({ board: mongo.ObjectId(boardId) }, function(err, pixels){
                    if (err) { console.log(err); }
                    else if (pixels) {
                        // populate with last pixels
                        for (pixel of pixels) {
                            blocks[pixel.x][pixel.y]['hex'] = pixel.hex;
                        }
                    }

                    // get user
                    if (req.session.userId) {
                        var userId = req.session.userId;
                        User.findOne({ _id: userId }, function(err, user) {
                            if (err) { console.log(err); }
                            else if (user) {
                                res.render('board',
                                    {user: user,
                                    board: board,
                                    blocks: blocks,
                                    edit: true}
                                );
                            }
                            else { // cannot find a user
                                console.log('no user found with Id ' + userId);
                                res.render('board',
                                    {user: null,
                                    board: board,
                                    edit: false}
                                );
                            }
                        });
                    }
                    else { // no user logged in
                        res.render('board',
                            {user: null,
                            board: board,
                            edit: false}
                        );
                    }
                });
            }
            else { // no board found
                console.log('no board found with Id ' + boardId);
            }
        });
    }
});

// POST a board
router.post('/board', function(req, res, next) {

    var back = req.header('Referer') || '/';
    var boardId = req.originalUrl.substring(req.originalUrl.indexOf('?') + 1, req.originalUrl.length);

    // Render default blank board
    var blocks = {};
    var width = [];
    var height = [];
    for (var i = 0; i < 64; i ++) {
        height.push(i);
    }
    for (var j = 0; j < 96; j ++) {
        width.push(j);
    }
    for (x of height){
        var coords = {};
        for (y of width) {
            coords[y] = {'x': x, 'y': y, 'hex': '#F5F5F5'};
        }
        blocks[x] = coords;
    }

    // Check if user is logged in
    if (req.session.userId){
        //find User
        var userId = req.session.userId;
		User.findOne({ _id: userId }, function(err, user) {
			if (err) { console.log(err); }

            // found User
			else if (user) {
                // find Board
                Board.findOne({ _id: mongo.ObjectId(boardId) }, function(err, board) {
                    if (err) { console.log(err); }

                    // found Board
                    else if (board) {

                        // get POST data
                        if (req.body.x && req.body.y && req.body.hex) {
                            var today = new Date();
                            var month = today.getMonth() + 1;
                            var day = today.getDate();
                            if (month < 10) {
                                month = '0' + month;
                            }
                            if (day < 10){
                                day = '0' + day;
                            }
                            var date = parseInt(today.getFullYear() + month + day);
                            // find Pixel
                            Pixel.findOne({ x: req.body.x, y: req.body.y, board: mongo.ObjectId(boardId) }, function(err, pixel){
                                if (err) { console.log(err); }

                                // if a pixel exists, update
                                else if (pixel) {
                                    updateUnique(boardId);
                                    updateBoardsContributed(userId);

                                    pixel.hex = req.body.hex;
                                    pixel.creator = mongo.ObjectId(userId);
                                    pixel.created_at = date;

                                    // save changes
                                    pixel.save(function(err, data){
                                        if (err) { console.log(err) }
                                        else if (data) {
                                            res.send('pixel saved');
                                        }
                                        else { console.log('wtf happened'); }
                                    })
                                }

                                // if no pixel, create one
                                else {
                                    updateUnique(boardId);
                                    updateBoardsContributed(userId);
                                    var newPixel = {
                                        board: mongo.ObjectId(boardId),
                                        hex: req.body.hex,
                                        creator: mongo.ObjectId(userId),
                                        created_at: date,
                                        x: req.body.x,
                                        y: req.body.y
                                    }
                                    Pixel.create(newPixel, function(error, pixel) {
                                        if (error) {
                                            console.log(error);
                                            next(error);
                                        }
                                        else {
                                             res.send('pixel saved');
                                        }
                                    });
                                }
                            });
                        }
                        // Form is incomplete
                        else {
                            console.log('missing information for pixel paint');
                        }
                    }
                    // No board found
                    else {
                        console.log('no board found with Id ' + boardId)
                    }
                });
            }
            // No user found
            else {
                console.log('no user found with Id ' + userId);
            }
        });
    }
    // No user logged in
    else {
        var error = new Error('No user not logged in');
        error.status = 401;
        next(error);
    }
});

// GET map view
router.get('/dashboard', function(req, res, next) {

    if (req.session.userId) { // user logged in
        var userId = req.session.userId;
        User.findOne({ _id: userId }).exec(function(err, user) {
            if (err) { console.log(err); }
            else if (user) { // user found
                var boards_contributed = [];
                for (var i = 0; i < user.boards.length; i++) { // retrieve boards by board ID
                    Board.findOne({ _id: user.boards[i] }, function(err, board) {
                        if (err) { console.log(err); }
                        else if (board) {
                            Pixel.find({ board : board._id, creator : userId }).sort({ created_at: -1 }).exec(function(err, pixels) {
                                if (err) { console.log(err) }
                                else if (pixels) {
                                    boards_contributed.push({ 'board' : board, 'pixel' : pixels[0]});
                                    console.log(pixels);
                                }
                            });
                        };
                    });
                }
                Board.find({}).sort({ name: 1 }).exec(function(err, boards) { // retrieve all boards in database
                    if (err) { console.log(err); }
                    else if (boards) {
                        console.log(boards);
                        res.render('map', {
                            api: config.MAP_API,
                            user: user,
                            boards: boards,
                            boards_contributed: boards_contributed,
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
        res.redirect('/');
    }
});

module.exports = router;
