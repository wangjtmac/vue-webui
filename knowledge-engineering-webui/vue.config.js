// let path = require('path');
// let glob = require('glob');


//配置pages多页面获取当前文件夹下的html和js
/*function getEntry(globPath, mainPath) {
    let entries = {},
        basename, tmp, pathname;
    glob.sync(globPath).forEach(function (entry) {
        // console.log(entry)
        basename = path.basename(entry, path.extname(entry));
        tmp = entry.split('/').splice(-3);
        pathname = basename; // 正确输出js和html的路径
        // console.log(tmp)
        entries[pathname] = {
            entry: mainPath + basename + '/main.js',
            template: tmp[1] + '/' + tmp[2],
            title: tmp[2],
            filename: tmp[2] ,
            chunks: ['chunk-vendors', 'chunk-common']
        };
    });
    return entries;
}*/
//let pages = getEntry('./public/*.html', 'src/projects/');
const IS_PROD = ['production', 'test'].includes(process.env.NODE_ENV);
//配置end
module.exports = {
    publicPath: '/',
    lintOnSave: false, //禁用eslint
    productionSourceMap: false,
    pages : {
        index: {
            // page 的入口
            entry: 'src/projects/Knowledge/main.js',
            // 模板来源
            template: 'public/index.html',
            // 在 dist/index.html 的输出
            filename: 'index.html',
            // 当使用 title 选项时，
            // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
            title: 'Knowledge',
            // 在这个页面中包含的块，默认情况下会包含
            // 提取出来的通用 chunk 和 vendor chunk。
            chunks: ['chunk-vendors', 'chunk-common', 'index']
        },
        todolist : {
            entry: 'src/projects/TodoList/main.js',
            template: 'public/todolist.html',
            filename: 'todolist.html',
            title: 'TodoList'
        }
    },
    pwa: {
        iconPaths: {
            favicon32: 'favicon.ico',
            favicon16: 'favicon.ico',
        }
    },
    assetsDir : 'assets',
    devServer: {
        index: './index.html', //默认启动serve 打开index页面
        disableHostCheck :true ,
        open: process.platform === 'darwin',
        //host: '',
        port: 8080,
        https: false,
        hotOnly: false,
        proxy: null, // 设置代理fest
        historyApiFallback: {
            rewrites: [
                {from: /^\/knowledge/, to: '/index.html'},
                {from: /^\/todolist/, to: '/todolist.html'},
            ]
        },

        before: app => {}
    },
    // css相关配置
    css: {
        extract: IS_PROD,
        // extract: true, // 是否使用css分离插件 ExtractTextPlugin
        sourceMap: false, // 开启 CSS source maps?
        loaderOptions: {
            less: {
                javascriptEnabled: true
            }
        }, // css预设器配置项
        modules: false // 启用 CSS modules for all css / pre-processor files.
    },
    // 是否为 Babel 或 TypeScript 使用 thread-loader。该选项在系统的 CPU 有多于一个内核时自动启用，仅作用于生产构建。
    //parallel: require('os').cpus().length > 1,

    /*chainWebpack: config => {
        config.module
            .rule('images')
            .use('url-loader')
            .loader('url-loader')
            .tap(options => {
                // 修改它的选项...
                options.limit = 100;
                return options
            });
        Object.keys(pages).forEach(entryName => {
            config.plugins.delete(`prefetch-${entryName}`);
        });
        if (process.env.NODE_ENV === "production") {
            config.plugin("extract-css").tap(() => [{
                path: path.join(__dirname, "./dist"),
                filename: "css/[name].[contenthash:8].css"
            }]);
        }

    },*/
    /*configureWebpack: config => {
        if (process.env.NODE_ENV === "production") {
            config.output = {
                path: path.join(__dirname, "./dist"),
                publicPath: "./",
                filename: "js/[name].[contenthash:8].js"
            };
        }
    }*/
}