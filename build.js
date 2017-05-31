const nunjucks = require('nunjucks')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const beautifier = require('js-beautify')

const beautifyHtml = (html) => {
    return beautifier.html(html, {
        "preserve_newlines": false
    })
}

const currentDirectory = require('process').cwd() || ''

const getMetadata = (lang) => {
    return require(`./book-files/${lang}/metadata.json`)
}

const omeletOptions = {}

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
    const rendered = beautifyHtml(nunjucks.render(chapter.inFile, {
        "metadata": metadata,
        "rootPath": currentDirectory,
        "chapterMetadata": chapter
    }))

    mkdirp.sync(path.dirname(chapter.outFile))
    fs.writeFileSync(chapter.outFile, rendered, 'UTF-8')
}

// Render other pages
for (let page of metadata.pages) {
    const rendered = beautifyHtml(nunjucks.render(page.inFile, {
        "metadata": metadata,
        "rootPath": currentDirectory,
    }))

    mkdirp.sync(path.dirname(page.outFile))
    fs.writeFileSync(page.outFile, rendered, 'UTF-8')
}

const tblOfContents = beautifyHtml(nunjucks.render(metadata.tableOfContents.inFile, {
    "metadata": metadata,
    "rootPath": currentDirectory,
}))

mkdirp.sync(path.dirname(metadata.tableOfContents.outFile))
fs.writeFileSync(metadata.tableOfContents.outFile, tblOfContents, 'UTF-8')
