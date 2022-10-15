import gulp from "gulp";
import pug from "gulp-pug";
import imagemin from "gulp-imagemin";
import uglify from "gulp-uglify";
import babel from "gulp-babel";
import browsersync from "browser-sync";
import autoprefixer from "gulp-autoprefixer";
import cache from "gulp-cache";
import { deleteAsync } from 'del';
import plumber from "gulp-plumber";
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);



const browser = browsersync.create()
/* Options
 * ------ */
const options = {
  pug: {
    src: ["app/views/*.pug", "app/views/!blocks/**", "app/views/!layout/**"],
    all: "app/views/**/*.pug",
    dest: "public",
  },
  scripts: {
    src: "app/scripts/**/*.js",
    dest: "public/scripts",
  },
  styles: {
    src: "app/styles/**/*.scss",
    dest: "public/styles",
  },
  images: {
    src: "app/images/*.+(png|jpeg|jpg|gif|svg)",
    dest: "public/images",
  },
  fonts: {
    src: "app/fonts/*",
    dest: "public/fonts",
  },
  browserSync: {
    baseDir: "public",
  },
};

/* Browser-sync
 * ------------ */
export function browserSync(done) {
  browser.init({
    server: {
      baseDir: options.browserSync.baseDir,
    },
    port: 3000,
  });
  done();
}

// /* Styles
//  * ------ */

export function styles() {
  return gulp
    .src(options.styles.src)
    .pipe(
      plumber(function (err) {
        console.log("Styles Task Error");
        console.log(err);
        this.emit("end");
      })
    )
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false,
        grid: true,
      })
    )
    .pipe(gulp.dest(options.styles.dest))
    .pipe(
      browser.reload({
        stream: true,
      })
    );
}

// /* Scripts
//  * ------ */

export function scripts() {
  return gulp
    .src(options.scripts.src)
    .pipe(
      plumber(function (err) {
        console.log("Scripts Task Error");
        console.log(err);
        this.emit("end");
      })
    )
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest(options.scripts.dest))
    .pipe(
      browsersync.reload({
        stream: true,
      })
    );
}

// /* Views
//  * ------ */

export function views() {
  return gulp
    .src(options.pug.src)
    .pipe(
      plumber(function (err) {
        console.log("Pug Task Error");
        console.log(err);
        this.emit("end");
      })
    )
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(options.pug.dest))
    .pipe(
      browser.reload({
        stream: true,
      })
    );
}

// /* Images
//  * ------ */

export function images() {
  return gulp
    .src(options.images.src)
    .pipe(
      cache(
        imagemin({
          interlaced: true,
        })
      )
    )
    .pipe(gulp.dest(options.images.dest));
}

// /* Fonts
//  * ------ */

export function fonts() {
  return gulp.src(options.fonts.src).pipe(gulp.dest(options.fonts.dest));
}

// /* Clean up
//  * ------ */

export async function clean() {
  return Promise.resolve(deleteAsync("public"));
}

function watchFiles() {
  gulp.watch(options.pug.all, views);
  gulp.watch(options.styles.src, styles);
  gulp.watch(options.scripts.src, scripts);
  gulp.watch(options.images.src, images);
  gulp.watch(options.fonts.src, fonts);
}

// /* Build
//  * ------ */
export const build = gulp.series(
  clean,
  gulp.parallel(styles, views, scripts, images, fonts)
);
export const watch = gulp.parallel(watchFiles, browserSync);
