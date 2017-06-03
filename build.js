const nunjucks = require('nunjucks')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const beautifier = require('js-beautify')
const sass = require('node-sass')

const publicFolder = 'docs'

const renderHtmlFile = (inFile, outFile, context) => {
    context = context || {}
    // Render & format the file contents
    const rendered = beautifier.html(
        nunjucks.render(inFile, context),
        {
            "preserve_newlines": false,
        })
    // Make sure the containing directory exists
    mkdirp.sync(path.dirname(outFile))
    // Write the contents to file
    fs.writeFileSync(outFile, rendered, 'UTF-8')
}

const getMetadata = (lang) => {
    return require(`./book-files/${lang}/metadata.json`)
}

const currentDirectory = '' // require('process').cwd() || ''

const metadata = getMetadata('en')

// Pre-process chapters so that each chapter has a reference to the previous/next chapter
for (let i = 0; i < metadata.chapters.length; i++) {
    if (i -1 >= 0) {
        metadata.chapters[i].previous = metadata.chapters[i - 1]
    }

    if (i + 1 < metadata.chapters.length) {
        metadata.chapters[i].next = metadata.chapters[i + 1]
    }
}

// Render chapters
for (let chapter of metadata.chapters) {
    renderHtmlFile(chapter.inFile, publicFolder + '/' + chapter.outFile, {
        "metadata": metadata,
        "rootPath": currentDirectory,
        "chapterMetadata": chapter
    })
}

// Render other pages
for (let page of metadata.pages) {
    renderHtmlFile(page.inFile, publicFolder + '/' + page.outFile, {
        "metadata": metadata,
        "rootPath": currentDirectory,
    })
}

// Render table of contents
renderHtmlFile(metadata.tableOfContents.inFile, publicFolder + '/' + metadata.tableOfContents.outFile, {
    "metadata": metadata,
    "rootPath": currentDirectory,
})

// Render CSS files
sass.render({
    file: './docs/assets/scss/default.scss',
}, (err, result) => {
    if (err) return console.error(err)

    const renderedCss = [
        '/** NOTE: This file was auto-generated from SCSS. **/',
        '/** Do not modify this file directly. Instead, modify the corresponding SCSS file and recompile it. **/',
        '/** Any changes made directly to this file will be lost. **/',
        '',
        '',
    ].join("\n") + result.css.toString()

    fs.writeFileSync('./docs/assets/css/default.css', renderedCss, 'UTF-8')
});
