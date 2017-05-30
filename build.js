const omelet = require('C:/Users/reidm/Code/omelet/omelet/lib/omelet.js')
const fs = require('fs')
const path = require('path')
var _0777 = parseInt('0777', 8);

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

const chapters = [
    {
        inFile: "book-files/en/chapters/0-introduction.omelet",
        outFile: "public/en/chapters/0-introduction/index.html",
    },
    {
        inFile: "book-files/en/chapters/1-programming-without-code.omelet",
        outFile: "public/en/chapters/1-programming-without-code/index.html",
    },
    {
        inFile: "book-files/en/chapters/2-programming-for-web-part-one.omelet",
        outFile: "public/en/chapters/2-programming-for-web-part-one/index.html",
    },
    {
        inFile: "book-files/en/chapters/3-programming-for-web-part-two.omelet",
        outFile: "public/en/chapters/3-programming-for-web-part-two/index.html",
    },
    {
        inFile: "book-files/en/chapters/4-deep-dive-into-javascript.omelet",
        outFile: "public/en/chapters/4-deep-dive-into-javascript/index.html",
    },
]

for (let chapter of chapters) {
    const renderedChapter = omelet.renderFile(chapter.inFile, omeletOptions)
    mkdirpSync(path.dirname(chapter.outFile))
    fs.writeFileSync(chapter.outFile, renderedChapter, 'UTF-8')
}
