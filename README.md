# My gulp

## prepareFONTS
    This task prepare fonts before using:
        - convert to one format: woff2
        - copy to the dist folder
 
## prepareIMG
    This task prepare images before using:
        - convert to format: webp
        - minify them 
        - copy to the dist folder
 
## prepareJS
    This task prepare scripts before using:
        - convert to format: js from ts
        - copy to the dist folder
 
## prepareCSS
    This task prepare styles before using:
        - convert to format: css from scss
        - conect fonts to the styles
        - copy to the dist folder

## prepareHTML
    This task prepare web pages before using:
        - conect all parts of the pages
        - copy to the dist folder
    

## build
    This task consist of all previus tasks and call them one by one to create folder "dist"

## wathc 
    This task is looking for changed files in the folder "src"
