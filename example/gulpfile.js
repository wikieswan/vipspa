var gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    sh = require('shelljs'),
    plumber = require( 'gulp-plumber'),
    gulpif = require('gulp-if'),
    argv = require('yargs').argv,
    lazypipe = require('lazypipe'),
    size = require('gulp-size'),

    //serve
    connect = require('gulp-connect'),

    //css
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    minifyCss = require('gulp-minify-css'),

    //html
    layout = require('gulp-file-wrapper'),
    minifyhtml = require('gulp-minify-html'),

    //js
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),

    del = require('del');


var path = {};
path.root="./";
path.app = path.root + 'www/';
path.views = path.app + 'views/';
path.html = path.app + '**/*.html';
path.scss  = path.app + 'scss/**/*.scss';
path.css   = path.app + 'css/';
path.js    = path.app + 'js/**/*.js';


gulp.task('connect', function() {
    connect.server({
        root: 'www/',
        port: 10000,
        livereload: true
    });
});

gulp.task('script', function() {
     gulp.src(path.js,{base: path.root })
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
       
});


//sass build
gulp.task('style', function() {
    gulp.src(path.scss)
        .pipe( plumber( {errorHandler : errrHandler} ) )
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest(path.css))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(size())
        .pipe(gulp.dest(path.css));
});


function errrHandler( e ){
    gutil.beep();
    gutil.log('===================',gutil.colors.cyan(e));
}

gulp.task('reload',function() {
    gulp.src([path.html,path.scss,path.js])
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch([path.scss], ['style']);
    gulp.watch([path.js], ['script']);
    gulp.watch([path.html,path.scss,path.js],['reload']);
});


gulp.task('serve', function() {
    gulp.start(['connect', 'watch']);
});

gulp.task('default', ['serve']);

