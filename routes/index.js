// Imports
const express = require('express');
const router = express.Router();
const mongo = require('mongodb');

// Schemas
const User = require('../schemas/user');
const Board = require('../schemas/board');
const Pixel = require('../schemas/pixel');

// GET home page
router.get('/', function(req, res, next) {
	if (req.session.userId) { res.redirect('/dashboard'); } // user logged in
	else { res.render('index'); } // render landing page
});

// GET dashboard
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
							boards_contributed.push(board);
						};
					});
				}
				Board.find({}).sort({ name: 1 }).exec(function(err, boards) { // retrieve all boards in database
					if (err) { console.log(err); }
					else if (boards) {
						console.log(boards);
						return res.render('dashboard', {
							user: user,
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
		return res.redirect('/');
	}
});

// GET a board
router.get('/board', function(req, res, next) {
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
                            return res.render('board',
                                {user: user,
                                board: board,
                                blocks: blocks,
                                edit: true}
                            );
                        }
                        else { // cannot find a user
                            console.log('no user found with Id ' + userId);
                            return res.render('board',
                                {user: null,
                                board: board,
                                edit: false}
                            );
                        }
                    });
                }
                else { // no user logged in
                    return res.render('board',
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
                            // find Pixel
                            Pixel.findOne({ x: req.body.x, y: req.body.y }, function(err, pixel){
                                if (err) { console.log(err); }

                                // if a pixel exists, update
                                else if (pixel) {
                                    pixel.hex = req.body.hex;
                                    pixel.creator = mongo.ObjectId(userId);
                                    pixel.created_at = 00000; //NOTE: NOT IMPLEMENTED

                                    // save changes
                                    pixel.save(function(err, data){
                                        if (err) { console.log(err) }
                                        else if (data) {
                                            return res.redirect(back);
                                        }
                                        else { console.log('wtf happened'); }
                                    })
                                }

                                // if no pixel, create one
                                else {
                                    console.log('new pixel');
                                    console.log(boardId);
                                    console.log(req.body.hex);
                                    var newPixel = {
                                        board: mongo.ObjectId(boardId),
                                        hex: req.body.hex,
                                        creator: mongo.ObjectId(userId),
                                        created_at: 0000000,
                                        x: req.body.x,
                                        y: req.body.y
                                    }
                                    Pixel.create(newPixel, function(error, pixel) {
                                        if (error) {
                                            console.log(error);
                                            return next(error);
                                        }
                                        else {
                                            return res.redirect(back);
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
        return next(error);
    }
});

// FAKE NEWS
router.get('/test', function(req, res, next) {
    // var newPixel = {
    //     board: mongo.ObjectId('5a637d7c1696af3f873c9cce'),
    //     hex: '#4dbcf8',
    //     creator: mongo.ObjectId('5a62310c9f3beb14e6ba883c'),
    //     created_at: 1202018,
    //     x: 0,
    //     y: 0
    // }
    //
    // Pixel.create(newPixel, function(error, pixel) {
    //     if (error) { console.log(error); }
    //     else {
    //         return res.redirect('/');
    //     }
    // });
})

// cheap way to create fake data do not advise
router.get('/create-board/:name/:lat/:long/:radius', function(req, res, next) {
	var b = new Board({
		name: req.params.name,
		latitude: req.params.lat,
		longitude: req.params.long,
		radius: req.params.radius,
		unique_contributors: 0
	});
	b.save(function(err, b) {
		if (err) { console.log(err); }
		else {res.redirect('/dashboard'); }
	});
});

module.exports = router;
