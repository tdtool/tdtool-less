'use strict';

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

var _is = require('./is');

var _is2 = _interopRequireDefault(_is);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @Author: Zhengfeng.Yao <yzf>
 * @Date:   2017-05-03 15:53:34
 * @Last modified by:   yzf
 * @Last modified time: 2017-05-03 15:55:49
 */

function loadTheme(theme) {
  if (_is2.default.String(theme)) {
    return require(theme);
  }
  if (_is2.default.Object(theme)) {
    return theme;
  }
  return null;
}

var URL_LOADER_LIMIT = 10000;

function staticLoader(config, options) {
  config.add('rule.txt', {
    test: /\.txt$/,
    loader: 'raw-loader'
  });
  config.add('rule.woff', {
    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader',
    query: {
      limit: options && options.urlLoaderLimit ? options.urlLoaderLimit : URL_LOADER_LIMIT,
      minetype: 'application/font-woff'
    }
  });
  config.add('rule.woff2', {
    test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader',
    query: {
      limit: options && options.urlLoaderLimit ? options.urlLoaderLimit : URL_LOADER_LIMIT,
      minetype: 'application/font-woff'
    }
  });
  config.add('rule.ttf', {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader',
    query: {
      limit: options && options.urlLoaderLimit ? options.urlLoaderLimit : URL_LOADER_LIMIT,
      minetype: 'application/octet-stream'
    }
  });
  config.add('rule.eot', {
    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'file-loader'
  });
  config.add('rule.svg', {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader',
    query: {
      limit: options && options.urlLoaderLimit ? options.urlLoaderLimit : URL_LOADER_LIMIT,
      minetype: 'image/svg+xml'
    }
  });
  config.add('rule.IMAGE', {
    test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
    loader: 'url-loader',
    query: {
      limit: options && options.urlLoaderLimit ? options.urlLoaderLimit : URL_LOADER_LIMIT
    }
  });
}

module.exports = function (config, options) {
  staticLoader(config, options);
  var cssLoader = {
    loader: 'css-loader' + (_is2.default.Object(options) && options.target === 'node' ? '/locals' : ''),
    options: {
      sourceMap: _is2.default.Object(options) && !!options.sourceMap,
      modules: true,
      localIdentName: '[local]',
      minimize: _is2.default.Object(options) && options.target !== 'node' && !!options.minimize,
      discardComments: { removeAll: true }
    }
  };
  var postcssLoader = {
    loader: 'postcss-loader',
    options: {
      plugins: function plugins() {
        if (_is2.default.Object(options) && _is2.default.Array(options.postCss)) {
          return options.postCss;
        }
        return [require('postcss-nested')(), require('pixrem')(), require('autoprefixer')(_is2.default.Object(options) && _is2.default.Object(options.autoprefixer) ? options.autoprefixer : {
          browsers: ['Chrome >= 35', 'Firefox >= 31', 'Explorer >= 9', 'Opera >= 12', 'Safari >= 7.1']
        }), require('postcss-flexibility')(), require('postcss-discard-duplicates')()];
      }
    }
  };
  var lessLoader = {
    loader: 'less-loader',
    options: {
      sourceMap: _is2.default.Object(options) && !!options.sourceMap,
      modifyVars: _is2.default.Object(options) ? loadTheme(options.theme) : null
    }
  };

  if (_is2.default.Object(options) && options.target === 'node') {
    config.add('rule.less', {
      test: /\.less$/,
      use: [cssLoader, postcssLoader, lessLoader]
    });
    config.add('rule.css', {
      test: /\.css$/,
      use: [cssLoader, postcssLoader]
    });
    return;
  }
  if (_is2.default.Object(options) && !!options.extractCss) {
    config.add('plugin.ExtractText', new _extractTextWebpackPlugin2.default(_is2.default.String(options.extractCss) ? options.extractCss : '[name].css'));
    config.add('rule.less', {
      test: /\.less$/,
      use: _extractTextWebpackPlugin2.default.extract({
        fallback: 'style-loader',
        use: [cssLoader, postcssLoader, lessLoader]
      })
    });
    config.add('rule.css', {
      test: /\.css$/,
      use: _extractTextWebpackPlugin2.default.extract({
        fallback: 'style-loader',
        use: [cssLoader, postcssLoader]
      })
    });
    return;
  }

  config.add('rule.less', {
    test: /\.less$/,
    use: ['style-loader', cssLoader, postcssLoader, lessLoader]
  });
  config.add('rule.css', {
    test: /\.css$/,
    use: ['style-loader', cssLoader, postcssLoader]
  });
};
//# sourceMappingURL=index.js.map