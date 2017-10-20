var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css');


gulp.task('styles', function() {
    gulp.src(['scss/*'])
        .pipe(sass())
        .pipe(concat('main.css'))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('css'));
})

gulp.task('default', ['styles']);

