var packageJson = require('./package.json'),
    gulp = require('gulp'),
    size = require('gulp-size'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    del = require('del');

var path = {};
path.root="./";
path.js = path.root + 'src/*.js';
path.build = './build';
path.example = [
    path.root + 'example/pure/www/lib/',
    path.root + 'example/giant/www/lib/'
];

gulp.task('clean', function (callback) {
    return del([path.build + '/*'], callback);
});

gulp.task('copy',function () {
    return gulp.src(path.build+'/*.js')
        .pipe(gulp.dest(path.example[0]))
        .pipe(gulp.dest(path.example[1]));
});

gulp.task('script', function() {
    var version  = packageJson.version;
     gulp.src(path.js)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(gulp.dest(path.build))
        .pipe(size())
        .pipe(uglify())
        .pipe(rename({ extname: '-'+version+'.min.js' }))
        .pipe(size())
        .pipe(gulp.dest(path.build));
});

gulp.task('watch', function () {
    gulp.watch([path.js], ['script']);
});

gulp.task('default', ['script','watch']);