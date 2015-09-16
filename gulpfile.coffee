gulp = require 'gulp'
browserSync = require('browser-sync')
sass = require('gulp-ruby-sass')
reload = browserSync.reload
postcss = require('gulp-postcss')
sourcemaps = require('gulp-sourcemaps')
autoprefixer = require('autoprefixer-core')
uglify = require('gulp-uglify')
coffee = require('gulp-coffee')
cssmin = require('gulp-cssmin')
rename = require('gulp-rename')
ejs = require("gulp-ejs")

gulp.task 'sass', ->
  return sass('app/scss/main.scss')
    .pipe( postcss([ autoprefixer(browsers: ['last 1 versions']) ]) )
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('app/css'))
    .pipe(reload({ stream: true }))

gulp.task 'coffee', ->
  return gulp.src('app/coffee/*.coffee')
    .pipe(coffee({bare: true}))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('app/js'))
    .pipe(reload({ stream: true }))

# watch files for changes and reload
gulp.task 'serve', ['sass', 'coffee'], ->
  browserSync({
    server: {
      baseDir: 'app'
    },
    port: 3030,
    browser: 'chromium-browser'
  })

  gulp.watch('app/scss/*.scss', ['sass'])
  gulp.watch('app/coffee/*.coffee', ['coffee'])
  gulp.watch(['*.html', 'js/**/*.js'], {cwd: 'app'}, reload)
