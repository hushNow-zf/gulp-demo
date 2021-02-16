const {src, dest, parallel, series, watch } = require('gulp')

const del = require('del')
const browserSync = require('browser-sync')

const loadPlugins = require('gulp-load-plugins')
const { reload } = require('browser-sync')

const plugins = loadPlugins()
const bs = browserSync.create()

const data = {
    menus:[],
    pkg:require('./package.json'),
    data:new Date()
}

const clean = ()=>{
    return del(['dist','temp'])
}

const style = ()=>{
    return src('src/assets/styles/*.scss',{base:'src'})
        .pipe(plugins.sass({outputStyle:'expanded'}))
        .pipe(dest('temp'))
}

const script = ()=>{
    return src('src/assets/scripts/*.js',{base:'src'})
        .pipe(plugins.babel({presets:['@babel/preset-env']}))
        .pipe(dest('temp'))
}

const page = ()=>{
    return src('src/*.html',{base:'src'})
        .pipe(plugins.swig({data}))
        .pipe(dest('temp'))
}

const image = ()=>{
    return src('src/assets/images/**',{base:'src'})
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}

const font = ()=>{
    return src('src/assets/fonts/**',{base:'src'})
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}

const extra = ()=>{
    return src('public/**',{base:'public'})
        .pipe(dest('dist'))
}

const serve = ()=>{
    watch('src/assets/styles/*.scss', style)
    watch('src/assets/scripts/*.js', script)
    watch('src/*.html', page)
    // watch('src/assets/images/**', image)
    // watch('src/assets/fonts/**', font)
    // watch('public/**', extra)
    watch([
        'src/assets/images/**',
        'src/assets/fonts/**',
        'public/**'
    ],bs.reload)
    
    bs.init({
        notify:false,
        port:2080,
        files:'dist/**',
        server:{
            baseDir:['temp', 'src', 'public'],
            routes:{
                '/node_modules':'node_modules'
            }
        }
    })
}

// 第三方文件合并
const useref = ()=>{
    return src('temp/**.html',{base:'dist'})
        .pipe(plugins.useref({searchPath:['dist','.']}))
        // html css js
        .pipe(plugins.if(/\.js$/, plugins.uglify()))
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({
            collapseWhitespace:true,
            minifyCSS:true,
            minifyJS:true
        })))
        .pipe(dest('dist'))
}

const compile = parallel(style, script, page)

// 上线之前执行的任务
const build = series(
    clean,
    parallel(
        series(compile, useref),
        image,
        font,
        extra
    )
)

const develop = series(compile, serve)

module.exports = { clean, build, develop}