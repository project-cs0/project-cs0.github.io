const nunjucks = require('nunjucks')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const beautifier = require('js-beautify')
const sass = require('node-sass')

const languages = ['en']

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

for (let language of languages) {
    const metadata = require(`./book-files/${language}/metadata.json`)

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
        renderHtmlFile(
            `./book-files/${language}/chapters/${chapter.number}.njk`,
            `${language}/${chapter['out-file']}`, 
            {
                'metadata': metadata,
                'chapterMetadata': chapter
            })
    }

    // Render other pages
    const pageNames = [ 'table-of-contents', 'glossary', 'acknowledgements' ]
    for (let pageName of pageNames) {
        const pageMetadata = metadata[pageName]
        renderHtmlFile(
            `./book-files/${pageName}.njk`,
            `./${language}/${pageMetadata["out-file"]}`, 
            { 
                'metadata': metadata 
            })
    }
}

// Render CSS files
sass.render({
    file: './assets/scss/default.scss',
}, (err, result) => {
    if (err) return console.error(err)

    const renderedCss = [
        '/** NOTE: This file was auto-generated from SCSS. **/',
        '/** Do not modify this file directly. Instead, modify the corresponding SCSS file and recompile it. **/',
        '/** Any changes made directly to this file will be lost. **/',
        '',
        '',
    ].join("\n") + result.css.toString()

    fs.writeFileSync('./assets/css/default.css', renderedCss, 'UTF-8')
});

if (process.send) {
    process.send('online');
}