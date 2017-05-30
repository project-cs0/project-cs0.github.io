const omelet = require('C:/Users/reidm/Code/omelet/omelet/lib/omelet.js')
const fs = require('fs')
const path = require('path')
var _0777 = parseInt('0777', 8);

const getMetadata = (lang) => {
    return require(`./book-files/${lang}/metadata.json`)
}

// 101111

function mkdirpSync (p, opts, made) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }

    var mode = opts.mode;
    var xfs = opts.fs || fs;

    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;

    p = path.resolve(p);

    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = mkdirpSync(path.dirname(p), opts, made);
                mkdirpSync(p, opts, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = xfs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};

const omeletOptions = {}

const metadata = getMetadata('en')

const toRender = metadata.chapters.concat([metadata.tableOfContents])

for (let item of toRender) {
    const rendered = omelet.renderFile(
        item.inFile,
        {"metadata": metadata},
        omeletOptions)
        
    mkdirpSync(path.dirname(item.outFile))
    fs.writeFileSync(item.outFile, rendered, 'UTF-8')
}
