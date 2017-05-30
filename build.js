const omelet = require('C:/Users/reidm/Code/omelet/omelet/lib/omelet.js')
const nunjucks = require('nunjucks')
const fs = require('fs')
const path = require('path')

const currentDirectory = require('process').cwd() || ''

const getMetadata = (lang) => {
    return require(`./book-files/${lang}/metadata.json`)
}

const omeletOptions = {}

const metadata = getMetadata('en')

const toRender = metadata.chapters.concat([metadata.tableOfContents])

for (let item of toRender) {
    const rendered = omelet.renderFile(
        item.inFile,
        { "metadata": metadata, "rootPath": currentDirectory },
        omeletOptions)

    mkdirpSync(path.dirname(item.outFile))
    fs.writeFileSync(item.outFile, rendered, 'UTF-8')
}
