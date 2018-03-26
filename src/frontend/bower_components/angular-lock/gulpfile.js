/*!
governify-gateway 1.0.0, built on: 2018-03-27
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-gateway

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    ngAnnotate = require('gulp-ng-annotate'),
    sourceFiles = [
      'angular-lock.js'
    ];

gulp.task('build', function() {
  gulp.src(sourceFiles)
    .pipe(concat('angular-lock.js'))
    .pipe(ngAnnotate())
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename('angular-lock.min.js'))
    .pipe(gulp.dest('./dist'))
});

gulp.task('default', ['build']);
