# MY GULP
This is an instrument for fast page making. It allows you to use JavaScript during programming.

## What can this instrument do?
It was created for automation routine work such as:

* Including parts of the **HTML** documents
* Converting **images** to the modern format `.webp` and minificating them
* Connecting images to the **HTML** documents using HTML5 syntax
* Converting **font** files to the modern format `.woff2` and connecting them *via css*
* Compiling **Sсss** files and minificating them
* Compiling **TypeScript** files

Also you can write JavaScript and don't carry about [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) because **MY GULP** creates a local server. As bonus this local server also allows you checking your work on different devices using your local network 

## Before using
Prepare your system before using this instrument: 
1. Download [NodeJS](https://nodejs.org/en/) - pay attention this project works with `v14.15.3`
2. Install **gulp-cli** package: 
``` Terminal
npm install gulp-cli -g
```

## The first loading
After preparing system run:
``` Terminal
npm install
gulp initProject
```
These commands load all dependencies and create folders for correct work.

## API
* prepareHTML
* prepareCSS
* prepareJS
* prepareFONTS
* prepareIMG
* watch
* build

#### PrepareHTML
This task gather parts of the  **HTML** files, finds `.webp` images and connects them.

``` Terminal
gulp prepareHTML
```
##### Example:
Part of the **HTML** document: `(./src/parts/_header.html)`:
```html
<h1>My Gulp</h1>
```
Main **HTML** document: `(./src/index.html)`:
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    @@include('./parts/_header.html')

    <img src="photo.jpg" alt="">
</body>

</html>
```
The result: `(./dist/index.html)`:
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <h1>My Gulp</h1>

    <picture>
        <source srcset="photo.webp" type="image/webp">
        <img src="photo.jpg" alt="">
    </picture>
</body>

</html>
```

> Pay attention! This instrument doesn't compile `_(file name).html` files. (It doesn't create folder `./dist/parts` with **HTML** files). These files are parts of the other files!

#### prepareCSS
This task compile **SCSS** files, minificate them and connect fonts to the **CSS**
```
gulp prepareCSS
```
##### Example:
FONT: `./dist/fonts/Roboto-Black.woff2`
SCSS: `./src/scss/style.scss`:
```Scss
//! Do not delete these imports. They are using for connecting fonts to the CSS
@import "variables";
@import "mixins";
@import "fonts";

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```

Result CSS: 
`./dist/css/style.css`
```CSS
@font-face {
  font-family: "Roboto";
  font-weight: 900;
  font-style: "normal";
  src: url("../fonts/Roboto-Black.woff2");
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

`./dist/css/style.min.css`
```CSS
@font-face{font-family:Roboto;font-weight:900;font-style:normal;src:url(../fonts/Roboto-Black.woff2)}*{margin:0;padding:0;box-sizing:border-box}
```
> Pay attention! Do not delete files:
* `./src/fonts.scss` - don't edit this file. Otherwise your fonts do not be connected to the project
* `./src/_mixins.scss` - you can edit this file, but do not edit ***@mixin font(...)...***.  Otherwise your fonts do not be connected to the project
#### prepareJS
This task compiles **TypeScript** to the last version of **JavaScript**.
```Terminal
gulp prepareJS
```
##### Example:
TS: `./src/ts/script.ts`
```typescript
let hello: string
hello = "Hello World!"

console.log(hello)
```

Result:
JS: `./dist/js/script.js`
```javascript
let hello;
hello = "Hello World!";
console.log(hello);
```
> Pay attention! If you want to write usual **JavaScript**, you have to write in the `.ts` files. (`.js` files are ignored. You can write usual **JavaScript** in the `.ts` files. It works fine.)
#### prepareFONTS
This task converts different fonts formats to the modern - `.woff2`.
```Terminal
gulp prepareFONTS
```
##### Example:
Before: `./src/fonts/Roboto-Black.ttf`
After: `./dist/fonts/Roboto-Black.woff2`
#### prepareIMG
This task minificates different types of the images and converts them to the modern format `.webp`
```Terminal
gulp prepareIMG
```
##### Example:
Before: `./src/img/photo.jpg`
After: `./dist/img/photo.jpg`, `./dist/img/photo.webp`
#### build
This task runs all previous commands for full building project
```Terminal
gulp build
```
The result: folder `./dist`
#### watch
This task runs command **build**, loads browser and monitors changes. If changes were found, my gulp would run some previous tasks and reload the browser.
```Terminal
gulp watch
```
or just
```Terminal
gulp
```

