// Imports
const express = require('express');
const router = express.Router();
const mongo = require('mongodb');

// Schemas
const User = require('../schemas/user');
const Board = require('../schemas/board');
const Pixel = require('../schemas/pixel');

// Configuration data
// const config = require('../config.js'); // Comment out for heroku

// Update unique contributors
function updateUnique(board){
    var contributors = []; // list of unique contributors
    Pixel.find({ board : board._id }, function(err, pixels) { // get contributors
        if (err) { console.log(err) }
        else if (pixels) {
            for (pixel of pixels) {
                if (contributors.indexOf(pixel.creator) <= -1 ){
                    contributors.push(pixel.creator); // only add contributor if we haven't counted them
                }
            }
            // now update for board
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

// Update your boards
function updateBoardsContributed(user){
    var myBoards = []
    Pixel.find({ creator : user._id }, function(err, pixels){ // get all pixels owned
        if (err) { console.log(err) }
        else if (pixels) {
            for (pixel of pixels) {
                if (myBoards.indexOf(pixel.board) <= -1){
                    myBoards.push(pixel.board); // only count unique boards
                }
            }
            user.boards = myBoards;
            user.save(function(err, data){
                console.log(data);
                if (err) { console.log(err) }
                else if (data) {
                    console.log('user boards saved');
                };
            });
        }
    });
}

// update your last pixel
function updateLastPixel(user, board){
    var now = (new Date).getTime(); // epoch milliseconds

    if (user.last_pixel_at != now){
        user.last_pixel_at = now;

        user.save(function(err, data){
            console.log(data);
            if (err) { console.log(err) }
            else if (data) {
                console.log('last user pixel saved');
            };
        });
    }

    if (board.last_pixel_at != now){
        board.last_pixel_at = now;

        board.save(function(err, data){
            console.log(data);
            if (err) { console.log(err) }
            else if (data) {
                console.log('last board pixel saved');
            };
        });
    }
}

// get username
function getUsername(userId, f){
    User.findOne({ _id: mongo.ObjectId(userId) }, function(err, user) {
        if (err) { console.log(err) }
        else if (user) {
            f(user.username, userId);
        }
        else {
            f("user-" + userId.substring(0, 6), userId);
        }
    });
}

// GET home page
router.get('/', function(req, res, next) {
    console.log('GET::index');
	if (req.session.userId) { res.redirect('/dashboard'); } // user logged in
	else { res.render('index'); } // render landing page
});

// GET profile
router.get('/profile', function(req, res, next) {
    console.log('GET::profile');
	if (req.session.userId) { // user logged in
		var userId = req.session.userId;
		User.findOne({ _id: mongo.ObjectId(userId) }).exec(function(err, user) {
			if (err) { console.log(err); }
			else if (user) { // user found
				var boards_contributed = [];
                if (user.boards.length == 0) {
                    res.render('profile', {
                        user: user,
                        boards: boards_contributed
                    }, function(err, data) {
                        if (err) { console.log(err); }
                        else { res.send(data); }
                    });
                }
                else {
                    Pixel.find({ board: { $in : user.boards }, creator : mongo.ObjectId(userId) }).sort({created_at: '-1'}).exec(function(err, pixels) {
                        if (err) { console.log(err); }
                        else if (pixels) {
                            // remove duplicates
                            var pixel_ids = {};
                            var unique_pixels = [];
                            for (var i = 0; i < pixels.length; i++) {
                                if (!(pixel_ids[pixels[i].board])) {
                                    pixel_ids[pixels[i].board] = 1;
                                    unique_pixels.push(pixels[i]);
                                    console.log(pixel_ids)
                                }
                            }
                            var j = 0;
                            while (j < unique_pixels.length) {
                                renderBoards(unique_pixels[j]);
                                j++;
                            }
                            function renderBoards(pixel) {
                                Board.findOne({ _id : mongo.ObjectId(pixel.board)}, function(err, board) {
                                    if (err) { console.log(err); }
                                    else if (board) {
                                        boards_contributed.push({ 'board' : board, 'pixel' : pixel });
                                        if (boards_contributed.length == user.boards.length) { // execute this after all boards have been collected
                                            boards_contributed.sort(function(a, b) { // sort again just to be sure
                                                return b.pixel.created_at - a.pixel.created_at;
                                            });
                                            res.render('profile', {
                                                user: user,
                                                boards: boards_contributed
                                            }, function(err, data) {
                                                if (err) { console.log(err); }
                                                else { res.send(data); }
                                            });
                                        }
                                    }
                                    else {
                                        console.log('no board found');
                                    }
                                });
                            }
                        }
                    });
                }
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
    console.log('GET::board');
    if (!req.session.userId) { res.redirect('/'); } // user not logged in
    else {
        var blocks = {};
        var raw_leaders = {};
        var leaders = {};
        var width = [];
        var height = [];
        var dup = [];
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
                            if (pixel.x == 61 & pixel.y == 75){
                              console.log(pixel);
                            }
                            if (!(dup[pixel.x.toString() + "-" + pixel.y.toString()])) {
                                blocks[pixel.x][pixel.y]['hex'] = pixel.hex;
                                dup[pixel.x.toString() + "-" + pixel.y.toString()] = 1;
                            }
                            else {
                              pixel.remove(function(err, data) {
                                if (err) { console.log(err); }
                                else { console.log("duplicate pixel deleted"); }
                              })
                            }

                            if ( raw_leaders[pixel.creator] != undefined ){
                                raw_leaders[pixel.creator] += 1;
                            }
                            else {
                                raw_leaders[pixel.creator] = 1;
                            }
                        }
                        if (Object.keys(raw_leaders).length == 0){
                          // get user
                          if (req.session.userId) {

                              var userId = req.session.userId;
                              User.findOne({ _id: mongo.ObjectId(userId) }, function(err, user) {
                                  if (err) { console.log(err); }
                                  else if (user) {
                                      res.render('board',
                                          {user: user,
                                          board: board,
                                          blocks: blocks,
                                          leaders: {},
                                          edit: true}
                                      );
                                  }
                                  else { // cannot find a user
                                      console.log('no user found with Id ' + userId);
                                      res.render('board',
                                          {user: null,
                                          board: board,
                                          leaders: leaders_array,
                                          edit: false}
                                      );
                                  }
                              });
                          }
                          else { // no user logged in
                              res.render('board',
                                  {user: null,
                                  board: board,
                                  leaders: leaders_array,
                                  edit: false}
                              );
                          }
                        }
                        else {
                            for (var key in raw_leaders) {
                                var x = getUsername(key, function(u, i) {
                                    leaders[u] = raw_leaders[i];

                                    if (Object.keys(raw_leaders).length == Object.keys(leaders).length) {
                                        // create leaders array
                                        var leaders_array = [];
                                        var keys = Object.keys(leaders);
                                        for (var i = 0; i < keys.length; i++) {
                                            var obj = {};
                                            obj.username = keys[i];
                                            obj.count = leaders[obj.username];
                                            leaders_array.push(obj);
                                        }
                                        // sort array
                                        leaders_array.sort(function(a, b) {
                                            return parseInt(b.count) - parseInt(a.count);
                                        });
                                        // trim array
                                        const LEADERS_LIMIT = 6;
                                        leaders_array = leaders_array.slice(0, LEADERS_LIMIT);

                                        // get user
                                        if (req.session.userId) {

                                            var userId = req.session.userId;
                                            User.findOne({ _id: mongo.ObjectId(userId) }, function(err, user) {
                                                if (err) { console.log(err); }
                                                else if (user) {
                                                    res.render('board',
                                                        {user: user,
                                                        board: board,
                                                        blocks: blocks,
                                                        leaders: leaders_array,
                                                        edit: true}
                                                    );
                                                }
                                                else { // cannot find a user
                                                    console.log('no user found with Id ' + userId);
                                                    res.render('board',
                                                        {user: null,
                                                        board: board,
                                                        leaders: leaders_array,
                                                        edit: false}
                                                    );
                                                }
                                            });
                                        }
                                        else { // no user logged in
                                            res.render('board',
                                                {user: null,
                                                board: board,
                                                leaders: leaders_array,
                                                edit: false}
                                            );
                                        }
                                    }
                                });
                            }
                        }
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

    console.log('POST::board');

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
		User.findOne({ _id: mongo.ObjectId(userId) }, function(err, user) {
			if (err) { console.log(err); }
            // found User
			else if (user) {
                // find Board
                Board.findOne({ _id: mongo.ObjectId(boardId) }, function(err, board) {
                    if (err) { console.log(err); }
                    // found Board
                    else if (board) {
                        // get POST data
                        if (req.body.x && req.body.y && req.body.hex && req.body.pos) {
                            var now = (new Date).getTime(); // epoch milliseconds

                            // Distance calculation
                            // https://stackoverflow.com/questions/1502590/calculate-distance-between-two-points-in-google-maps-v3
                            var rad = function(x) {
                              return x * Math.PI / 180;
                            };

                            var getDistance = function(p1, p2) {
                                var R = 6378137; // Earth’s mean radius in meter
                                var dLat = rad(p2.lat - p1.lat);
                                var dLong = rad(p2.lng - p1.lng);
                                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
                                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                var d = R * c;
                                return d; // returns the distance in meter
                            };

                            var d = getDistance(req.body.pos, { lat: board.latitude, lng: board.longitude });
                            if (d > board.radius) {
                                res.send("Sorry, you aren't in range to edit"); // not in range
                            }
                            else {
                                // find Pixel
                                Pixel.findOne({ x: req.body.x, y: req.body.y, board: mongo.ObjectId(boardId) }, function(err, pixel){
                                    if (err) { console.log(err); }

                                    // if a pixel exists, update
                                    else if (pixel) {
                                        updateUnique(board);
                                        updateBoardsContributed(user);
                                        updateLastPixel(user, board);

                                        pixel.hex = req.body.hex;
                                        pixel.creator = mongo.ObjectId(userId);
                                        pixel.created_at = now;

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
                                        updateUnique(board);
                                        updateBoardsContributed(user);
                                        updateLastPixel(user, board);

                                        var newPixel = {
                                            board: mongo.ObjectId(boardId),
                                            hex: req.body.hex,
                                            creator: mongo.ObjectId(userId),
                                            created_at: now,
                                            x: req.body.x,
                                            y: req.body.y
                                        }
                                        Pixel.create(newPixel, function(error, pixel) {
                                            console.log(pixel);
                                            if (error) {
                                                console.log(error);
                                                next(error);
                                            }
                                            else if (pixel) {
                                                res.send('pixel saved');
                                            }
                                        });
                                    }
                                });
                            }
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

// GET dashboard (map view)
router.get('/dashboard', function(req, res, next) {

    console.log('GET::dashboard');

    if (req.session.userId) { // user logged in
        var userId = req.session.userId;
        User.findOne({ _id: mongo.ObjectId(userId) }).exec(function(err, user) {
            if (err) { console.log(err); }
            else if (user) { // user found
                var target_board = null;
                if (req.originalUrl.indexOf('?') >= 0) {
                    target_board = {};
                    target_board.id = req.originalUrl.substring(req.originalUrl.indexOf('?') + 1, req.originalUrl.length); // load specific board
                    Board.findOne({ _id: mongo.ObjectId(target_board.id) }, function(err, board) {
                        if (err) { console.log(err); }
                        else if (board) {
                            target_board = board;
                            getAllBoards();
                        };
                    });
                }
                else {
                    getAllBoards();
                }
                function getAllBoards() {
                    Board.find({}).sort({ name: 1 }).exec(function(err, boards) { // retrieve all boards in database
                        if (err) { console.log(err); }
                        else if (boards) {
                            res.render('map', {
                                //api: config.MAP_API, // comment out for heroku
                                api: process.env.MAP_API, // comment out for local
                                user: user,
                                boards: boards,
                                target_board: target_board
                            }, function(err, data) {
                                if (err) { console.log(err); }
                                else { res.send(data); }
                            });
                        }
                    });
                }
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
