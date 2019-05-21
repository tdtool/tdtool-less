/**
 * @Author: Zhengfeng.Yao <yzf>
 * @Date:   2017-05-03 15:53:34
 * @Last modified by:   yzf
 * @Last modified time: 2017-05-03 15:55:49
 */

import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path'
import is from './is'
import fs from 'fs'
import { getPostCssOptions } from './postcss.config'
const pkg = require('../package.json')

function loadTheme(theme) {
  if (is.String(theme)) {
    return require(theme)
  }
  if (is.Object(theme)) {
    return theme
  }
  return null
}
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
function addHappyLoader(config, test ,name, loaders) {
  config.add(`rule.${name}`, {
    test,
    loader: 'happypack/loader',
    query: {id: `${name}Happy`}
  });
  config.add(`plugins.${name}Happy`, new HappyPack({
    id: `${name}Happy`,
    threadPool: happyThreadPool,
    loaders
  }))
}
exports.load = (config, options, wbpConfig) => {

  const isHappy = options && options.happypack === true;
  const exclude = options ? options.exclude : undefined;
  const include = options ? options.include : undefined;

  const cssLoader = {
    loader: `css-loader${is.Object(options) && options.target === 'node' ? '/locals' : ''}`,
    options: {
      sourceMap: is.Object(options) && !!options.sourceMap,
      modules: true,
      localIdentName: '[local]',
      minimize: is.Object(options) && options.target !== 'node' && !!options.minimize || wbpConfig.optimization.minimize,
      discardComments: { removeAll: true }
    }
  }
  let postcssLoader = {
    loader: 'postcss-loader',
    options: getPostCssOptions(options)
  }
  postcssLoader.options.config = {
    path: options.postcssPath || __dirname
  };
  const lessLoader = {
    loader: 'less-loader',
    options: {
      sourceMap: is.Object(options) && !!options.sourceMap,
      modifyVars: is.Object(options) ? loadTheme(options.theme) : null,
      javascriptEnabled: true
    }
  }
  wbpConfig.optimization.minimizer = (wbpConfig.optimization.minimizer || []).concat([
    new OptimizeCssAssetsPlugin({
      cssProcessor: require('cssnano'),
      cssProcessorOptions: {
        discardComments: {
          removeAll: true
        },
        autoprefixer: false, // 取消css前缀，postcss已添加有
        reduceIdents: false, // 取消@keyframes动画被改名
        zIndex: false // 取消重新计算zIndex
      },
      canPrint: true
    })
  ])

  if (options && options.withStyle) {
    if (isHappy) {
      addHappyLoader(config, /\.less$/ , 'less', [
        'isomorphic-style-loader',
        cssLoader,
        postcssLoader,
        lessLoader
      ])
      addHappyLoader(config, /\.css$/, 'css', [
        'isomorphic-style-loader',
        cssLoader,
        postcssLoader
      ])
    } else {
      config.add('rule.less', {
        test: /\.less$/,
        include,
        exclude,
        use: [
          'isomorphic-style-loader',
          cssLoader,
          postcssLoader,
          lessLoader
        ]
      })
      config.add('rule.css', {
        test: /\.css$/,
        include,
        exclude,
        use: [
          'isomorphic-style-loader',
          cssLoader,
          postcssLoader
        ]
      })
    }
    return;
  }

  if (is.Object(options) && options.target === 'node') {
    if (isHappy) {
      addHappyLoader(config, /\.less$/ , 'less', [
        cssLoader,
        postcssLoader,
        lessLoader
      ])
      addHappyLoader(config, /\.css/ , 'css', [
        cssLoader,
        postcssLoader
      ])
    } else {
      config.add('rule.less', {
        test: /\.less$/,
        include,
        exclude,
        use: [
          cssLoader,
          postcssLoader,
          lessLoader
        ]
      })
      config.add('rule.css', {
        test: /\.css$/,
        include,
        exclude,
        use: [
          cssLoader,
          postcssLoader
        ]
      })
    }
    return
  }
  if (is.Object(options)) {
    config.add('plugin.MiniCssExtractPlugin', new MiniCssExtractPlugin(is.Object(options.extractCss) ? {
      filename: options.extractCss.filename || '[name].css',
      // chunkFilename: options.extractCss.chunkFilename || '[id].css'
    } : {
      filename: is.String(options.extractCss) ? options.extractCss : '[name].css',
      // chunkFilename: "[id].css"
    }))
    if (isHappy) {
      config.add('rule.less', {
        test: /\.less$/,
        include,
        exclude,
        loader: [MiniCssExtractPlugin.loader, 'happypack/loader?id=lessHappy']
      })

      config.add('plugins.lessHappy', new HappyPack({
        id: 'lessHappy',
        loaders: [
          cssLoader,
          postcssLoader,
          lessLoader
        ],
        threadPool: happyThreadPool
      }))

      config.add('rule.css', {
        test: /\.css$/,
        include,
        exclude,
        loader: [MiniCssExtractPlugin.loader, 'happypack/loader?id=cssHappy']
      })
      config.add('plugins.cssHappy', new HappyPack({
        id: 'cssHappy',
        loaders: [
          cssLoader,
          postcssLoader
        ],
        threadPool: happyThreadPool
      }))
    } else {
      config.add('rule.less', {
        test: /\.less$/,
        include,
        exclude,
        use: [
          MiniCssExtractPlugin.loader,
          cssLoader,
          postcssLoader,
          lessLoader
        ]
      })
      config.add('rule.css', {
        test: /\.css$/,
        include,
        exclude,
        use: [
          MiniCssExtractPlugin.loader,
          cssLoader,
          postcssLoader
        ]
      })
    }
    return
  }
  if (isHappy) {
    addHappyLoader(config, /\.less$/ , 'less', [
      'style-loader',
      cssLoader,
      postcssLoader,
      lessLoader
    ])
    addHappyLoader(config, /\.css/ , 'css', [
      'style-loader',
      cssLoader,
      postcssLoader
    ])
  } else {
    config.add('rule.less', {
      test: /\.less$/,
      include,
      exclude,
      use: [
        'style-loader',
        cssLoader,
        postcssLoader,
        lessLoader
      ]
    })
    config.add('rule.css', {
      test: /\.css$/,
      include,
      exclude,
      use: [
        'style-loader',
        cssLoader,
        postcssLoader
      ]
    })
  }
}
