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

const projectFolder = "./dist/"
const sourceFolder = "./src/"

const filesFormat = {
  html: ".html",
  css: ".css",
  scss: ".scss",
  ts: ".ts",
  js: ".js",
  img: ".{jpg,jpeg,tif,tiff,png,svg,gif,ico,webp}",
  fonts: ".{otf,ttf,woff,woff2}",
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
    html: sourceFolder + "**/*" + filesFormat.html,
    scss: [sourceFolder + "scss/**/*" + filesFormat.scss, "!" + sourceFolder + "scss/fonts" + filesFormat.scss],
    ts: sourceFolder + "ts/**/*" + filesFormat.ts,
    img: sourceFolder + "img/**/*" + filesFormat.img,
    fonts: sourceFolder + "fonts/**/*" + filesFormat.fonts,
  }
}

let isBrowserLoaded = false
function loadBrowser(cb) {
  if (isBrowserLoaded == false) {
    isBrowserLoaded = true
    BrowserSynchronization.init({
      server: {
        baseDir: projectFolder
      },
      port: 3000,
      notify: false
    })
  }

  BrowserSynchronization.reload()
  cb()
}

function getFontParams(fontFileName) {
  let italic = "normal"
  let weight = 400

  if (fontFileName.toLowerCase().includes("italic")) {
    italic = "italic"
    fontFileName = fontFileName.replace(/italic/i, "")
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
  fontFileName = fontFileName.replace(/-*/g, "")

  return {
    italic: italic,
    weight: weight,
    fontName: fontFileName
  }
}

function cleanFolder() {
  return Delete(projectFolder)
}

function initProject(cb) {
  fs.mkdirSync(__dirname + "/src/ts")
  fs.mkdirSync(__dirname + "/src/fonts")
  fs.mkdirSync(__dirname + "/src/img")
  fs.mkdirSync(__dirname + "/src/parts")
  cb()
}

function observeFiles() {
  Gulp.watch(path.watch.html, Gulp.series(prepareHTML, loadBrowser))
  Gulp.watch(path.watch.scss, Gulp.series(prepareCSS, loadBrowser))
  Gulp.watch(path.watch.ts, Gulp.series(prepareJS, loadBrowser))
  Gulp.watch(path.watch.img, Gulp.series(prepareIMG, loadBrowser))
  Gulp.watch(path.watch.fonts, Gulp.series(prepareFONTS, prepareCSS, loadBrowser))
}

function prepareIMG() {
  return Gulp.src(path.watch.img)
    .pipe(GulpWebp({
      quality: 70,
    }))
    .pipe(Gulp.dest(path.build.img))
    .pipe(Gulp.src(path.watch.img))
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
}

function prepareFONTS() {
  return Gulp.src(path.src.fonts + "*" + filesFormat.fonts)
    .pipe(GulpFonter({
      formats: ['ttf']
    }))
    .pipe(Gulpttf2woff2())
    .pipe(GulpRename(function (path) {
      path.dirname = "./fonts"
      path.basename = path.basename.replace("fonts\\", "")
    }))
    .pipe(Gulp.dest(path.build.html))
}

function prepareJS() {
  return Gulp.src(path.watch.ts)
    .pipe(GulpTypeScript.createProject({
      target: "ESNEXT"
    })())
    .js
    .pipe(Gulp.dest(path.build.js))
}

function prepareCSS() {
  // підключаємо шрифти
  let fontFileContent = ``

  try {
    let listOfFonts = fs.readdirSync(path.build.fonts)

    if (listOfFonts.length !== 0) {
      listOfFonts.forEach(item => {
        if (item) {
          let fileName = item
          let fontParams = getFontParams(fileName)

          fontFileContent += `@include font("${fontParams.fontName}", "${fileName}", ${fontParams.weight}, "${fontParams.italic}");\n`
        }
      })

      fs.writeFileSync(path.src.scss + "/fonts.scss", fontFileContent)
    }
  } catch (error) { }

  return Gulp.src(path.src.scss + "style.scss")
    .pipe(GulpSASS({ outputStyle: "expanded" }))
    .pipe(GulpAutoprefixer({ cascade: true }))
    .pipe(GulpGroupMediaQueries())
    .pipe(Gulp.dest(path.build.css))
    .pipe(GulpCleanCSS())
    .pipe(GulpRename({ extname: ".min.css" }))
    .pipe(Gulp.dest(path.build.css))
}

function prepareHTML() {
  return Gulp.src([path.src.html + "/**/*" + filesFormat.html, "!" + path.src.html + "/**/_*" + filesFormat.html])
    .pipe(GulpFilesInclude({ prefix: "@@" }))
    .pipe(GulpWebpHTML())
    .pipe(Gulp.dest(path.build.html))
}

let build = Gulp.series(cleanFolder, Gulp.parallel(prepareFONTS, prepareIMG, prepareJS), prepareCSS, prepareHTML)
let watch = Gulp.series(build, loadBrowser, observeFiles)

exports.prepareFONTS = prepareFONTS
exports.prepareIMG = prepareIMG
exports.prepareJS = prepareJS
exports.prepareCSS = prepareCSS
exports.prepareHTML = prepareHTML

exports.initProject = initProject
exports.build = build
exports.watch = watch

exports.default = watch