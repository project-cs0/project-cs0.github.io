const nunjucks = require('nunjucks')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const currentDirectory = require('process').cwd() || ''

const getMetadata = (lang) => {
    return require(`./book-files/${lang}/metadata.json`)
}

const omeletOptions = {}

const metadata = getMetadata('en')

const toRender = metadata.chapters.concat([metadata.tableOfContents])

for (let item of toRender) {
    const rendered = nunjucks.render(item.inFile, {
        "metadata": metadata,
        "rootPath": currentDirectory,
    })

    mkdirp.sync(path.dirname(item.outFile))
    fs.writeFileSync(item.outFile, rendered, 'UTF-8')
}
