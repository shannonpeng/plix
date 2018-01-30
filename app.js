// Imports
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const MongoStore = require('connect-mongo')(session);

const debug = require('debug')('plix:server');

const index = require('./routes/index');
const users = require('./routes/users');

 const config = require('./config.js'); // Comment out for heroku

// Start HTTP Server
const app = express();

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = app.listen(port);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
  socket.on('room', function(room) {
    socket.join(room);
    socket.on('new-pixel', function(data){
      io.to(room).emit('new-pixel', data);
    });
  });
})

// Database setup
//mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/plix');
mongoose.connect(process.env.MONGOLAB_URI || config.MONGOLAB_URI);
var connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.on('connected', function() {
  console.log('database connected!');
});

// Create sessions
app.use(session({
    secret: process.env.SECRET || config.SECRET,
    resave: false,
    saveUninitialized: true,
    // store: new MongoStore({mongooseConnection: connection}),
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
const exphbs = require('express-handlebars');
const hbs = require('./hbhelpers.js')(exphbs);
app.engine('hbs', hbs.engine);
app.set('view engine', '.hbs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));

// body parser reads post requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/', users);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.back = req.header('Referer') || '/';

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Normalize port
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

// Event listener for HTTP server "error" event
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Event listener for HTTP server "listening" event
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = app;
