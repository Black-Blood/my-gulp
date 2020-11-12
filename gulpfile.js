const fs = require("fs")
const Gulp = require("gulp")
const GulpSASS = require("gulp-sass")
const GulpGroupMediaQueries = require("gulp-group-css-media-queries")
const GulpCleanCSS = require("gulp-clean-css")
const GulpTypeScript = require("gulp-typescript")
const GulpImageOptimization = require("gulp-imagemin")
const GulpWebp = require("gulp-webp")
const GulpWebpHTML = require("gulp-webp-html")
const GulpFonter = require("gulp-fonter")
const GulpAutoprefixer = require("gulp-autoprefixer")
const GulpFilesInclude = require("gulp-file-include")
const GulpRename = require("gulp-rename")
const Gulpttf2woff2 = require("gulp-ttf2woff2")
const Delete = require("del")
const BrowserSynchronization = require("browser-sync").create()

const projectFolder = __dirname + "/dist/"
const sourceFolder = __dirname + "/src/"

const options = {
  filesFormat: {
    html: ".html",
    css: ".css",
    scss: ".scss",
    ts: ".ts",
    js: ".js",
    img: ".{jpg,png,svg,gif,ico,webp}",
    fonts: ".{otf,ttf,woff,woff2}",
  }
}

const path = {
  build: {
    html: projectFolder,
    css: projectFolder + "css/",
    js: projectFolder + "js/",
    img: projectFolder + "img/",
    fonts: projectFolder + "fonts/"
  },
  src: {
    html: sourceFolder,
    scss: sourceFolder + "scss/",
    ts: sourceFolder + "ts/",
    img: sourceFolder + "img/",
    fonts: sourceFolder + "fonts/"
  },
  watch: {
    html: sourceFolder + "/*" + options.filesFormat.html,
    scss: sourceFolder + "scss/style" + options.filesFormat.scss,
    ts: sourceFolder + "ts/**/*" + options.filesFormat.ts,
    img: sourceFolder + "img/**/*" + options.filesFormat.img,
  }
}

//! Шрифти
function getFontParams(fontFileName) {
  let italic = "normal"
  let weight = 400

  if (fontFileName.toLowerCase().includes("italic")) {
    italic = "italic"
    fontFileName = fontFileName.replace(/italic/g, "")
  }

  let fontWeaightArray = [
    "thin",
    "extra-light",
    "light",
    "regular",
    "medium",
    "semi-bold",
    "bold",
    "extra-bold",
    "black"
  ]

  for (let i = 1; i < 10; i++) {
    if (fontFileName.toLowerCase().includes(fontWeaightArray[i - 1])) {
      weight = 100 * i
      let wordPosition = fontFileName.toLowerCase().indexOf(fontWeaightArray[i - 1])

      fontFileName = fontFileName.slice(0, wordPosition) + fontFileName.slice(fontWeaightArray[i - 1].length + wordPosition)
      break
    }
  }

  fontFileName = fontFileName.replace(".woff2", "")

  let lastChar = fontFileName.slice(-1)
  if (/^[^a-zA-Z]$/g.test(lastChar)) {
    fontFileName = fontFileName.slice(0, -1)
  }

  return {
    italic: italic,
    weight: weight,
    fontName: fontFileName
  }
}

function prepareFONTS() {
  return Gulp.src(path.src.fonts + "*" + options.filesFormat.fonts)
    .pipe(GulpFonter({
      formats: ['ttf']
    }))
    .pipe(Gulpttf2woff2())
    .pipe(GulpRename(function (path) {
      path.dirname = "./fonts"
      path.basename = path.basename.replace("fonts\\", "")
    }))
    .pipe(Gulp.dest(path.build.html))
    .pipe(BrowserSynchronization.stream())
}

//! Картинки
function prepareIMG() {
  return Gulp.src(path.watch.img)
    .pipe(GulpWebp({
      quality: 70,
    }))
    .pipe(Gulp.dest(path.build.img))
    .pipe(Gulp.src(path.src.img))
    .pipe(GulpImageOptimization([
      GulpImageOptimization.gifsicle(),
      GulpImageOptimization.mozjpeg({ quality: 75, progressive: true }),
      GulpImageOptimization.optipng({ optimizationLevel: 4 }),
      GulpImageOptimization.svgo({
        plugins: [
          { removeViewBox: false }
        ]
      })
    ]))
    .pipe(Gulp.dest(path.build.img))
    .pipe(BrowserSynchronization.stream())
}

//! JS
function prepareJS() {
  return Gulp.src(path.watch.ts)
    .pipe(GulpTypeScript.createProject({
      target: "ESNEXT"
    })())
    .js
    .pipe(Gulp.dest(path.build.js))
    .pipe(BrowserSynchronization.stream())
}


//! CSS
function prepareCSS() {
  // підключаємо шрифти
  let fontFileContent = ``
  let listOfFonts = fs.readdirSync(path.build.fonts)

  if (listOfFonts.length !== 0) {
    listOfFonts.forEach(item => {
      if (item) {
        let fileName = item
        let fontParams = getFontParams(fileName)

        console.log(fontParams);

        fontFileContent += `@include font("${fontParams.fontName}", "${fileName}", ${fontParams.weight}, "${fontParams.italic}");\n`
      }
    })
  }

  fs.writeFileSync(path.src.scss + "fonts.scss", fontFileContent)

  return Gulp.src(path.watch.scss)
    .pipe(GulpSASS({ outputStyle: "expanded" }))
    .pipe(GulpAutoprefixer({ cascade: true }))
    .pipe(GulpGroupMediaQueries())
    .pipe(Gulp.dest(path.build.css))
    .pipe(GulpCleanCSS())
    .pipe(GulpRename({ extname: ".min.css" }))
    .pipe(Gulp.dest(path.build.css))
    .pipe(BrowserSynchronization.stream())
}

//! HTML
function prepareHTML() {
  return Gulp.src(path.src.html)
    .pipe(GulpFilesInclude({ prefix: "@@" }))
    .pipe(GulpWebpHTML())
    .pipe(Gulp.dest(path.build.html))
    .pipe(BrowserSynchronization.stream())
}

function synchronization() {
  BrowserSynchronization.init({
    server: {
      baseDir: "./" + projectFolder + "/"
    },
    port: 3000,
    notify: false
  })
}

function observeFiles() {
  Gulp.watch([path.watch.html], prepareHTML)
  Gulp.watch([path.watch.scss], prepareCSS)
  Gulp.watch([path.watch.ts], prepareJS)
  Gulp.watch([path.watch.img], prepareIMG)
}

function cleanFolder() {
  return Delete(projectFolder)
}


let build = Gulp.series(cleanFolder, prepareFONTS, prepareIMG, prepareJS, prepareCSS, prepareHTML)
let watch = Gulp.series(build, Gulp.parallel(synchronization, observeFiles))

exports.prepareHTML = prepareHTML
exports.prepareCSS = prepareCSS
exports.prepareJS = prepareJS
exports.prepareIMG = prepareIMG
exports.prepareFONTS = prepareFONTS

exports.build = build
exports.watch = watch

exports.default = watch