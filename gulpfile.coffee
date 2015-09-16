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
gm = require('gulp-gm')
imagemin = require('gulp-imagemin')

gulp.task 'images', ['png', 'smallpng']

gulp.task 'png', ->
  return gulp.src('app/img/**/*')
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/img'))
    .pipe(reload({ stream: true }))

gulp.task 'smallpng', ->
  return gulp.src('app/img/**/*')
    .pipe(gm (gmfile) ->
      gmfile.resize(340)
    )
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(rename({suffix: '.small.min'}))
    .pipe(gulp.dest('dist/img'))
    .pipe(reload({ stream: true }))

gulp.task 'sass', ->
  return sass('app/scss/main.scss')
    .pipe( postcss([ autoprefixer(browsers: ['last 1 versions']) ]) )
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({ stream: true }))

gulp.task 'coffee', ->
  return gulp.src('app/coffee/*.coffee')
    .pipe(coffee({bare: true}))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/js'))
    .pipe(reload({ stream: true }))

gulp.task 'ejs', ->
  return gulp.src(['app/views/**/*.ejs', '!app/views/**/_*.ejs'])
    .pipe(ejs())
    .pipe(gulp.dest("./dist"))
    .pipe(reload({ stream: true }))

# watch files for changes and reload
gulp.task 'serve', ['sass', 'coffee'], ->
  browserSync({
    server: {
      baseDir: 'dist'
    },
    port: 3030,
    browser: 'chromium-browser'
  })

  gulp.watch('app/scss/**/*.scss', ['sass'])
  gulp.watch('app/coffee/**/*.coffee', ['coffee'])
  gulp.watch('app/views/**/*.ejs', ['ejs'])
  gulp.watch('app/img/**/*', ['images'])
  gulp.watch(['*.html', 'js/**/*.js', 'img/*'], {cwd: 'dist'}, reload)
