const gulp = require('gulp')
const sass = require('gulp-sass')
const connect = require('gulp-connect')
const nunjucksRender = require('gulp-nunjucks-render')
const rename = require('gulp-rename')

const languages = ['en']
const pageNames = ['table-of-contents', 'glossary', 'acknowledgements']

const htmlTasks = []

gulp.task('connect', () => {
    connect.server({
        root: '.',
        livereload: true
    })
})

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

    // Create build tasks for each chapter in this language
    for (let chapter of metadata.chapters) {
        const chapterTaskName = `buildchapter-${chapter.number}-${language}`
        htmlTasks.push(chapterTaskName)
        gulp.task(chapterTaskName, () => {
            return gulp.src(`book-files/${language}/chapters/${chapter.number}.njk`)
                .pipe(nunjucksRender({
                    path: 'book-files',
                    data: {
                        metadata: metadata,
                        chapterMetadata: chapter,
                    }
                }))
                .pipe(rename(`/${language}/chapters/${chapter.number}/index.html`))
                .pipe(gulp.dest('.'))
        })
    }

    // Create build tasks for each other page in this language
    for (let pageName of pageNames) {
        const pageMetadata = metadata[pageName]
        const pageTaskName = `buildpage-${pageName}-${language}`
        htmlTasks.push(pageTaskName)
        gulp.task(pageTaskName, () => {
            return gulp.src(`book-files/${pageName}.njk`)
                .pipe(nunjucksRender({
                    path: 'book-files',
                    data: {
                        metadata: metadata,
                    }
                }))
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
    for (let language of languages) {
        const metadata = require(`./book-files/${language}/metadata.json`)
        for (let chapter of metadata.chapters) {
            gulp.watch(`book-files/${language}/chapters/${chapter.number}.njk`, [`buildchapter-${chapter.number}-${language}`])
        }
        for (let pageName of pageNames) {
            gulp.watch(`book-files/${pageName}.njk`, [`buildpage-${pageName}-${language}`])
        }
    }
    gulp.watch('assets/scss/**/*.scss', ['sass'])
    gulp.watch('en/**/*', ['livereload'])
    gulp.watch('assets/**/*', ['livereload'])
})

gulp.task('default', ['connect', 'watch', 'sass'].concat(htmlTasks))