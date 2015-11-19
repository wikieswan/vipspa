var gulp = require('gulp'),
    connect = require('gulp-connect');
gulp.task('connect', function() {
    connect.server({
        root: 'www/',
        port: 10000,
        livereload: true
    });
});
gulp.task('default', ['connect']);
