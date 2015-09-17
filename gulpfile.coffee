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

gulp.task 'images', ['small-images', 'compress-images']

gulp.task 'raw', ->
  return gulp.src('app/raw/**/*')
    .pipe(gulp.dest('dist'))
    .pipe(reload({ stream: true }))

gulp.task 'compress-images', ->
  return gulp.src(['app/img/**/*.jpg', 'app/img/**/*.png'])
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/img'))
    .pipe(reload({ stream: true }))

gulp.task 'small-images', ->
  return gulp.src(['app/img/**/*.jpg', 'app/img/**/*.png'])
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

gulp.task 'js', ->
  return gulp.src('app/js/*.min.js')
    .pipe(gulp.dest('dist/js'))

gulp.task 'ejs', ->
  return gulp.src(['app/views/**/*.ejs', '!app/views/**/_*.ejs'])
    .pipe(ejs())
    .pipe(gulp.dest("./dist"))
    .pipe(reload({ stream: true }))

# watch files for changes and reload
gulp.task 'serve', ['sass', 'coffee', 'js', 'ejs', 'raw'], ->
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
