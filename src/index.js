/**
 * @Author: Zhengfeng.Yao <yzf>
 * @Date:   2017-05-03 15:53:34
 * @Last modified by:   yzf
 * @Last modified time: 2017-05-03 15:55:49
 */

import ExtractTextPlugin from 'extract-text-webpack-plugin'

import is from './is'

function loadTheme(theme) {
  if (is.String(theme)) {
    return require(theme)
  }
  if (is.Object(theme)) {
    return theme
  }
  return null
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
  const postcssLoader = {
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
  const lessLoader = {
    loader: 'less-loader',
    options: {
      sourceMap: is.Object(options) && !!options.sourceMap,
      modifyVars: is.Object(options) ? loadTheme(options.theme) : null
    }
  }

  if (options && options.withStyle) {
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
    return;
  }

  if (is.Object(options) && options.target === 'node') {
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
    return
  }
  if (is.Object(options) && !!options.extractCss) {
    config.add('plugin.ExtractText', new ExtractTextPlugin(is.String(options.extractCss) ? options.extractCss : '[name].css'))
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
    return
  }

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
