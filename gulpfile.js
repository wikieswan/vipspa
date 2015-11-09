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
path.build = '../';
path.buildStyle = 'build/www/style/';

path.views = path.app + 'views/';
path.html = path.app + '**/*.html';
path.layout = path.views + 'layouts/layout.html'

path.scsspc  = path.app + 'scss.pc/**/*.scss';
path.scssh5  = path.app + 'scss.h5/**/*.scss';

path.scsspcBuild  = path.app + 'css/public/cashier-v1.0/pc/';
path.scssh5Build  = path.app + 'css/public/cashier-v1.0/h5/';

path.css   = path.app + 'css/';
path.js    = path.app + 'js/public/cashier-v1.0/**/*.js';
path.images= path.app + 'images/**/*.*';

path.copyFile = [
    path.app + 'lib/**/*.*'
];



/**
 * lazyload for js , html (use for prod env)
 * ----------------------------------------------------------------------------
 */
var lzHtml = lazypipe()
    .pipe(size)
    .pipe(minifyhtml);

var lzScript = lazypipe()
    .pipe(size)
    .pipe(uglify);



gulp.task('connect', function() {
    connect.server({
        root: 'www/',
        port: 9000,
        livereload: true
    });
});


// clean dist directory
gulp.task('clean', function (callback) {
    return del([path.build + '*'], callback);
});

// copy base files from src to dist
gulp.task('copy', function () {
    return gulp.src(path.copyFile, {base: path.root })
        .pipe(gulp.dest(path.build));
});

// gulp.task('html', function(){
//     gulp.src(path.html,{base: path.root })
//         .pipe(layout(path.layout))
//         .pipe(gulpif(argv.prod, lzHtml()))
//         .pipe(size())
//         .pipe(gulp.dest(path.build));
// });

gulp.task('script', function() {
     gulp.src(path.js,{base: path.root })
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(gulpif(argv.prod, lzScript()))
        //.pipe(size())
        //.pipe(gulp.dest(path.build));
});

gulp.task('uglify',function(){
    gulp.src(path.app+'js/public/zepto-touch.js')
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest(path.app+'js/public/'))

});

gulp.task('concat', function() {
  return gulp.src([
        path.app+'js/public/zepto-1.1.4.min.js',
        path.app+'js/public/fx.min.js', 
        path.app+'js/public/zepto-touch.min.js'
       ])
    .pipe(concat('zepto-1.1.4-touch-fx.js'))
    .pipe(gulp.dest(path.app+'js/public/'));
});

gulp.task('lint', function() {
     gulp.src(path.js)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
});

gulp.task('style', function() {
    gulp.start(['scsspc', 'scssh5']);
});

//sass build
gulp.task('scsspc', function() {
    gulp.src(path.scsspc)
        .pipe( plumber( {errorHandler : errrHandler} ) )
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest(path.scsspcBuild))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(size())
        .pipe(gulp.dest(path.scsspcBuild));
});

//sass build
gulp.task('scssh5', function() {
    gulp.src(path.scssh5)
        .pipe( plumber( {errorHandler : errrHandler} ) )
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest(path.scssh5Build))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(size())
        .pipe(gulp.dest(path.scssh5Build));
});


function errrHandler( e ){
    gutil.beep();
    gutil.log('===================',gutil.colors.cyan(e));
}

gulp.task('reload',function() {
    gulp.src([path.html,path.scsspc,path.scssh5,path.js])
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    //gulp.watch([path.html], ['html']);
    gulp.watch([path.scsspc], ['scsspc']);
    gulp.watch([path.scssh5], ['scssh5']);
    gulp.watch([path.js], ['script']);
    gulp.watch([path.html,path.scsspc,path.scssh5,path.js],['reload']);
});

gulp.task('build',function () {
    gulp.start(['copy_js', 'copy_html', 'copy_css', 'copy_img'], function() {
        gutil.log( gutil.colors.green('All Done!') );
    });
});


gulp.task('copy_js', function () {
    return gulp.src(path.app+'js/**/*.*',{base: path.app })
        .pipe(gulp.dest(path.build));
});
gulp.task('copy_html', function () {
    return gulp.src(path.app+'/**/*.html',{base: path.app })
        .pipe(gulp.dest(path.build));
});
gulp.task('copy_css', function () {
    return gulp.src(path.app+'css/**/*.*',{base: path.app })
        .pipe(gulp.dest(path.build));
});
gulp.task('copy_img', function () {
    return gulp.src(path.app+'img/**/*.*',{base: path.app })
        .pipe(gulp.dest(path.build));
});


gulp.task('serve', function() {
    gulp.start(['connect', 'watch']);
});

gulp.task('default', ['serve']);