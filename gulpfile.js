const fs = require('fs')
const gulp = require('gulp')
const sass = require('gulp-sass')
const connect = require('gulp-connect')
const nunjucksRender = require('gulp-nunjucks-render')
const rename = require('gulp-rename')
const htmlBeautify = require('gulp-html-beautify')

const languages = ['en']
const pageNames = ['table-of-contents', 'glossary', 'acknowledgements']

const htmlTasks = []
const htmlBeautifyOptions = {
    'preserve_newlines': false,
}

const getMetadata = (language) => {
    const metadata = JSON.parse(
        fs.readFileSync(`./book-files/${language}/metadata.json`, 'utf8'));

    // Pre-process chapters so that each chapter has a reference to the previous/next chapter
    for (let i = 0; i < metadata.chapters.length; i++) {
        if (i -1 >= 0) {
            metadata.chapters[i].previous = metadata.chapters[i - 1]
        }

        if (i + 1 < metadata.chapters.length) {
            metadata.chapters[i].next = metadata.chapters[i + 1]
        }
    }

    return metadata
}

gulp.task('connect', () => {
    connect.server({
        root: '.',
        livereload: true
    })
})

for (let language of languages) {
    // Create build tasks for each chapter in this language
    for (let chapter of getMetadata(language).chapters) {
        const chapterTaskName = `buildchapter-${chapter.number}-${language}`
        htmlTasks.push(chapterTaskName)
        gulp.task(chapterTaskName, () => {
            return gulp.src(`book-files/${language}/chapters/${chapter.number}.njk`)
                .pipe(nunjucksRender({
                    path: 'book-files',
                    data: {
                        metadata: getMetadata(language),
                        chapterMetadata: chapter,
                    }
                }))
                .pipe(htmlBeautify(htmlBeautifyOptions))
                .pipe(rename(`/${language}/chapters/${chapter.number}/index.html`))
                .pipe(gulp.dest('.'))
        })
    }

    // Create build tasks for each other page in this language
    for (let pageName of pageNames) {
        const pageMetadata = getMetadata(language)[pageName]
        const pageTaskName = `buildpage-${pageName}-${language}`
        htmlTasks.push(pageTaskName)
        gulp.task(pageTaskName, () => {
            return gulp.src(`book-files/${pageName}.njk`)
                .pipe(nunjucksRender({
                    path: 'book-files',
                    data: {
                        metadata: getMetadata(language),
                    }
                }))
                .pipe(htmlBeautify(htmlBeautifyOptions))
                .pipe(rename(`/${language}/${pageMetadata['out-file']}`))
                .pipe(gulp.dest('.'))
        })
    }
}

gulp.task('sass', () => {
    return gulp.src('assets/scss/*.scss')
        .pipe(sass({ errLogToConsole: true }))
        .pipe(gulp.dest('assets/css'))
})

// NOTE: for this to work, you'll need the LiveReload browser
// extension: http://livereload.com/extensions/
gulp.task('livereload', () => {
    gulp.src('en/**/*')
        .pipe(connect.reload())
})

gulp.task('watch', () => {
    // For each language...
    for (let language of languages) {
        for (let chapter of getMetadata(language).chapters) {
            // Watch each chapter for changes, and rebuild each chapter when changed
            gulp.watch(`book-files/${language}/chapters/${chapter.number}.njk`, [`buildchapter-${chapter.number}-${language}`])
        }

        // When the metadata file is changed, rebuild all HTML files
        gulp.watch(`./book-files/${language}/metadata.json`, htmlTasks)
        
        // Watch for changes to compiled HTML; reload browser on change
        gulp.watch(`${language}/**/*`, ['livereload'])
    }
    
    // Watch each page for changes, and rebuild each page when changed
    gulp.watch('book-files/*.njk', htmlTasks)

    // Watch all .scss files for changes, and recompile them when changed
    gulp.watch('assets/scss/**/*.scss', ['sass'])

    // Watch assets for changes; reload browser on change
    gulp.watch('assets/**/*', ['livereload'])
})

// By default, running 'gulp' will start the server, build everything
// once, and then begin watching for changes
gulp.task('default', ['connect', 'watch', 'sass'].concat(htmlTasks))