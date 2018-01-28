// Imports
const express = require('express');
const session = require('express-session')
const User = require('../schemas/user.js');

const MongoStore = require('connect-mongo')(session);
const router = express.Router();

// GET register
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

// POST create new user
router.post('/register', function(req, res, next) {
    if (req.body.email && req.body.username && req.body.password) {
        var newUser = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            pixels: 1
        }

        User.find({ $or:[ {email : req.body.email }, { username : req.body.username } ] }, function(err, users){
            if (err) {console.log(err)}
            else if (users && users.length > 0) { // username or email already taken
                return res.render('register', { title: 'Register', error: 'Sorry, that username or email has already been taken'});
            }
            else { // create user if valid username and email
                User.create(newUser, function(error, user) {
                    if (error) {
                        console.log(error);
                        return next(error);
                    } else {
                        req.session.userId = user._id;
                        return res.redirect('/dashboard');
                    }
                });
            }
        });


    } else {
        var error = new Error('All fields required');
        error.status = 401;
        return next(error);
        console.log('throw a U DIDNT FILL OUT THE FORM');
    }
});

// GET login
router.get('/login', function(req, res, next){
    res.render('login', { title: 'Login' });
});

// POST login
router.post('/login', function(req, res, next) {
    if (req.body.username && req.body.password) {
        User.authenticate(req.body.username, req.body.password, function(err, user) {
            if (err || !user) {
                var error = new Error('Wrong username or password');
                error.status = 401;
                return next(error);
            } else {
                req.session.userId = user._id;
                return res.redirect('/dashboard')
            }
        });
    } else {
        var error = new Error('All fields required');
        error.status = 401;
        return next(error);
        console.log('jeez y didnt U FILL OUT THE FORM');
    }
});

// GET logout
router.get('/logout', function(req, res, next){
    if (req.session) {
        req.session.destroy(function(err){
            if (err) {
                console.log(err);
                return res.redirect('/');
            } else {
                return res.redirect('/');
            }
        });
    }
});

module.exports = router;
