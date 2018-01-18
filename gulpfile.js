var gulp = require('gulp');
var pump = require('pump');
var sass = require('gulp-sass');
var exec = require('child_process').exec;

function runCommand(command) {
  return function (cb) {
    exec(command, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  }
}

//Running mongo
//https://stackoverflow.com/a/28048696/46810
gulp.task('mongod', runCommand('mongod'));
gulp.task('mongo-plix', runCommand('mongo plix'));
gulp.task('db', ['mongod', 'mongo-plix']);

gulp.task('stop', runCommand('mongo admin --eval "db.shutdownServer();"'));
gulp.task('run', runCommand('nodemon'));

gulp.task('sass', function(){
	return gulp.src('scss/**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('public/stylesheets'));
});

gulp.task('build', ['sass'], function (cb) {});

gulp.task('stream', ['db', 'build', 'run'], function (cb) {
	gulp.watch('scss/**/*.scss', ['build']);
});

gulp.task('default', ['stream']);
