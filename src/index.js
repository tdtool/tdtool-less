/**
 * @Author: Zhengfeng.Yao <yzf>
 * @Date:   2017-05-03 15:53:34
 * @Last modified by:   yzf
 * @Last modified time: 2017-05-03 15:55:49
 */

import ExtractTextPlugin from 'extract-text-webpack-plugin'
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import path from 'path'
import is from './is'
import fs from 'fs'
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
    loader: `HappyPack/loader?id=${name}Happy`,
  });
  config.add(`plugins.${name}Happy`, new HappyPack({
    id: `${name}Happy`,
    cache: true,
    threadPool: happyThreadPool,
    loaders
  }))
}
module.exports = (config, options) => {
  const cssLoader = {
    loader: `css-loader${is.Object(options) && options.target === 'node' ? '/locals' : ''}`,
    options: {
      sourceMap: is.Object(options) && !!options.sourceMap,
      modules: true,
      localIdentName: '[local]',
      minimize: is.Object(options) && options.target !== 'node' && !!options.minimize,
      discardComments: { removeAll: true }
    }
  }
  let postcssLoader = {
    loader: 'postcss-loader',
    options: {
      plugins: () => {
        if (is.Object(options) && is.Array(options.postCss)) {
          return options.postCss
        }
        return [
          require('postcss-nested')(),
          require('pixrem')(),
          require('autoprefixer')(is.Object(options) && is.Object(options.autoprefixer) ? options.autoprefixer : {
            browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8']
          }),
          require('postcss-flexibility')(),
          require('postcss-discard-duplicates')()
        ]
      }
    }
  }

  if (options.happlyPack) {
    postcssLoader.options.path = options.happlyPack.postcssPath || process.cwd();
    if (!fs.existsSync(path.join(postcssLoader.options.path, 'postcss.config.js'))) {
      throw ('Can’t find postcss.config.js. Happypack must use postcss configuration file ');
      process.exit(1);
    }
  }
  const lessLoader = {
    loader: 'less-loader',
    options: {
      sourceMap: is.Object(options) && !!options.sourceMap,
      modifyVars: is.Object(options) ? loadTheme(options.theme) : null
    }
  }

  config.add('plugin.OptimizeCssAssetsPlugin', new OptimizeCssAssetsPlugin({
    cssProcessorOptions: {
      discardComments: { removeAll: true },
      safe: true
    }
  }))


  if (options && options.withStyle) {
    if (options.happlyPack) {
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
        use: [
          'isomorphic-style-loader',
          cssLoader,
          postcssLoader,
          lessLoader
        ]
      })
      config.add('rule.css', {
        test: /\.css$/,
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
    if (options.happlyPack) {
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
        use: [
          cssLoader,
          postcssLoader,
          lessLoader
        ]
      })
      config.add('rule.css', {
        test: /\.css$/,
        use: [
          cssLoader,
          postcssLoader
        ]
      })
    }
    return
  }
  if (is.Object(options) && !!options.extractCss) {
    config.add('plugin.ExtractText', new ExtractTextPlugin((is.String(options.extractCss) || is.Object(options.extractCss)) ? options.extractCss : '[name].css'))
    if (options.happlyPack) {

      config.add('rule.less', {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'happypack/loader?id=lessHappy'
        })
      })

      config.add('plugins.lessHappy', new HappyPack({
        id: 'lessHappy',
        loaders: [
          cssLoader,
          postcssLoader,
          lessLoader
        ],
        threadPool: happyThreadPool,
        cache: true,
      }))

      config.add('rule.css', {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'happypack/loader?id=cssHappy'
        })
      })
      config.add('plugins.cssHappy', new HappyPack({
        id: 'cssHappy',
        loaders: [
          cssLoader,
          postcssLoader
        ],
        threadPool: happyThreadPool,
        cache: true,
      }))
    } else {
      config.add('rule.less', {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            cssLoader,
            postcssLoader,
            lessLoader
          ]
        })
      })
      config.add('rule.css', {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            cssLoader,
            postcssLoader
          ]
        })
      })
    }
    return
  }
  if (options.happlyPack) {
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
      use: [
        'style-loader',
        cssLoader,
        postcssLoader,
        lessLoader
      ]
    })
    config.add('rule.css', {
      test: /\.css$/,
      use: [
        'style-loader',
        cssLoader,
        postcssLoader
      ]
    })
  }
}
