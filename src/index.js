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

const URL_LOADER_LIMIT = 10000

function staticLoader(config, options) {
  config.add('rule.txt', {
    test: /\.txt$/,
    loader: 'raw-loader'
  })
  config.add('rule.woff', {
    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader',
    query: {
      limit: options && options.urlLoaderLimit ? options.urlLoaderLimit : URL_LOADER_LIMIT,
      minetype: 'application/font-woff'
    }
  })
  config.add('rule.woff2', {
    test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader',
    query: {
      limit: options && options.urlLoaderLimit ? options.urlLoaderLimit : URL_LOADER_LIMIT,
      minetype: 'application/font-woff'
    }
  })
  config.add('rule.ttf', {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader',
    query: {
      limit: options && options.urlLoaderLimit ? options.urlLoaderLimit : URL_LOADER_LIMIT,
      minetype: 'application/octet-stream'
    }
  })
  config.add('rule.eot', {
    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'file-loader'
  })
  config.add('rule.svg', {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader',
    query: {
      limit: options && options.urlLoaderLimit ? options.urlLoaderLimit : URL_LOADER_LIMIT,
      minetype: 'image/svg+xml'
    }
  })
  config.add('rule.IMAGE', {
    test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
    loader: 'url-loader',
    query: {
      limit: options && options.urlLoaderLimit ? options.urlLoaderLimit : URL_LOADER_LIMIT
    }
  })
}

module.exports = (config, options) => {
  staticLoader(config, options)
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
            browsers: [
              'Chrome >= 35',
              'Firefox >= 31',
              'Explorer >= 9',
              'Opera >= 12',
              'Safari >= 7.1'
            ]
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
